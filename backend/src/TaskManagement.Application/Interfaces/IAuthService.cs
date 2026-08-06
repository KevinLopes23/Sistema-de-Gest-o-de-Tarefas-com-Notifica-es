using TaskManagement.Application.DTOs;

namespace TaskManagement.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegistrarAsync(RegisterRequest request, CancellationToken ct = default);
    Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken ct = default);
}
