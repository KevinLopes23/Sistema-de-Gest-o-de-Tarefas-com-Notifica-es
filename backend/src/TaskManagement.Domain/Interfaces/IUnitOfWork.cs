namespace TaskManagement.Domain.Interfaces;

/// <summary>
/// Unit of Work Pattern: agrupa as alterações feitas por múltiplos repositórios em uma única
/// transação, garantindo consistência (ex.: criar tarefa + registrar notificação em um só commit).
/// </summary>
public interface IUnitOfWork
{
    IProjetoRepository Projetos { get; }
    ITarefaRepository Tarefas { get; }
    IUsuarioRepository Usuarios { get; }
    INotificacaoRepository Notificacoes { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
