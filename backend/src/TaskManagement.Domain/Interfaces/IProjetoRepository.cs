using TaskManagement.Domain.Entities;

namespace TaskManagement.Domain.Interfaces;

public interface IProjetoRepository : IRepository<Projeto>
{
    Task<Projeto?> GetByIdComTarefasAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<Projeto>> ListarComTarefasAsync(CancellationToken ct = default);
}
