using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using TaskManagement.Application.DTOs;
using TaskManagement.Domain.Enums;
using TaskManagement.IntegrationTests.Fixtures;
using Xunit;
using static TaskManagement.IntegrationTests.Fixtures.JsonDefaults;

namespace TaskManagement.IntegrationTests.Controllers;

public class TarefasControllerTests : IntegrationTestBase
{
    public TarefasControllerTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task Fluxo_completo_criar_avancar_status_e_concluir_deve_definir_data_conclusao()
    {
        var client = await CreateAuthenticatedClientAsync();
        var projeto = await CriarProjetoAsync(client);
        var tarefa = await CriarTarefaAsync(client, projeto.Id);

        tarefa.Status.Should().Be(StatusTarefa.Pendente);

        var emAndamento = await client.PatchAsJsonAsync($"/api/tarefas/{tarefa.Id}/status", new AlterarStatusTarefaRequest(StatusTarefa.EmAndamento), Options);
        emAndamento.StatusCode.Should().Be(HttpStatusCode.OK);

        var concluida = await client.PatchAsJsonAsync($"/api/tarefas/{tarefa.Id}/status", new AlterarStatusTarefaRequest(StatusTarefa.Concluida), Options);
        concluida.StatusCode.Should().Be(HttpStatusCode.OK);

        var tarefaConcluida = await concluida.Content.ReadFromJsonAsync<TarefaDto>(Options);
        tarefaConcluida!.Status.Should().Be(StatusTarefa.Concluida);
        tarefaConcluida.DataConclusao.Should().NotBeNull();
    }

    [Fact]
    public async Task Pular_de_pendente_para_concluida_deve_retornar_400()
    {
        var client = await CreateAuthenticatedClientAsync();
        var projeto = await CriarProjetoAsync(client);
        var tarefa = await CriarTarefaAsync(client, projeto.Id);

        var response = await client.PatchAsJsonAsync($"/api/tarefas/{tarefa.Id}/status", new AlterarStatusTarefaRequest(StatusTarefa.Concluida), Options);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Excluir_tarefa_em_andamento_deve_retornar_400()
    {
        var client = await CreateAuthenticatedClientAsync();
        var projeto = await CriarProjetoAsync(client);
        var tarefa = await CriarTarefaAsync(client, projeto.Id);
        await client.PatchAsJsonAsync($"/api/tarefas/{tarefa.Id}/status", new AlterarStatusTarefaRequest(StatusTarefa.EmAndamento), Options);

        var response = await client.DeleteAsync($"/api/tarefas/{tarefa.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Excluir_tarefa_pendente_deve_retornar_204()
    {
        var client = await CreateAuthenticatedClientAsync();
        var projeto = await CriarProjetoAsync(client);
        var tarefa = await CriarTarefaAsync(client, projeto.Id);

        var response = await client.DeleteAsync($"/api/tarefas/{tarefa.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Listar_com_filtro_de_status_deve_retornar_apenas_tarefas_correspondentes()
    {
        var client = await CreateAuthenticatedClientAsync();
        var projeto = await CriarProjetoAsync(client);
        var tarefaPendente = await CriarTarefaAsync(client, projeto.Id);
        var tarefaEmAndamento = await CriarTarefaAsync(client, projeto.Id);
        await client.PatchAsJsonAsync($"/api/tarefas/{tarefaEmAndamento.Id}/status", new AlterarStatusTarefaRequest(StatusTarefa.EmAndamento), Options);

        var response = await client.GetAsync($"/api/tarefas?projetoId={projeto.Id}&status={StatusTarefa.Pendente}");
        var tarefas = await response.Content.ReadFromJsonAsync<List<TarefaDto>>(Options);

        tarefas.Should().ContainSingle(t => t.Id == tarefaPendente.Id);
        tarefas.Should().NotContain(t => t.Id == tarefaEmAndamento.Id);
    }

    private static async Task<ProjetoDto> CriarProjetoAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync("/api/projetos", new CriarProjetoRequest($"Projeto {Guid.NewGuid():N}", null), Options);
        return (await response.Content.ReadFromJsonAsync<ProjetoDto>(Options))!;
    }

    private static async Task<TarefaDto> CriarTarefaAsync(HttpClient client, int projetoId)
    {
        var response = await client.PostAsJsonAsync("/api/tarefas",
            new CriarTarefaRequest("Tarefa de teste", null, Prioridade.Media, projetoId, DateTime.UtcNow.AddDays(3), null), Options);
        return (await response.Content.ReadFromJsonAsync<TarefaDto>(Options))!;
    }
}
