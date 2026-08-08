using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Exceptions;
using TaskManagement.Domain.Interfaces;
using TaskManagement.Domain.Services;

namespace TaskManagement.Application.Services;

public class TarefaService : ITarefaService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IStatusTransitionStrategy _statusTransitionStrategy;
    private readonly IRealtimeNotifier _realtimeNotifier;
    private readonly IMemoryCache _cache;
    private readonly ILogger<TarefaService> _logger;

    public TarefaService(
        IUnitOfWork unitOfWork,
        IStatusTransitionStrategy statusTransitionStrategy,
        IRealtimeNotifier realtimeNotifier,
        IMemoryCache cache,
        ILogger<TarefaService> logger)
    {
        _unitOfWork = unitOfWork;
        _statusTransitionStrategy = statusTransitionStrategy;
        _realtimeNotifier = realtimeNotifier;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IReadOnlyList<TarefaDto>> ListarAsync(TarefaFiltroRequest filtro, CancellationToken ct = default)
    {
        var tarefas = await _unitOfWork.Tarefas.ListarComFiltrosAsync(new TarefaFiltro
        {
            ProjetoId = filtro.ProjetoId,
            Status = filtro.Status,
            ResponsavelId = filtro.ResponsavelId,
            PrazoAte = filtro.PrazoAte,
            OrdenarPor = filtro.OrdenarPor,
            Descendente = filtro.Descendente
        }, ct);

        return tarefas.Select(Map).ToList();
    }

    public async Task<TarefaDto> ObterPorIdAsync(int id, CancellationToken ct = default)
    {
        var tarefa = await _unitOfWork.Tarefas.GetByIdComDetalhesAsync(id, ct)
            ?? throw new NotFoundException(nameof(Tarefa), id);
        return Map(tarefa);
    }

    public async Task<TarefaDto> CriarAsync(CriarTarefaRequest request, CancellationToken ct = default)
    {
        var projeto = await _unitOfWork.Projetos.GetByIdAsync(request.ProjetoId, ct)
            ?? throw new NotFoundException(nameof(Projeto), request.ProjetoId);

        var tarefa = new Tarefa(request.Titulo, request.Descricao, request.Prioridade, projeto.Id, request.DataPrazo, request.ResponsavelId);
        await _unitOfWork.Tarefas.AddAsync(tarefa, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Tarefa {TarefaId} '{Titulo}' criada no projeto {ProjetoId}", tarefa.Id, tarefa.Titulo, projeto.Id);

        if (request.ResponsavelId.HasValue)
            await NotificarAtribuicaoAsync(tarefa, request.ResponsavelId.Value, ct);

        InvalidarCacheDashboard();
        await _realtimeNotifier.NotificarMudancaDadosAsync(ct);
        return await ObterPorIdAsync(tarefa.Id, ct);
    }

    public async Task<TarefaDto> AtualizarAsync(int id, AtualizarTarefaRequest request, CancellationToken ct = default)
    {
        var tarefa = await _unitOfWork.Tarefas.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Tarefa), id);

        tarefa.AtualizarDados(request.Titulo, request.Descricao, request.Prioridade, request.DataPrazo);
        var responsavelMudou = tarefa.AtribuirResponsavel(request.ResponsavelId);

        _unitOfWork.Tarefas.Update(tarefa);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Tarefa {TarefaId} atualizada", id);

        if (responsavelMudou && request.ResponsavelId.HasValue)
            await NotificarAtribuicaoAsync(tarefa, request.ResponsavelId.Value, ct);

        InvalidarCacheDashboard();
        await _realtimeNotifier.NotificarMudancaDadosAsync(ct);
        return await ObterPorIdAsync(id, ct);
    }

    public async Task<TarefaDto> AlterarStatusAsync(int id, AlterarStatusTarefaRequest request, CancellationToken ct = default)
    {
        var tarefa = await _unitOfWork.Tarefas.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Tarefa), id);

        tarefa.AlterarStatus(request.Status, _statusTransitionStrategy);

        _unitOfWork.Tarefas.Update(tarefa);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Tarefa {TarefaId} alterou status para {Status}", id, request.Status);

        InvalidarCacheDashboard();
        await _realtimeNotifier.NotificarMudancaDadosAsync(ct);
        return await ObterPorIdAsync(id, ct);
    }

    public async Task ExcluirAsync(int id, CancellationToken ct = default)
    {
        var tarefa = await _unitOfWork.Tarefas.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Tarefa), id);

        tarefa.GarantirQuePodeSerExcluida();

        _unitOfWork.Tarefas.Remove(tarefa);
        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Tarefa {TarefaId} excluída", id);
        InvalidarCacheDashboard();
        await _realtimeNotifier.NotificarMudancaDadosAsync(ct);
    }

    private async Task NotificarAtribuicaoAsync(Tarefa tarefa, int responsavelId, CancellationToken ct)
    {
        var mensagem = $"Você foi atribuído à tarefa '{tarefa.Titulo}' (prazo: {tarefa.DataPrazo:dd/MM/yyyy}).";
        var notificacao = new Notificacao(responsavelId, mensagem, tarefa.Id);

        await _unitOfWork.Notificacoes.AddAsync(notificacao, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        await _realtimeNotifier.NotificarUsuarioAsync(
            responsavelId,
            new NotificacaoDto(notificacao.Id, notificacao.Mensagem, notificacao.Lida, notificacao.DataCriacao, tarefa.Id),
            ct);
    }

    private void InvalidarCacheDashboard() => _cache.Remove(DashboardService.CacheKey);

    private static TarefaDto Map(Tarefa t) => new(
        t.Id, t.Titulo, t.Descricao, t.Status, t.Prioridade,
        t.ProjetoId, t.Projeto?.Nome,
        t.ResponsavelId, t.Responsavel?.Nome,
        t.DataCriacao, t.DataPrazo, t.DataConclusao, t.IsAtrasada);
}
