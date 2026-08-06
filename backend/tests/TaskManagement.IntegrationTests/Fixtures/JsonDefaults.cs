using System.Text.Json;
using System.Text.Json.Serialization;

namespace TaskManagement.IntegrationTests.Fixtures;

/// <summary>
/// A API serializa enums como string (ver Program.cs, JsonStringEnumConverter). Os testes
/// de integração precisam das mesmas opções para (de)serializar como um cliente real faria.
/// </summary>
public static class JsonDefaults
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };
}
