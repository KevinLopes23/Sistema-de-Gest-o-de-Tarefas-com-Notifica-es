using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Infrastructure.Persistence;

/// <summary>
/// Garante a existência de um usuário administrador padrão, usado como credencial de teste
/// documentada no README. Idempotente: só cria se a tabela de usuários estiver vazia.
/// </summary>
public static class DbSeeder
{
    public const string AdminEmail = "admin@moovefy.com";
    public const string AdminSenha = "Admin@123";

    public static async Task SeedAsync(TaskManagementDbContext context, IPasswordHasher passwordHasher)
    {
        await context.Database.MigrateAsync();

        if (await context.Usuarios.AnyAsync())
            return;

        var admin = new Usuario("Administrador", AdminEmail, passwordHasher.Hash(AdminSenha));
        context.Usuarios.Add(admin);
        await context.SaveChangesAsync();
    }
}
