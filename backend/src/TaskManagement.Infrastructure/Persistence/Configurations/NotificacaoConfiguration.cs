using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManagement.Domain.Entities;

namespace TaskManagement.Infrastructure.Persistence.Configurations;

public class NotificacaoConfiguration : IEntityTypeConfiguration<Notificacao>
{
    public void Configure(EntityTypeBuilder<Notificacao> builder)
    {
        builder.ToTable("Notificacoes");
        builder.HasKey(n => n.Id);

        builder.Property(n => n.Mensagem).IsRequired().HasMaxLength(500);
        builder.Property(n => n.DataCriacao).IsRequired();

        builder.HasOne(n => n.Usuario)
            .WithMany()
            .HasForeignKey(n => n.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(n => n.Tarefa)
            .WithMany()
            .HasForeignKey(n => n.TarefaId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(n => n.UsuarioId);
    }
}
