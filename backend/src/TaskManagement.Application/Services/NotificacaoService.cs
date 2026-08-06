using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Domain.Exceptions;
using TaskManagement.Domain.Interfaces;

namespace TaskManagement.Application.Services;

public class NotificacaoService : INotificacaoService
{
    private readonly IUnitOfWork _unitOfWork;

    public NotificacaoService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<NotificacaoDto>> ListarPorUsuarioAsync(int usuarioId, CancellationToken ct = default)
    {
        var notificacoes = await _unitOfWork.Notificacoes.GetPorUsuarioAsync(usuarioId, ct);
        return notificacoes.Select(n => new NotificacaoDto(n.Id, n.Mensagem, n.Lida, n.DataCriacao, n.TarefaId)).ToList();
    }

    public async Task MarcarComoLidaAsync(int notificacaoId, CancellationToken ct = default)
    {
        var notificacao = await _unitOfWork.Notificacoes.GetByIdAsync(notificacaoId, ct)
            ?? throw new NotFoundException(nameof(Notificacao), notificacaoId);

        notificacao.MarcarComoLida();
        _unitOfWork.Notificacoes.Update(notificacao);
        await _unitOfWork.SaveChangesAsync(ct);
    }
}
