using FluentValidation;
using TaskManagement.Application.DTOs;

namespace TaskManagement.Application.Validators;

public class CriarTarefaRequestValidator : AbstractValidator<CriarTarefaRequest>
{
    public CriarTarefaRequestValidator()
    {
        RuleFor(x => x.Titulo).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descricao).MaximumLength(4000);
        RuleFor(x => x.Prioridade).IsInEnum();
        RuleFor(x => x.ProjetoId).GreaterThan(0);
        RuleFor(x => x.DataPrazo).NotEqual(default(DateTime));
    }
}

public class AtualizarTarefaRequestValidator : AbstractValidator<AtualizarTarefaRequest>
{
    public AtualizarTarefaRequestValidator()
    {
        RuleFor(x => x.Titulo).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Descricao).MaximumLength(4000);
        RuleFor(x => x.Prioridade).IsInEnum();
        RuleFor(x => x.DataPrazo).NotEqual(default(DateTime));
    }
}

public class AlterarStatusTarefaRequestValidator : AbstractValidator<AlterarStatusTarefaRequest>
{
    public AlterarStatusTarefaRequestValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
    }
}
