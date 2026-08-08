using Microsoft.AspNetCore.SignalR;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.Infrastructure.Realtime;

public class SignalRRealtimeNotifier : IRealtimeNotifier
{
    public const string ReceberNotificacaoMetodo = "ReceberNotificacao";
    public const string DadosAtualizadosMetodo = "DadosAtualizados";

    private readonly IHubContext<NotificationHub> _hubContext;

    public SignalRRealtimeNotifier(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task NotificarUsuarioAsync(int usuarioId, NotificacaoDto notificacao, CancellationToken ct = default) =>
        _hubContext.Clients.Group(NotificationHub.GroupName(usuarioId))
            .SendAsync(ReceberNotificacaoMetodo, notificacao, ct);

    public Task NotificarMudancaDadosAsync(CancellationToken ct = default) =>
        _hubContext.Clients.All.SendAsync(DadosAtualizadosMetodo, ct);
}
