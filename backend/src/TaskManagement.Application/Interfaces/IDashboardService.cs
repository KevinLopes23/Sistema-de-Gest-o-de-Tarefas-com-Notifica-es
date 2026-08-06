using TaskManagement.Application.DTOs;

namespace TaskManagement.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardMetricasDto> ObterMetricasAsync(CancellationToken ct = default);
}
