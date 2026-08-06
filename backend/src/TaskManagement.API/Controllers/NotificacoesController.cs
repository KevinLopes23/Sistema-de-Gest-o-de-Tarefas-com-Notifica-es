using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.API.Controllers;

[Authorize]
[Route("api/notificacoes")]
public class NotificacoesController : ApiControllerBase
{
    private readonly INotificacaoService _notificacaoService;

    public NotificacoesController(INotificacaoService notificacaoService)
    {
        _notificacaoService = notificacaoService;
    }

    /// <summary>Lista as notificações do usuário autenticado.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<NotificacaoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(CancellationToken ct) =>
        Ok(await _notificacaoService.ListarPorUsuarioAsync(CurrentUserId, ct));

    /// <summary>Marca uma notificação como lida.</summary>
    [HttpPatch("{id:int}/lida")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarcarComoLida(int id, CancellationToken ct)
    {
        await _notificacaoService.MarcarComoLidaAsync(id, ct);
        return NoContent();
    }
}
