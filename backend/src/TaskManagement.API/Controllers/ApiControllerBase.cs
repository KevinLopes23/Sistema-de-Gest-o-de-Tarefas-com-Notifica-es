using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace TaskManagement.API.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("Usuário autenticado sem claim de identificador."));
}
