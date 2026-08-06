using TaskManagement.Application.DTOs;

namespace TaskManagement.Application.Interfaces;

public interface IUsuarioService
{
    Task<IReadOnlyList<UsuarioDto>> ListarAsync(CancellationToken ct = default);
}
