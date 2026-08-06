namespace TaskManagement.Application.DTOs;

public record DashboardMetricasDto(
    Dictionary<string, int> TotalPorStatus,
    int TotalTarefas,
    int TarefasAtrasadas,
    int TarefasConcluidasNoPrazo,
    double TaxaConclusao);
