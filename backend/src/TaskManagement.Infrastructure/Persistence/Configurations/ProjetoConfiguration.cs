using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Infrastructure.Persistence.Configurations;

public class ProjetoConfiguration : IEntityTypeConfiguration<Projeto>
{
    public void Configure(EntityTypeBuilder<Projeto> builder)
    {
        builder.ToTable("Projetos");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Nome).IsRequired().HasMaxLength(150);
        builder.Property(p => p.Descricao).HasMaxLength(2000);
        builder.Property(p => p.DataCriacao).IsRequired();

        builder.HasMany(p => p.Tarefas)
            .WithOne(t => t.Projeto)
            .HasForeignKey(t => t.ProjetoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Navigation(p => p.Tarefas).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
