using TaskManagement.Domain.Interfaces;
using TaskManagement.Infrastructure.Persistence.Repositories;

namespace TaskManagement.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly TaskManagementDbContext _context;

    public IProjetoRepository Projetos { get; }
    public ITarefaRepository Tarefas { get; }
    public IUsuarioRepository Usuarios { get; }
    public INotificacaoRepository Notificacoes { get; }

    public UnitOfWork(TaskManagementDbContext context)
    {
        _context = context;
        Projetos = new ProjetoRepository(context);
        Tarefas = new TarefaRepository(context);
        Usuarios = new UsuarioRepository(context);
        Notificacoes = new NotificacaoRepository(context);
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _context.SaveChangesAsync(ct);
}
