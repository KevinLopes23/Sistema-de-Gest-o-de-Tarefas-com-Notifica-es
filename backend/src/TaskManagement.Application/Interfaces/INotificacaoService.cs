using TaskManagement.Application.DTOs;

namespace TaskManagement.Application.Interfaces;

public interface INotificacaoService
{
    Task<IReadOnlyList<NotificacaoDto>> ListarPorUsuarioAsync(int usuarioId, CancellationToken ct = default);
    Task MarcarComoLidaAsync(int notificacaoId, CancellationToken ct = default);
}
