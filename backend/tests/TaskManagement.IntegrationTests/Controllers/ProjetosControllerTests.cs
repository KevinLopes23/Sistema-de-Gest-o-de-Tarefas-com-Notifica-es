using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using TaskManagement.Application.DTOs;
using TaskManagement.Domain.Enums;
using TaskManagement.IntegrationTests.Fixtures;
using Xunit;

namespace TaskManagement.IntegrationTests.Controllers;

public class ProjetosControllerTests : IntegrationTestBase
{
    public ProjetosControllerTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Listar_sem_autenticacao_deve_retornar_401()
    {
        var client = Factory.CreateClient();

        var response = await client.GetAsync("/api/projetos");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Criar_projeto_valido_deve_retornar_201_com_dados_persistidos()
    {
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/projetos", new CriarProjetoRequest("Projeto Alpha", "Descrição do Alpha"));

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var projeto = await response.Content.ReadFromJsonAsync<ProjetoDto>();
        projeto!.Nome.Should().Be("Projeto Alpha");
        projeto.TotalTarefas.Should().Be(0);
    }

    [Fact]
    public async Task Criar_projeto_com_nome_vazio_deve_retornar_400()
    {
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/projetos", new CriarProjetoRequest("", null));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Excluir_projeto_com_tarefa_vinculada_deve_retornar_400()
    {
        var client = await CreateAuthenticatedClientAsync();
        var projeto = await CriarProjetoAsync(client);
        await CriarTarefaAsync(client, projeto.Id);

        var response = await client.DeleteAsync($"/api/projetos/{projeto.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Excluir_projeto_sem_tarefas_deve_retornar_204()
    {
        var client = await CreateAuthenticatedClientAsync();
        var projeto = await CriarProjetoAsync(client);

        var response = await client.DeleteAsync($"/api/projetos/{projeto.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    private static async Task<ProjetoDto> CriarProjetoAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync("/api/projetos", new CriarProjetoRequest($"Projeto {Guid.NewGuid():N}", null));
        return (await response.Content.ReadFromJsonAsync<ProjetoDto>())!;
    }

    private static async Task<TarefaDto> CriarTarefaAsync(HttpClient client, int projetoId)
    {
        var response = await client.PostAsJsonAsync("/api/tarefas",
            new CriarTarefaRequest("Tarefa de teste", null, Prioridade.Media, projetoId, DateTime.UtcNow.AddDays(3), null));
        return (await response.Content.ReadFromJsonAsync<TarefaDto>())!;
    }
}
