using FluentAssertions;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Exceptions;
using TaskManagement.Domain.Services;
using Xunit;

namespace TaskManagement.UnitTests.Domain.Entities;

public class TarefaTests
{
    private readonly IStatusTransitionStrategy _strategy = new FluxoPadraoStatusTransitionStrategy();

    private static Tarefa CriarTarefa(DateTime? prazo = null) =>
        new("Implementar feature X", "Descrição", Prioridade.Alta, projetoId: 1,
            dataPrazo: prazo ?? DateTime.UtcNow.AddDays(3));

    [Fact]
    public void Deve_iniciar_com_status_pendente()
    {
        var tarefa = CriarTarefa();

        tarefa.Status.Should().Be(StatusTarefa.Pendente);
        tarefa.DataConclusao.Should().BeNull();
    }

    [Fact]
    public void Deve_permitir_transicao_de_pendente_para_em_andamento()
    {
        var tarefa = CriarTarefa();

        tarefa.AlterarStatus(StatusTarefa.EmAndamento, _strategy);

        tarefa.Status.Should().Be(StatusTarefa.EmAndamento);
    }

    [Fact]
    public void Deve_definir_data_conclusao_automaticamente_ao_concluir()
    {
        var tarefa = CriarTarefa();
        tarefa.AlterarStatus(StatusTarefa.EmAndamento, _strategy);

        tarefa.AlterarStatus(StatusTarefa.Concluida, _strategy);

        tarefa.Status.Should().Be(StatusTarefa.Concluida);
        tarefa.DataConclusao.Should().NotBeNull();
        tarefa.DataConclusao!.Value.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void Nao_deve_permitir_pular_direto_de_pendente_para_concluida()
    {
        var tarefa = CriarTarefa();

        var act = () => tarefa.AlterarStatus(StatusTarefa.Concluida, _strategy);

        act.Should().Throw<InvalidStatusTransitionException>();
    }

    [Fact]
    public void Nao_deve_permitir_retroceder_status()
    {
        var tarefa = CriarTarefa();
        tarefa.AlterarStatus(StatusTarefa.EmAndamento, _strategy);
        tarefa.AlterarStatus(StatusTarefa.Concluida, _strategy);

        var act = () => tarefa.AlterarStatus(StatusTarefa.EmAndamento, _strategy);

        act.Should().Throw<InvalidStatusTransitionException>();
    }

    [Fact]
    public void Nao_deve_permitir_excluir_tarefa_em_andamento()
    {
        var tarefa = CriarTarefa();
        tarefa.AlterarStatus(StatusTarefa.EmAndamento, _strategy);

        var act = () => tarefa.GarantirQuePodeSerExcluida();

        act.Should().Throw<DomainException>()
            .WithMessage("*Em Andamento*");
    }

    [Theory]
    [InlineData(StatusTarefa.Pendente)]
    [InlineData(StatusTarefa.Concluida)]
    [InlineData(StatusTarefa.Cancelada)]
    public void Deve_permitir_excluir_tarefa_quando_nao_esta_em_andamento(StatusTarefa status)
    {
        var tarefa = CriarTarefa();
        if (status == StatusTarefa.Concluida)
        {
            tarefa.AlterarStatus(StatusTarefa.EmAndamento, _strategy);
            tarefa.AlterarStatus(StatusTarefa.Concluida, _strategy);
        }
        else if (status == StatusTarefa.Cancelada)
        {
            tarefa.AlterarStatus(StatusTarefa.Cancelada, _strategy);
        }

        var act = () => tarefa.GarantirQuePodeSerExcluida();

        act.Should().NotThrow();
    }

    [Fact]
    public void IsAtrasada_deve_ser_verdadeiro_quando_prazo_vencido_e_nao_concluida()
    {
        var tarefa = CriarTarefa(DateTime.UtcNow.AddDays(-1));

        tarefa.IsAtrasada.Should().BeTrue();
    }

    [Fact]
    public void IsAtrasada_deve_ser_falso_quando_tarefa_concluida_mesmo_com_prazo_vencido()
    {
        var tarefa = CriarTarefa(DateTime.UtcNow.AddDays(-1));
        tarefa.AlterarStatus(StatusTarefa.EmAndamento, _strategy);
        tarefa.AlterarStatus(StatusTarefa.Concluida, _strategy);

        tarefa.IsAtrasada.Should().BeFalse();
    }

    [Fact]
    public void AtribuirResponsavel_deve_retornar_true_quando_responsavel_muda()
    {
        var tarefa = CriarTarefa();

        var mudou = tarefa.AtribuirResponsavel(42);

        mudou.Should().BeTrue();
        tarefa.ResponsavelId.Should().Be(42);
    }

    [Fact]
    public void AtribuirResponsavel_deve_retornar_false_quando_responsavel_e_o_mesmo()
    {
        var tarefa = CriarTarefa();
        tarefa.AtribuirResponsavel(42);

        var mudou = tarefa.AtribuirResponsavel(42);

        mudou.Should().BeFalse();
    }
}
