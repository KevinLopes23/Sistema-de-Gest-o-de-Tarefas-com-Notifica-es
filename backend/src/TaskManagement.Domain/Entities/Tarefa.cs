using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Exceptions;
using TaskManagement.Domain.Services;

namespace TaskManagement.Domain.Entities;

public class Tarefa
{
    public int Id { get; private set; }
    public string Titulo { get; private set; } = string.Empty;
    public string? Descricao { get; private set; }
    public StatusTarefa Status { get; private set; }
    public Prioridade Prioridade { get; private set; }

    public int ProjetoId { get; private set; }
    public Projeto? Projeto { get; private set; }

    public int? ResponsavelId { get; private set; }
    public Usuario? Responsavel { get; private set; }

    public DateTime DataCriacao { get; private set; }
    public DateTime DataPrazo { get; private set; }
    public DateTime? DataConclusao { get; private set; }

    protected Tarefa()
    {
    }

    public Tarefa(string titulo, string? descricao, Prioridade prioridade, int projetoId, DateTime dataPrazo, int? responsavelId = null)
    {
        if (string.IsNullOrWhiteSpace(titulo))
            throw new ArgumentException("Título da tarefa é obrigatório.", nameof(titulo));

        Titulo = titulo.Trim();
        Descricao = descricao?.Trim();
        Prioridade = prioridade;
        ProjetoId = projetoId;
        DataPrazo = dataPrazo;
        ResponsavelId = responsavelId;
        Status = StatusTarefa.Pendente;
        DataCriacao = DateTime.UtcNow;
    }

    public bool IsAtrasada =>
        Status is not (StatusTarefa.Concluida or StatusTarefa.Cancelada) && DataPrazo < DateTime.UtcNow;

    public bool FoiConcluidaNoPrazo =>
        Status == StatusTarefa.Concluida && DataConclusao.HasValue && DataConclusao.Value <= DataPrazo;

    public void AtualizarDados(string titulo, string? descricao, Prioridade prioridade, DateTime dataPrazo)
    {
        if (string.IsNullOrWhiteSpace(titulo))
            throw new ArgumentException("Título da tarefa é obrigatório.", nameof(titulo));

        Titulo = titulo.Trim();
        Descricao = descricao?.Trim();
        Prioridade = prioridade;
        DataPrazo = dataPrazo;
    }

    /// <summary>
    /// Altera o status seguindo a política injetada (Strategy). Ao concluir, define
    /// automaticamente a DataConclusao.
    /// </summary>
    public void AlterarStatus(StatusTarefa novoStatus, IStatusTransitionStrategy transitionStrategy)
    {
        if (!transitionStrategy.PodeTransicionar(Status, novoStatus))
            throw new InvalidStatusTransitionException(Status.ToString(), novoStatus.ToString());

        Status = novoStatus;
        DataConclusao = novoStatus == StatusTarefa.Concluida ? DateTime.UtcNow : DataConclusao;
    }

    /// <summary>
    /// Atribui ou reatribui o responsável. Retorna true quando houve mudança real de responsável,
    /// sinal para a camada de aplicação disparar a notificação.
    /// </summary>
    public bool AtribuirResponsavel(int? novoResponsavelId)
    {
        if (ResponsavelId == novoResponsavelId) return false;

        ResponsavelId = novoResponsavelId;
        return true;
    }

    /// <summary>
    /// Tarefa não pode ser excluída se estiver com status "Em Andamento".
    /// </summary>
    public void GarantirQuePodeSerExcluida()
    {
        if (Status == StatusTarefa.EmAndamento)
            throw new DomainException("Tarefas com status 'Em Andamento' não podem ser excluídas.");
    }
}
