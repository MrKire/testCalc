namespace CalculatorTests;

/// <summary>Én app-instans som deles av alle testene i samlingen (gjenbrukes for fart).</summary>
public sealed class CalculatorFixture : IDisposable
{
    public CalculatorPage Calc { get; } = new();
    public void Dispose() => Calc.Dispose();
}

[CollectionDefinition("Calculator")]
public class CalculatorCollection : ICollectionFixture<CalculatorFixture>;
