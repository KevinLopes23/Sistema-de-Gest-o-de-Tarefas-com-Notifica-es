using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Infrastructure.Persistence.Configurations;

public class TarefaConfiguration : IEntityTypeConfiguration<Tarefa>
{
    public void Configure(EntityTypeBuilder<Tarefa> builder)
    {
        builder.ToTable("Tarefas");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Titulo).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Descricao).HasMaxLength(4000);
        builder.Property(t => t.Status).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(t => t.Prioridade).IsRequired().HasConversion<string>().HasMaxLength(20);
        builder.Property(t => t.DataCriacao).IsRequired();
        builder.Property(t => t.DataPrazo).IsRequired();

        builder.HasOne(t => t.Responsavel)
            .WithMany(u => u.TarefasAtribuidas)
            .HasForeignKey(t => t.ResponsavelId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(t => t.ProjetoId);
        builder.HasIndex(t => t.Status);
        builder.HasIndex(t => t.ResponsavelId);
        builder.HasIndex(t => t.DataPrazo);
    }
}
