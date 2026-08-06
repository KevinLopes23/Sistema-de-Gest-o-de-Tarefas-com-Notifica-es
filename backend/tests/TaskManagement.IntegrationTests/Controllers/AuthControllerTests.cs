using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using TaskManagement.Application.DTOs;
using TaskManagement.IntegrationTests.Fixtures;
using Xunit;

namespace TaskManagement.IntegrationTests.Controllers;

public class AuthControllerTests : IntegrationTestBase
{
    public AuthControllerTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Registrar_com_dados_validos_deve_retornar_token()
    {
        var client = Factory.CreateClient();
        var email = $"novo_{Guid.NewGuid():N}@teste.com";

        var response = await client.PostAsJsonAsync("/api/auth/registrar", new RegisterRequest("Novo Usuário", email, "senha123"));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var auth = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        auth!.Token.Should().NotBeNullOrWhiteSpace();
        auth.Usuario.Email.Should().Be(email);
    }

    [Fact]
    public async Task Registrar_com_email_duplicado_deve_retornar_400()
    {
        var client = Factory.CreateClient();
        var email = $"duplicado_{Guid.NewGuid():N}@teste.com";
        await client.PostAsJsonAsync("/api/auth/registrar", new RegisterRequest("Usuário", email, "senha123"));

        var response = await client.PostAsJsonAsync("/api/auth/registrar", new RegisterRequest("Outro", email, "outrasenha"));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_com_senha_incorreta_deve_retornar_400()
    {
        var client = Factory.CreateClient();
        var email = $"login_{Guid.NewGuid():N}@teste.com";
        await client.PostAsJsonAsync("/api/auth/registrar", new RegisterRequest("Usuário", email, "senhaCorreta"));

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "senhaErrada"));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_com_credenciais_corretas_deve_retornar_token()
    {
        var client = Factory.CreateClient();
        var email = $"login_ok_{Guid.NewGuid():N}@teste.com";
        await client.PostAsJsonAsync("/api/auth/registrar", new RegisterRequest("Usuário", email, "senhaCorreta"));

        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "senhaCorreta"));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
