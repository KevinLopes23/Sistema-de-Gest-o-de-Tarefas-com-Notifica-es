using Microsoft.EntityFrameworkCore;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Infrastructure.Persistence;

public class TaskManagementDbContext : DbContext
{
    public TaskManagementDbContext(DbContextOptions<TaskManagementDbContext> options) : base(options)
    {
    }

    public DbSet<Projeto> Projetos => Set<Projeto>();
    public DbSet<Tarefa> Tarefas => Set<Tarefa>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Notificacao> Notificacoes => Set<Notificacao>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TaskManagementDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
