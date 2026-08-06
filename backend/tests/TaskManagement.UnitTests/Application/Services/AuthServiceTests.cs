using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Exceptions;
using TaskManagement.Domain.Interfaces;
using Xunit;

namespace TaskManagement.UnitTests.Application.Services;

public class AuthServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IUsuarioRepository> _usuarioRepository = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<IJwtTokenGenerator> _jwtTokenGenerator = new();
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _unitOfWork.SetupGet(u => u.Usuarios).Returns(_usuarioRepository.Object);
        _jwtTokenGenerator.Setup(g => g.GerarToken(It.IsAny<Usuario>()))
            .Returns(new TokenGerado("token-fake", DateTime.UtcNow.AddHours(2)));

        _sut = new AuthService(_unitOfWork.Object, _passwordHasher.Object, _jwtTokenGenerator.Object, NullLogger<AuthService>.Instance);
    }

    [Fact]
    public async Task RegistrarAsync_deve_lancar_excecao_quando_email_ja_cadastrado()
    {
        _usuarioRepository.Setup(r => r.GetByEmailAsync("joao@email.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Usuario("João", "joao@email.com", "hash"));

        var request = new RegisterRequest("João", "joao@email.com", "senha123");
        var act = async () => await _sut.RegistrarAsync(request);

        await act.Should().ThrowAsync<DomainException>();
    }

    [Fact]
    public async Task RegistrarAsync_deve_criar_usuario_com_senha_hasheada_e_retornar_token()
    {
        _usuarioRepository.Setup(r => r.GetByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario?)null);
        _passwordHasher.Setup(h => h.Hash("senha123")).Returns("hash-seguro");

        var request = new RegisterRequest("Maria", "maria@email.com", "senha123");
        var resultado = await _sut.RegistrarAsync(request);

        resultado.Token.Should().Be("token-fake");
        resultado.Usuario.Email.Should().Be("maria@email.com");
        _usuarioRepository.Verify(r => r.AddAsync(
            It.Is<Usuario>(u => u.SenhaHash == "hash-seguro"), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_deve_lancar_excecao_quando_usuario_nao_existe()
    {
        _usuarioRepository.Setup(r => r.GetByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Usuario?)null);

        var act = async () => await _sut.LoginAsync(new LoginRequest("naoexiste@email.com", "senha"));

        await act.Should().ThrowAsync<DomainException>().WithMessage("Email ou senha inválidos.");
    }

    [Fact]
    public async Task LoginAsync_deve_lancar_excecao_quando_senha_invalida()
    {
        var usuario = new Usuario("João", "joao@email.com", "hash-correto");
        _usuarioRepository.Setup(r => r.GetByEmailAsync("joao@email.com", It.IsAny<CancellationToken>())).ReturnsAsync(usuario);
        _passwordHasher.Setup(h => h.Verify("senha-errada", "hash-correto")).Returns(false);

        var act = async () => await _sut.LoginAsync(new LoginRequest("joao@email.com", "senha-errada"));

        await act.Should().ThrowAsync<DomainException>();
    }

    [Fact]
    public async Task LoginAsync_com_credenciais_validas_deve_retornar_token()
    {
        var usuario = new Usuario("João", "joao@email.com", "hash-correto");
        _usuarioRepository.Setup(r => r.GetByEmailAsync("joao@email.com", It.IsAny<CancellationToken>())).ReturnsAsync(usuario);
        _passwordHasher.Setup(h => h.Verify("senha-certa", "hash-correto")).Returns(true);

        var resultado = await _sut.LoginAsync(new LoginRequest("joao@email.com", "senha-certa"));

        resultado.Token.Should().Be("token-fake");
    }
}
