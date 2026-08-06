using FluentAssertions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;
using TaskManagement.Application.Services;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Enums;
using TaskManagement.Domain.Exceptions;
using TaskManagement.Domain.Interfaces;
using TaskManagement.Domain.Services;
using Xunit;

namespace TaskManagement.UnitTests.Application.Services;

public class TarefaServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<ITarefaRepository> _tarefaRepository = new();
    private readonly Mock<IProjetoRepository> _projetoRepository = new();
    private readonly Mock<INotificacaoRepository> _notificacaoRepository = new();
    private readonly Mock<IRealtimeNotifier> _realtimeNotifier = new();
    private readonly IStatusTransitionStrategy _statusStrategy = new FluxoPadraoStatusTransitionStrategy();
    private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
    private readonly TarefaService _sut;

    public TarefaServiceTests()
    {
        _unitOfWork.SetupGet(u => u.Tarefas).Returns(_tarefaRepository.Object);
        _unitOfWork.SetupGet(u => u.Projetos).Returns(_projetoRepository.Object);
        _unitOfWork.SetupGet(u => u.Notificacoes).Returns(_notificacaoRepository.Object);

        _sut = new TarefaService(
            _unitOfWork.Object, _statusStrategy, _realtimeNotifier.Object, _cache, NullLogger<TarefaService>.Instance);
    }

    private static Tarefa CriarTarefa(int? responsavelId = null) =>
        new("Tarefa X", null, Prioridade.Media, projetoId: 1, DateTime.UtcNow.AddDays(5), responsavelId);

    [Fact]
    public async Task CriarAsync_deve_lancar_notfound_quando_projeto_nao_existe()
    {
        _projetoRepository.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync((Projeto?)null);
        var request = new CriarTarefaRequest("Título", null, Prioridade.Alta, 1, DateTime.UtcNow.AddDays(1), null);

        var act = async () => await _sut.CriarAsync(request);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task CriarAsync_com_responsavel_deve_disparar_notificacao_em_tempo_real()
    {
        var projeto = new Projeto("Projeto", null);
        _projetoRepository.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(projeto);
        _tarefaRepository.Setup(r => r.GetByIdComDetalhesAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(CriarTarefa(7));

        var request = new CriarTarefaRequest("Título", null, Prioridade.Alta, 1, DateTime.UtcNow.AddDays(1), 7);

        await _sut.CriarAsync(request);

        _notificacaoRepository.Verify(r => r.AddAsync(It.IsAny<Notificacao>(), It.IsAny<CancellationToken>()), Times.Once);
        _realtimeNotifier.Verify(n => n.NotificarUsuarioAsync(7, It.IsAny<NotificacaoDto>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CriarAsync_sem_responsavel_nao_deve_notificar()
    {
        var projeto = new Projeto("Projeto", null);
        _projetoRepository.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(projeto);
        _tarefaRepository.Setup(r => r.GetByIdComDetalhesAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(CriarTarefa());

        var request = new CriarTarefaRequest("Título", null, Prioridade.Alta, 1, DateTime.UtcNow.AddDays(1), null);

        await _sut.CriarAsync(request);

        _realtimeNotifier.Verify(n => n.NotificarUsuarioAsync(It.IsAny<int>(), It.IsAny<NotificacaoDto>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task AlterarStatusAsync_deve_lancar_excecao_para_transicao_invalida()
    {
        var tarefa = CriarTarefa();
        _tarefaRepository.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(tarefa);

        var act = async () => await _sut.AlterarStatusAsync(1, new AlterarStatusTarefaRequest(StatusTarefa.Concluida));

        await act.Should().ThrowAsync<InvalidStatusTransitionException>();
    }

    [Fact]
    public async Task ExcluirAsync_deve_lancar_domainexception_quando_tarefa_em_andamento()
    {
        var tarefa = CriarTarefa();
        tarefa.AlterarStatus(StatusTarefa.EmAndamento, _statusStrategy);
        _tarefaRepository.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(tarefa);

        var act = async () => await _sut.ExcluirAsync(1);

        await act.Should().ThrowAsync<DomainException>();
        _tarefaRepository.Verify(r => r.Remove(It.IsAny<Tarefa>()), Times.Never);
    }

    [Fact]
    public async Task AtualizarAsync_reatribuicao_deve_disparar_notificacao()
    {
        var tarefa = CriarTarefa(responsavelId: 5);
        _tarefaRepository.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(tarefa);
        _tarefaRepository.Setup(r => r.GetByIdComDetalhesAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(tarefa);

        var request = new AtualizarTarefaRequest("Novo título", null, Prioridade.Urgente, DateTime.UtcNow.AddDays(2), 9);
        await _sut.AtualizarAsync(1, request);

        _realtimeNotifier.Verify(n => n.NotificarUsuarioAsync(9, It.IsAny<NotificacaoDto>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}
