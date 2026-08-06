using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.API.Controllers;

[Authorize]
[Route("api/dashboard")]
public class DashboardController : ApiControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>Métricas gerais: total por status, atrasadas, concluídas no prazo e taxa de conclusão.</summary>
    [HttpGet("metricas")]
    [ProducesResponseType(typeof(DashboardMetricasDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObterMetricas(CancellationToken ct) =>
        Ok(await _dashboardService.ObterMetricasAsync(ct));
}
