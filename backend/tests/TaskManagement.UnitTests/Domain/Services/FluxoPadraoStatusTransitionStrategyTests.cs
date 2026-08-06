using FluentAssertions;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Services;
using Xunit;

namespace TaskManagement.UnitTests.Domain.Services;

public class FluxoPadraoStatusTransitionStrategyTests
{
    private readonly FluxoPadraoStatusTransitionStrategy _strategy = new();

    [Theory]
    [InlineData(StatusTarefa.Pendente, StatusTarefa.EmAndamento, true)]
    [InlineData(StatusTarefa.Pendente, StatusTarefa.Cancelada, true)]
    [InlineData(StatusTarefa.Pendente, StatusTarefa.Concluida, false)]
    [InlineData(StatusTarefa.EmAndamento, StatusTarefa.Concluida, true)]
    [InlineData(StatusTarefa.EmAndamento, StatusTarefa.Cancelada, true)]
    [InlineData(StatusTarefa.EmAndamento, StatusTarefa.Pendente, false)]
    [InlineData(StatusTarefa.Concluida, StatusTarefa.EmAndamento, false)]
    [InlineData(StatusTarefa.Concluida, StatusTarefa.Cancelada, false)]
    [InlineData(StatusTarefa.Cancelada, StatusTarefa.Pendente, false)]
    [InlineData(StatusTarefa.Pendente, StatusTarefa.Pendente, false)]
    public void PodeTransicionar_deve_seguir_a_matriz_de_transicoes_permitidas(
        StatusTarefa atual, StatusTarefa novo, bool esperado)
    {
        _strategy.PodeTransicionar(atual, novo).Should().Be(esperado);
    }
}
