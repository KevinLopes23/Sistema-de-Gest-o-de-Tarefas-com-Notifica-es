using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Exceptions;

namespace TaskManagement.Domain.Entities;

public class Projeto
{
    public int Id { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string? Descricao { get; private set; }
    public DateTime DataCriacao { get; private set; }

    private readonly List<Tarefa> _tarefas = new();
    public IReadOnlyCollection<Tarefa> Tarefas => _tarefas.AsReadOnly();

    protected Projeto()
    {
    }

    public Projeto(string nome, string? descricao)
    {
        AtualizarDados(nome, descricao);
        DataCriacao = DateTime.UtcNow;
    }

    public void AtualizarDados(string nome, string? descricao)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new ArgumentException("Nome do projeto é obrigatório.", nameof(nome));

        Nome = nome.Trim();
        Descricao = descricao?.Trim();
    }

    /// <summary>
    /// Um projeto só pode ser excluído se não possuir tarefas vinculadas.
    /// </summary>
    public void GarantirQuePodeSerExcluido()
    {
        if (_tarefas.Count > 0)
            throw new DomainException(
                $"O projeto '{Nome}' possui {_tarefas.Count} tarefa(s) vinculada(s) e não pode ser excluído.");
    }

    public int TotalTarefas => _tarefas.Count;
    public int TotalTarefasConcluidas => _tarefas.Count(t => t.Status == StatusTarefa.Concluida);
}
