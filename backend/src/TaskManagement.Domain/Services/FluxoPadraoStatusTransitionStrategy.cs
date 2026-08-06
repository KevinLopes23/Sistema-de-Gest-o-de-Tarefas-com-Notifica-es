using TaskManagement.Domain.Enums;

namespace TaskManagement.Domain.Services;

/// <summary>
/// Implementação padrão da regra de negócio: "Status de tarefa só pode seguir o fluxo:
/// Pendente → Em Andamento → Concluída". O cancelamento é tratado como uma saída válida
/// a partir de Pendente ou Em Andamento (uma tarefa concluída ou já cancelada não pode mudar de estado).
/// </summary>
public class FluxoPadraoStatusTransitionStrategy : IStatusTransitionStrategy
{
    private static readonly Dictionary<StatusTarefa, StatusTarefa[]> TransicoesPermitidas = new()
    {
        [StatusTarefa.Pendente] = new[] { StatusTarefa.EmAndamento, StatusTarefa.Cancelada },
        [StatusTarefa.EmAndamento] = new[] { StatusTarefa.Concluida, StatusTarefa.Cancelada },
        [StatusTarefa.Concluida] = Array.Empty<StatusTarefa>(),
        [StatusTarefa.Cancelada] = Array.Empty<StatusTarefa>()
    };

    public bool PodeTransicionar(StatusTarefa statusAtual, StatusTarefa novoStatus)
    {
        if (statusAtual == novoStatus) return false;
        return TransicoesPermitidas.TryGetValue(statusAtual, out var permitidos) && permitidos.Contains(novoStatus);
    }
}
