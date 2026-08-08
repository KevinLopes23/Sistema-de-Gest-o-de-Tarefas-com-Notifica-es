using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Exceptions;
using TaskManagement.Domain.Interfaces;

namespace TaskManagement.Application.Services;

public class ProjetoService : IProjetoService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IRealtimeNotifier _realtimeNotifier;
    private readonly IMemoryCache _cache;
    private readonly ILogger<ProjetoService> _logger;

    public ProjetoService(
        IUnitOfWork unitOfWork, IRealtimeNotifier realtimeNotifier, IMemoryCache cache, ILogger<ProjetoService> logger)
    {
        _unitOfWork = unitOfWork;
        _realtimeNotifier = realtimeNotifier;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IReadOnlyList<ProjetoDto>> ListarAsync(CancellationToken ct = default)
    {
        var projetos = await _unitOfWork.Projetos.ListarComTarefasAsync(ct);
        return projetos.Select(Map).ToList();
    }

    public async Task<ProjetoDto> ObterPorIdAsync(int id, CancellationToken ct = default)
    {
        var projeto = await _unitOfWork.Projetos.GetByIdComTarefasAsync(id, ct)
            ?? throw new NotFoundException(nameof(Projeto), id);
        return Map(projeto);
    }

    public async Task<ProjetoDto> CriarAsync(CriarProjetoRequest request, CancellationToken ct = default)
    {
        var projeto = new Projeto(request.Nome, request.Descricao);
        await _unitOfWork.Projetos.AddAsync(projeto, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Projeto {ProjetoId} '{Nome}' criado", projeto.Id, projeto.Nome);
        InvalidarCacheDashboard();
        await _realtimeNotifier.NotificarMudancaDadosAsync(ct);
        return Map(projeto);
    }

    public async Task<ProjetoDto> AtualizarAsync(int id, AtualizarProjetoRequest request, CancellationToken ct = default)
    {
        var projeto = await _unitOfWork.Projetos.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Projeto), id);

        projeto.AtualizarDados(request.Nome, request.Descricao);
        _unitOfWork.Projetos.Update(projeto);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Projeto {ProjetoId} atualizado", id);
        await _realtimeNotifier.NotificarMudancaDadosAsync(ct);
        return await ObterPorIdAsync(id, ct);
    }

    public async Task ExcluirAsync(int id, CancellationToken ct = default)
    {
        var projeto = await _unitOfWork.Projetos.GetByIdComTarefasAsync(id, ct)
            ?? throw new NotFoundException(nameof(Projeto), id);

        projeto.GarantirQuePodeSerExcluido();

        _unitOfWork.Projetos.Remove(projeto);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Projeto {ProjetoId} excluído", id);
        InvalidarCacheDashboard();
        await _realtimeNotifier.NotificarMudancaDadosAsync(ct);
    }

    private void InvalidarCacheDashboard() => _cache.Remove(DashboardService.CacheKey);

    private static ProjetoDto Map(Projeto p) => new(
        p.Id, p.Nome, p.Descricao, p.DataCriacao, p.TotalTarefas, p.TotalTarefasConcluidas);
}
