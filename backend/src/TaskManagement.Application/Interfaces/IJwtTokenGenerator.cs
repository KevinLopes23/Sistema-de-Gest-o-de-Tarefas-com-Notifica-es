using TaskManagement.Domain.Entities;

namespace TaskManagement.Application.Interfaces;

public record TokenGerado(string Token, DateTime ExpiraEm);

public interface IJwtTokenGenerator
{
    TokenGerado GerarToken(Usuario usuario);
}
