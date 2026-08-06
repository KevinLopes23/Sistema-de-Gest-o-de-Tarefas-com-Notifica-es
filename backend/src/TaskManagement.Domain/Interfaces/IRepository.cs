using System.Linq.Expressions;

namespace TaskManagement.Domain.Interfaces;

/// <summary>
/// Repository Pattern: abstrai o acesso a dados de uma entidade, mantendo o domínio/aplicação
/// desacoplados da tecnologia de persistência (EF Core).
/// </summary>
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default);
    Task<T> AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Remove(T entity);
}
