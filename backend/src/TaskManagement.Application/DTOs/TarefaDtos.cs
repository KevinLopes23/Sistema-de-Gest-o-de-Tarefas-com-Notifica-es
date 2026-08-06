using TaskManagement.Domain.Enums;

namespace TaskManagement.Application.DTOs;

public record TarefaDto(
    int Id,
    string Titulo,
    string? Descricao,
    StatusTarefa Status,
    Prioridade Prioridade,
    int ProjetoId,
    string? ProjetoNome,
    int? ResponsavelId,
    string? ResponsavelNome,
    DateTime DataCriacao,
    DateTime DataPrazo,
    DateTime? DataConclusao,
    bool IsAtrasada);

public record CriarTarefaRequest(
    string Titulo,
    string? Descricao,
    Prioridade Prioridade,
    int ProjetoId,
    DateTime DataPrazo,
    int? ResponsavelId);

public record AtualizarTarefaRequest(
    string Titulo,
    string? Descricao,
    Prioridade Prioridade,
    DateTime DataPrazo,
    int? ResponsavelId);

public record AlterarStatusTarefaRequest(StatusTarefa Status);

public record TarefaFiltroRequest(
    int? ProjetoId,
    StatusTarefa? Status,
    int? ResponsavelId,
    DateTime? PrazoAte,
    string? OrdenarPor,
    bool Descendente = false);
