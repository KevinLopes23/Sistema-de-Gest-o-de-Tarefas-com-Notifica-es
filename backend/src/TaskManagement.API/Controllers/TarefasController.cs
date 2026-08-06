using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Enums;

namespace TaskManagement.API.Controllers;

[Authorize]
[Route("api/tarefas")]
public class TarefasController : ApiControllerBase
{
    private readonly ITarefaService _tarefaService;

    public TarefasController(ITarefaService tarefaService)
    {
        _tarefaService = tarefaService;
    }

    /// <summary>Lista tarefas com filtros opcionais por projeto, status, responsável e prazo.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TarefaDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(
        [FromQuery] int? projetoId,
        [FromQuery] StatusTarefa? status,
        [FromQuery] int? responsavelId,
        [FromQuery] DateTime? prazoAte,
        [FromQuery] string? ordenarPor,
        [FromQuery] bool descendente,
        CancellationToken ct)
    {
        var filtro = new TarefaFiltroRequest(projetoId, status, responsavelId, prazoAte, ordenarPor, descendente);
        return Ok(await _tarefaService.ListarAsync(filtro, ct));
    }

    /// <summary>Obtém uma tarefa pelo ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(TarefaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(int id, CancellationToken ct) =>
        Ok(await _tarefaService.ObterPorIdAsync(id, ct));

    /// <summary>Cria uma nova tarefa.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(TarefaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Criar([FromBody] CriarTarefaRequest request, CancellationToken ct)
    {
        var tarefa = await _tarefaService.CriarAsync(request, ct);
        return CreatedAtAction(nameof(ObterPorId), new { id = tarefa.Id }, tarefa);
    }

    /// <summary>Atualiza os dados de uma tarefa (título, descrição, prioridade, prazo, responsável).</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(TarefaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarTarefaRequest request, CancellationToken ct) =>
        Ok(await _tarefaService.AtualizarAsync(id, request, ct));

    /// <summary>Altera apenas o status da tarefa, respeitando o fluxo Pendente → Em Andamento → Concluída.</summary>
    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(TarefaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AlterarStatus(int id, [FromBody] AlterarStatusTarefaRequest request, CancellationToken ct) =>
        Ok(await _tarefaService.AlterarStatusAsync(id, request, ct));

    /// <summary>Exclui uma tarefa (não permitido quando o status é "Em Andamento").</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Excluir(int id, CancellationToken ct)
    {
        await _tarefaService.ExcluirAsync(id, ct);
        return NoContent();
    }
}
