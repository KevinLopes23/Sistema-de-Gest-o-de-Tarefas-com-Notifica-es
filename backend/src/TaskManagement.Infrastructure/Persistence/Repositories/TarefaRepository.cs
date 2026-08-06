using Microsoft.EntityFrameworkCore;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Interfaces;

namespace TaskManagement.Infrastructure.Persistence.Repositories;

public class TarefaRepository : Repository<Tarefa>, ITarefaRepository
{
    public TarefaRepository(TaskManagementDbContext context) : base(context)
    {
    }

    public async Task<Tarefa?> GetByIdComDetalhesAsync(int id, CancellationToken ct = default) =>
        await DbSet.Include(t => t.Projeto)
            .Include(t => t.Responsavel)
            .FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<IReadOnlyList<Tarefa>> ListarComFiltrosAsync(TarefaFiltro filtro, CancellationToken ct = default)
    {
        var query = DbSet.AsNoTracking()
            .Include(t => t.Projeto)
            .Include(t => t.Responsavel)
            .AsQueryable();

        if (filtro.ProjetoId.HasValue)
            query = query.Where(t => t.ProjetoId == filtro.ProjetoId.Value);

        if (filtro.Status.HasValue)
            query = query.Where(t => t.Status == filtro.Status.Value);

        if (filtro.ResponsavelId.HasValue)
            query = query.Where(t => t.ResponsavelId == filtro.ResponsavelId.Value);

        if (filtro.PrazoAte.HasValue)
            query = query.Where(t => t.DataPrazo <= filtro.PrazoAte.Value);

        query = (filtro.OrdenarPor?.ToLowerInvariant()) switch
        {
            "prazo" => filtro.Descendente ? query.OrderByDescending(t => t.DataPrazo) : query.OrderBy(t => t.DataPrazo),
            "prioridade" => filtro.Descendente ? query.OrderByDescending(t => t.Prioridade) : query.OrderBy(t => t.Prioridade),
            "status" => filtro.Descendente ? query.OrderByDescending(t => t.Status) : query.OrderBy(t => t.Status),
            "titulo" => filtro.Descendente ? query.OrderByDescending(t => t.Titulo) : query.OrderBy(t => t.Titulo),
            _ => filtro.Descendente ? query.OrderByDescending(t => t.DataCriacao) : query.OrderBy(t => t.DataCriacao)
        };

        return await query.ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Tarefa>> GetTodasParaMetricasAsync(CancellationToken ct = default) =>
        await DbSet.AsNoTracking().ToListAsync(ct);
}
