using TaskManagement.Domain.Enums;

namespace TaskManagement.Domain.Services;

/// <summary>
/// Strategy Pattern: encapsula a regra de quais transições de status de tarefa são permitidas,
/// isolando essa política do resto do domínio para permitir trocar/estender a regra sem alterar a entidade Tarefa.
/// </summary>
public interface IStatusTransitionStrategy
{
    bool PodeTransicionar(StatusTarefa statusAtual, StatusTarefa novoStatus);
}
