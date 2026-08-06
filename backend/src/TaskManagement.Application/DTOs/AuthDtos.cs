namespace TaskManagement.Application.DTOs;

public record RegisterRequest(string Nome, string Email, string Senha);

public record LoginRequest(string Email, string Senha);

public record UsuarioDto(int Id, string Nome, string Email);

public record AuthResponseDto(string Token, DateTime ExpiraEm, UsuarioDto Usuario);
