using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using TaskManagement.Application.DTOs;
using TaskManagement.Domain.Enums;
using TaskManagement.IntegrationTests.Fixtures;
using Xunit;
using static TaskManagement.IntegrationTests.Fixtures.JsonDefaults;

namespace TaskManagement.IntegrationTests.Controllers;

public class DashboardControllerTests : IntegrationTestBase
{
    public DashboardControllerTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task ObterMetricas_deve_refletir_tarefas_criadas()
    {
        var client = await CreateAuthenticatedClientAsync();
        var projetoResponse = await client.PostAsJsonAsync("/api/projetos", new CriarProjetoRequest($"Projeto {Guid.NewGuid():N}", null));
        var projeto = (await projetoResponse.Content.ReadFromJsonAsync<ProjetoDto>())!;

        await client.PostAsJsonAsync("/api/tarefas",
            new CriarTarefaRequest("Tarefa 1", null, Prioridade.Alta, projeto.Id, DateTime.UtcNow.AddDays(2), null), Options);

        var response = await client.GetAsync("/api/dashboard/metricas");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var metricas = await response.Content.ReadFromJsonAsync<DashboardMetricasDto>();
        metricas!.TotalTarefas.Should().BeGreaterThanOrEqualTo(1);
    }
}
