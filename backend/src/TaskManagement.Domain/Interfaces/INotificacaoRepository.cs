using TaskManagement.Domain.Entities;

namespace TaskManagement.Domain.Interfaces;

public interface INotificacaoRepository : IRepository<Notificacao>
{
    Task<IReadOnlyList<Notificacao>> GetPorUsuarioAsync(int usuarioId, CancellationToken ct = default);
}
