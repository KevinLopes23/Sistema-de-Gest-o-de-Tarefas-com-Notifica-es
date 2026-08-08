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
using Xunit;

namespace TaskManagement.UnitTests.Application.Services;

public class ProjetoServiceTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IProjetoRepository> _projetoRepository = new();
    private readonly Mock<IRealtimeNotifier> _realtimeNotifier = new();
    private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
    private readonly ProjetoService _sut;

    public ProjetoServiceTests()
    {
        _unitOfWork.SetupGet(u => u.Projetos).Returns(_projetoRepository.Object);
        _sut = new ProjetoService(_unitOfWork.Object, _realtimeNotifier.Object, _cache, NullLogger<ProjetoService>.Instance);
    }

    [Fact]
    public async Task CriarAsync_deve_persistir_projeto_e_retornar_dto()
    {
        var request = new CriarProjetoRequest("Novo projeto", "Descrição do projeto");

        var resultado = await _sut.CriarAsync(request);

        resultado.Nome.Should().Be("Novo projeto");
        _projetoRepository.Verify(r => r.AddAsync(It.IsAny<Projeto>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ObterPorIdAsync_deve_lancar_notfound_quando_projeto_nao_existe()
    {
        _projetoRepository.Setup(r => r.GetByIdComTarefasAsync(99, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Projeto?)null);

        var act = async () => await _sut.ObterPorIdAsync(99);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task ExcluirAsync_deve_lancar_domainexception_quando_projeto_possui_tarefas()
    {
        var projeto = new Projeto("Projeto com tarefas", null);
        var tarefa = new Tarefa("Tarefa", null, Prioridade.Baixa, projeto.Id, DateTime.UtcNow.AddDays(2));
        projeto.AdicionarTarefaExistente(tarefa);

        _projetoRepository.Setup(r => r.GetByIdComTarefasAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(projeto);

        var act = async () => await _sut.ExcluirAsync(1);

        await act.Should().ThrowAsync<DomainException>();
        _projetoRepository.Verify(r => r.Remove(It.IsAny<Projeto>()), Times.Never);
    }

    [Fact]
    public async Task ExcluirAsync_deve_remover_projeto_sem_tarefas()
    {
        var projeto = new Projeto("Projeto vazio", null);
        _projetoRepository.Setup(r => r.GetByIdComTarefasAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(projeto);

        await _sut.ExcluirAsync(1);

        _projetoRepository.Verify(r => r.Remove(projeto), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ExcluirAsync_deve_notificar_mudanca_de_dados_para_outras_sessoes()
    {
        var projeto = new Projeto("Projeto vazio", null);
        _projetoRepository.Setup(r => r.GetByIdComTarefasAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(projeto);

        await _sut.ExcluirAsync(1);

        _realtimeNotifier.Verify(n => n.NotificarMudancaDadosAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
