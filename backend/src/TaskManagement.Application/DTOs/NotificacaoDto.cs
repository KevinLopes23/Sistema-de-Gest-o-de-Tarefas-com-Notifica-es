namespace TaskManagement.Application.DTOs;

public record NotificacaoDto(int Id, string Mensagem, bool Lida, DateTime DataCriacao, int? TarefaId);
