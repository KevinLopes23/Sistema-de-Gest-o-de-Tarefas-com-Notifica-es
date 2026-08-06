using TaskManagement.Application.DTOs;

namespace TaskManagement.Application.Interfaces;

/// <summary>
/// Abstrai o transporte de notificações em tempo real (implementado com SignalR na Infrastructure),
/// mantendo a Application independente de detalhes de transporte/websocket.
/// </summary>
public interface IRealtimeNotifier
{
    Task NotificarUsuarioAsync(int usuarioId, NotificacaoDto notificacao, CancellationToken ct = default);
}
