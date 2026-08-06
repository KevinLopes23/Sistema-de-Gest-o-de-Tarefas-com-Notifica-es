namespace TaskManagement.Domain.Entities;

public class Notificacao
{
    public int Id { get; private set; }
    public int UsuarioId { get; private set; }
    public Usuario? Usuario { get; private set; }
    public int? TarefaId { get; private set; }
    public Tarefa? Tarefa { get; private set; }
    public string Mensagem { get; private set; } = string.Empty;
    public bool Lida { get; private set; }
    public DateTime DataCriacao { get; private set; }

    protected Notificacao()
    {
    }

    public Notificacao(int usuarioId, string mensagem, int? tarefaId = null)
    {
        if (string.IsNullOrWhiteSpace(mensagem))
            throw new ArgumentException("Mensagem da notificação é obrigatória.", nameof(mensagem));

        UsuarioId = usuarioId;
        TarefaId = tarefaId;
        Mensagem = mensagem.Trim();
        Lida = false;
        DataCriacao = DateTime.UtcNow;
    }

    public void MarcarComoLida() => Lida = true;
}
