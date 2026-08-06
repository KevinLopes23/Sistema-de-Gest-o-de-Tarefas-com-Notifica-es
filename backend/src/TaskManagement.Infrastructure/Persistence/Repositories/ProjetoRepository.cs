using Microsoft.EntityFrameworkCore;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Interfaces;

namespace TaskManagement.Infrastructure.Persistence.Repositories;

public class ProjetoRepository : Repository<Projeto>, IProjetoRepository
{
    public ProjetoRepository(TaskManagementDbContext context) : base(context)
    {
    }

    public async Task<Projeto?> GetByIdComTarefasAsync(int id, CancellationToken ct = default) =>
        await DbSet.Include(p => p.Tarefas).FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<IReadOnlyList<Projeto>> ListarComTarefasAsync(CancellationToken ct = default) =>
        await DbSet.AsNoTracking().Include(p => p.Tarefas).OrderByDescending(p => p.DataCriacao).ToListAsync(ct);
}
