using Microsoft.Extensions.Logging;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Exceptions;
using TaskManagement.Domain.Interfaces;

namespace TaskManagement.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        ILogger<AuthService> logger)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegistrarAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var existente = await _unitOfWork.Usuarios.GetByEmailAsync(request.Email, ct);
        if (existente is not null)
            throw new DomainException($"Já existe um usuário cadastrado com o email '{request.Email}'.");

        var usuario = new Usuario(request.Nome, request.Email, _passwordHasher.Hash(request.Senha));
        await _unitOfWork.Usuarios.AddAsync(usuario, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Usuário {UsuarioId} registrado", usuario.Id);
        return GerarResposta(usuario);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var usuario = await _unitOfWork.Usuarios.GetByEmailAsync(request.Email, ct);
        if (usuario is null || !_passwordHasher.Verify(request.Senha, usuario.SenhaHash))
            throw new DomainException("Email ou senha inválidos.");

        _logger.LogInformation("Usuário {UsuarioId} autenticado", usuario.Id);
        return GerarResposta(usuario);
    }

    private AuthResponseDto GerarResposta(Usuario usuario)
    {
        var token = _jwtTokenGenerator.GerarToken(usuario);
        return new AuthResponseDto(token.Token, token.ExpiraEm, new UsuarioDto(usuario.Id, usuario.Nome, usuario.Email));
    }
}
