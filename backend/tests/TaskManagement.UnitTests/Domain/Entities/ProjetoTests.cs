using FluentAssertions;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Exceptions;
using TaskManagement.Domain.Services;
using Xunit;

namespace TaskManagement.UnitTests.Domain.Entities;

public class ProjetoTests
{
    [Fact]
    public void Deve_permitir_excluir_projeto_sem_tarefas()
    {
        var projeto = new Projeto("Website institucional", "Redesign do site");

        var act = projeto.GarantirQuePodeSerExcluido;

        act.Should().NotThrow();
    }

    [Fact]
    public void Nao_deve_permitir_excluir_projeto_com_tarefas_vinculadas()
    {
        var projeto = new Projeto("Website institucional", null);
        var tarefa = new Tarefa("Criar wireframes", null, Prioridade.Media, projeto.Id, DateTime.UtcNow.AddDays(5));
        projeto.AdicionarTarefaExistente(tarefa);

        var act = projeto.GarantirQuePodeSerExcluido;

        act.Should().Throw<DomainException>().WithMessage("*tarefa*vinculada*");
    }

    [Fact]
    public void TotalTarefasConcluidas_deve_contar_apenas_tarefas_concluidas()
    {
        var projeto = new Projeto("Migração de sistema", null);
        var strategy = new FluxoPadraoStatusTransitionStrategy();

        var tarefaConcluida = new Tarefa("Tarefa A", null, Prioridade.Baixa, projeto.Id, DateTime.UtcNow.AddDays(1));
        tarefaConcluida.AlterarStatus(StatusTarefa.EmAndamento, strategy);
        tarefaConcluida.AlterarStatus(StatusTarefa.Concluida, strategy);

        var tarefaPendente = new Tarefa("Tarefa B", null, Prioridade.Baixa, projeto.Id, DateTime.UtcNow.AddDays(1));

        projeto.AdicionarTarefaExistente(tarefaConcluida);
        projeto.AdicionarTarefaExistente(tarefaPendente);

        projeto.TotalTarefas.Should().Be(2);
        projeto.TotalTarefasConcluidas.Should().Be(1);
    }
}
