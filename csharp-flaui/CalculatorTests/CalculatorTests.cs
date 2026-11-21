namespace CalculatorTests;

[Collection("Calculator")]
public class CalculatorTests
{
    private readonly CalculatorPage _calc;

    // xUnit lager en ny instans av testklassen per test: nullstill kalkulatoren her.
    public CalculatorTests(CalculatorFixture fixture)
    {
        _calc = fixture.Calc;
        _calc.Clear();
    }

    [Theory]
    [InlineData("7+5=", 12)]
    [InlineData("12-20=", -8)]
    [InlineData("6*7=", 42)]
    [InlineData("8/2=", 4)]
    [InlineData("1,5+2,25=", 3.75)]
    [InlineData("999*999=", 998001)]
    public void Aritmetikk(string sequence, double expected)
    {
        _calc.Enter(sequence);
        Assert.Equal(expected, _calc.Result, precision: 6);
    }

    [Fact]
    public void Clear_nullstiller_displayet()
    {
        _calc.Enter("123");
        _calc.Clear();
        Assert.Equal(0, _calc.Result);
    }

    [Fact]
    public void Deling_paa_null_gir_feilmelding()
    {
        _calc.Enter("5/0=");
        Assert.Matches("(?i)null|zero", _calc.DisplayText);
    }
}
