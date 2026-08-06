namespace TaskManagement.Domain.Entities;

public class Usuario
{
    public int Id { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string SenhaHash { get; private set; } = string.Empty;
    public DateTime DataCriacao { get; private set; }

    private readonly List<Tarefa> _tarefasAtribuidas = new();
    public IReadOnlyCollection<Tarefa> TarefasAtribuidas => _tarefasAtribuidas.AsReadOnly();

    protected Usuario()
    {
    }

    public Usuario(string nome, string email, string senhaHash)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new ArgumentException("Nome é obrigatório.", nameof(nome));
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email é obrigatório.", nameof(email));

        Nome = nome.Trim();
        Email = email.Trim().ToLowerInvariant();
        SenhaHash = senhaHash;
        DataCriacao = DateTime.UtcNow;
    }

    public void AtualizarSenha(string novaSenhaHash) => SenhaHash = novaSenhaHash;
}
