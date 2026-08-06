using System.Net.Http.Headers;
using System.Net.Http.Json;
using TaskManagement.Application.DTOs;
using Xunit;

namespace TaskManagement.IntegrationTests.Fixtures;

public abstract class IntegrationTestBase : IClassFixture<CustomWebApplicationFactory>
{
    protected readonly CustomWebApplicationFactory Factory;

    protected IntegrationTestBase(CustomWebApplicationFactory factory)
    {
        Factory = factory;
    }

    /// <summary>Cria um HttpClient já autenticado com um usuário novo e único por chamada.</summary>
    protected async Task<HttpClient> CreateAuthenticatedClientAsync()
    {
        var client = Factory.CreateClient();
        var email = $"user_{Guid.NewGuid():N}@teste.com";

        var response = await client.PostAsJsonAsync("/api/auth/registrar",
            new RegisterRequest("Usuário de Teste", email, "senha123"));
        response.EnsureSuccessStatusCode();

        var auth = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth!.Token);
        return client;
    }
}
