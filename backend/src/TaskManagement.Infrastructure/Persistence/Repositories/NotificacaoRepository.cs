using Microsoft.EntityFrameworkCore;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Interfaces;

namespace TaskManagement.Infrastructure.Persistence.Repositories;

public class NotificacaoRepository : Repository<Notificacao>, INotificacaoRepository
{
    public NotificacaoRepository(TaskManagementDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Notificacao>> GetPorUsuarioAsync(int usuarioId, CancellationToken ct = default) =>
        await DbSet.AsNoTracking()
            .Where(n => n.UsuarioId == usuarioId)
            .OrderByDescending(n => n.DataCriacao)
            .ToListAsync(ct);
}
