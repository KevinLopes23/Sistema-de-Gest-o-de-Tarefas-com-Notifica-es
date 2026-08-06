using FluentValidation;
using TaskManagement.Application.DTOs;

namespace TaskManagement.Application.Validators;

public class CriarProjetoRequestValidator : AbstractValidator<CriarProjetoRequest>
{
    public CriarProjetoRequestValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Descricao).MaximumLength(2000);
    }
}

public class AtualizarProjetoRequestValidator : AbstractValidator<AtualizarProjetoRequest>
{
    public AtualizarProjetoRequestValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Descricao).MaximumLength(2000);
    }
}
