namespace TaskManagement.Domain.Exceptions;

/// <summary>
/// Violação de uma regra de negócio. Mapeada para HTTP 400/409 na camada de API.
/// </summary>
public class DomainException : Exception
{
    public DomainException(string message) : base(message)
    {
    }
}

public class NotFoundException : Exception
{
    public NotFoundException(string entity, object id)
        : base($"{entity} com id '{id}' não foi encontrado(a).")
    {
    }
}

public class InvalidStatusTransitionException : DomainException
{
    public InvalidStatusTransitionException(string from, string to)
        : base($"Transição de status inválida: '{from}' → '{to}'. Fluxo permitido: Pendente → Em Andamento → Concluída.")
    {
    }
}
