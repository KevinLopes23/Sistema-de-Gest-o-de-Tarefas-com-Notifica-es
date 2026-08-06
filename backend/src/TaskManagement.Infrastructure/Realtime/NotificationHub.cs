using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TaskManagement.Infrastructure.Realtime;

/// <summary>
/// Hub de notificações em tempo real. Cada usuário autenticado entra em um grupo próprio
/// ("user:{id}") para receber apenas as notificações destinadas a ele.
/// </summary>
[Authorize]
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? Context.User?.FindFirstValue("sub");

        if (!string.IsNullOrEmpty(userId))
            await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(userId));

        await base.OnConnectedAsync();
    }

    public static string GroupName(string userId) => $"user:{userId}";
    public static string GroupName(int userId) => GroupName(userId.ToString());
}
