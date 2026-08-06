using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Interfaces;

namespace TaskManagement.Application.Services;

public class DashboardService : IDashboardService
{
    public const string CacheKey = "dashboard:metricas";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(2);

    private readonly IUnitOfWork _unitOfWork;
    private readonly IMemoryCache _cache;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(IUnitOfWork unitOfWork, IMemoryCache cache, ILogger<DashboardService> logger)
    {
        _unitOfWork = unitOfWork;
        _cache = cache;
        _logger = logger;
    }

    public async Task<DashboardMetricasDto> ObterMetricasAsync(CancellationToken ct = default)
    {
        if (_cache.TryGetValue(CacheKey, out DashboardMetricasDto? cached) && cached is not null)
        {
            _logger.LogDebug("Métricas do dashboard servidas do cache");
            return cached;
        }

        var tarefas = await _unitOfWork.Tarefas.GetTodasParaMetricasAsync(ct);

        var totalPorStatus = Enum.GetValues<StatusTarefa>()
            .ToDictionary(s => s.ToString(), s => tarefas.Count(t => t.Status == s));

        var totalTarefas = tarefas.Count;
        var atrasadas = tarefas.Count(t => t.IsAtrasada);
        var concluidasNoPrazo = tarefas.Count(t => t.FoiConcluidaNoPrazo);
        var concluidas = totalPorStatus[StatusTarefa.Concluida.ToString()];
        var taxaConclusao = totalTarefas == 0 ? 0 : Math.Round((double)concluidas / totalTarefas * 100, 2);

        var metricas = new DashboardMetricasDto(totalPorStatus, totalTarefas, atrasadas, concluidasNoPrazo, taxaConclusao);

        _cache.Set(CacheKey, metricas, CacheDuration);
        return metricas;
    }
}
