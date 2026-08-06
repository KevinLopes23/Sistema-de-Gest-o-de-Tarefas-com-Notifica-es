using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;

namespace TaskManagement.Domain.Interfaces;

public class TarefaFiltro
{
    public int? ProjetoId { get; set; }
    public StatusTarefa? Status { get; set; }
    public int? ResponsavelId { get; set; }
    public DateTime? PrazoAte { get; set; }
    public string? OrdenarPor { get; set; }
    public bool Descendente { get; set; }
}

public interface ITarefaRepository : IRepository<Tarefa>
{
    Task<Tarefa?> GetByIdComDetalhesAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<Tarefa>> ListarComFiltrosAsync(TarefaFiltro filtro, CancellationToken ct = default);
    Task<IReadOnlyList<Tarefa>> GetTodasParaMetricasAsync(CancellationToken ct = default);
}
