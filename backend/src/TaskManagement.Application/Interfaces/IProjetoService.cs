using TaskManagement.Application.DTOs;

namespace TaskManagement.Application.Interfaces;

public interface IProjetoService
{
    Task<IReadOnlyList<ProjetoDto>> ListarAsync(CancellationToken ct = default);
    Task<ProjetoDto> ObterPorIdAsync(int id, CancellationToken ct = default);
    Task<ProjetoDto> CriarAsync(CriarProjetoRequest request, CancellationToken ct = default);
    Task<ProjetoDto> AtualizarAsync(int id, AtualizarProjetoRequest request, CancellationToken ct = default);
    Task ExcluirAsync(int id, CancellationToken ct = default);
}
