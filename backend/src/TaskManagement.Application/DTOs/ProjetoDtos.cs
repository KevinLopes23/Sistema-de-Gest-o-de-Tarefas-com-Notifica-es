namespace TaskManagement.Application.DTOs;

public record ProjetoDto(
    int Id,
    string Nome,
    string? Descricao,
    DateTime DataCriacao,
    int TotalTarefas,
    int TotalTarefasConcluidas);

public record CriarProjetoRequest(string Nome, string? Descricao);

public record AtualizarProjetoRequest(string Nome, string? Descricao);
