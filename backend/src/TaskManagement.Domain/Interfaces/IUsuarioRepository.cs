using TaskManagement.Domain.Entities;

namespace TaskManagement.Domain.Interfaces;

public interface IUsuarioRepository : IRepository<Usuario>
{
    Task<Usuario?> GetByEmailAsync(string email, CancellationToken ct = default);
}
