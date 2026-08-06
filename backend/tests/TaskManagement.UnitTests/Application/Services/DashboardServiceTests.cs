using FluentAssertions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Interfaces;
using TaskManagement.Domain.Services;
using Xunit;

namespace TaskManagement.UnitTests.Application.Services;

public class DashboardServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<ITarefaRepository> _tarefaRepository = new();
    private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
    private readonly IStatusTransitionStrategy _strategy = new FluxoPadraoStatusTransitionStrategy();

    public DashboardServiceTests()
    {
        _unitOfWork.SetupGet(u => u.Tarefas).Returns(_tarefaRepository.Object);
    }

    private Tarefa NovaTarefa(DateTime prazo) =>
        new("Tarefa", null, Prioridade.Media, projetoId: 1, dataPrazo: prazo);

    [Fact]
    public async Task ObterMetricasAsync_deve_calcular_totais_atrasadas_e_taxa_de_conclusao()
    {
        var concluidaNoPrazo = NovaTarefa(DateTime.UtcNow.AddDays(5));
        concluidaNoPrazo.AlterarStatus(StatusTarefa.EmAndamento, _strategy);
        concluidaNoPrazo.AlterarStatus(StatusTarefa.Concluida, _strategy);

        var atrasada = NovaTarefa(DateTime.UtcNow.AddDays(-2));
        var pendente = NovaTarefa(DateTime.UtcNow.AddDays(10));

        _tarefaRepository.Setup(r => r.GetTodasParaMetricasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Tarefa> { concluidaNoPrazo, atrasada, pendente });

        var sut = new DashboardService(_unitOfWork.Object, _cache, NullLogger<DashboardService>.Instance);

        var metricas = await sut.ObterMetricasAsync();

        metricas.TotalTarefas.Should().Be(3);
        metricas.TarefasAtrasadas.Should().Be(1);
        metricas.TarefasConcluidasNoPrazo.Should().Be(1);
        metricas.TaxaConclusao.Should().BeApproximately(33.33, 0.01);
        metricas.TotalPorStatus[nameof(StatusTarefa.Concluida)].Should().Be(1);
        metricas.TotalPorStatus[nameof(StatusTarefa.Pendente)].Should().Be(2);
    }

    [Fact]
    public async Task ObterMetricasAsync_deve_usar_cache_na_segunda_chamada()
    {
        _tarefaRepository.Setup(r => r.GetTodasParaMetricasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Tarefa>());

        var sut = new DashboardService(_unitOfWork.Object, _cache, NullLogger<DashboardService>.Instance);

        await sut.ObterMetricasAsync();
        await sut.ObterMetricasAsync();

        _tarefaRepository.Verify(r => r.GetTodasParaMetricasAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ObterMetricasAsync_com_zero_tarefas_nao_deve_lancar_excecao_de_divisao()
    {
        _tarefaRepository.Setup(r => r.GetTodasParaMetricasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Tarefa>());

        var sut = new DashboardService(_unitOfWork.Object, _cache, NullLogger<DashboardService>.Instance);

        var metricas = await sut.ObterMetricasAsync();

        metricas.TaxaConclusao.Should().Be(0);
    }
}
