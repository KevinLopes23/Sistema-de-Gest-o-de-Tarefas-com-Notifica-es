using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Application.DTOs;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.API.Controllers;

[Authorize]
[Route("api/projetos")]
public class ProjetosController : ApiControllerBase
{
    private readonly IProjetoService _projetoService;

    public ProjetosController(IProjetoService projetoService)
    {
        _projetoService = projetoService;
    }

    /// <summary>Lista todos os projetos.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ProjetoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(CancellationToken ct) =>
        Ok(await _projetoService.ListarAsync(ct));

    /// <summary>Obtém um projeto pelo ID.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ProjetoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(int id, CancellationToken ct) =>
        Ok(await _projetoService.ObterPorIdAsync(id, ct));

    /// <summary>Cria um novo projeto.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProjetoDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Criar([FromBody] CriarProjetoRequest request, CancellationToken ct)
    {
        var projeto = await _projetoService.CriarAsync(request, ct);
        return CreatedAtAction(nameof(ObterPorId), new { id = projeto.Id }, projeto);
    }

    /// <summary>Atualiza um projeto existente.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ProjetoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AtualizarProjetoRequest request, CancellationToken ct) =>
        Ok(await _projetoService.AtualizarAsync(id, request, ct));

    /// <summary>Exclui um projeto (somente se não houver tarefas vinculadas).</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Excluir(int id, CancellationToken ct)
    {
        await _projetoService.ExcluirAsync(id, ct);
        return NoContent();
    }
}
