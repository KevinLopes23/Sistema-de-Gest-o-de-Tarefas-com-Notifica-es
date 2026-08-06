using TaskManagement.Application.DTOs;

namespace TaskManagement.Application.Interfaces;

public interface ITarefaService
{
    Task<IReadOnlyList<TarefaDto>> ListarAsync(TarefaFiltroRequest filtro, CancellationToken ct = default);
    Task<TarefaDto> ObterPorIdAsync(int id, CancellationToken ct = default);
    Task<TarefaDto> CriarAsync(CriarTarefaRequest request, CancellationToken ct = default);
    Task<TarefaDto> AtualizarAsync(int id, AtualizarTarefaRequest request, CancellationToken ct = default);
    Task<TarefaDto> AlterarStatusAsync(int id, AlterarStatusTarefaRequest request, CancellationToken ct = default);
    Task ExcluirAsync(int id, CancellationToken ct = default);
}
