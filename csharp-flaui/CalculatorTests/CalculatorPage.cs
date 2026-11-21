using System.Globalization;
using System.Text.RegularExpressions;
using FlaUI.Core;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Tools;
using FlaUI.UIA3;

namespace CalculatorTests;

/// <summary>Page object for Windows-kalkulatoren (samme mønster som et Playwright page object).</summary>
public sealed class CalculatorPage : IDisposable
{
    // Tegn -> AutomationId. AutomationId er språkuavhengig, i motsetning til knappenavnene.
    private static readonly Dictionary<char, string> Keys = new()
    {
        ['0'] = "num0Button", ['1'] = "num1Button", ['2'] = "num2Button", ['3'] = "num3Button",
        ['4'] = "num4Button", ['5'] = "num5Button", ['6'] = "num6Button", ['7'] = "num7Button",
        ['8'] = "num8Button", ['9'] = "num9Button",
        ['+'] = "plusButton", ['-'] = "minusButton", ['*'] = "multiplyButton", ['/'] = "divideButton",
        ['='] = "equalButton", [','] = "decimalSeparatorButton", ['.'] = "decimalSeparatorButton",
        ['C'] = "clearButton",
    };

    private readonly Application _app;
    private readonly UIA3Automation _automation;
    private readonly Window _window;
    private readonly Dictionary<string, Button> _buttons = new(); // cache: oppslag i UIA-treet er tregt

    public CalculatorPage()
    {
        _automation = new UIA3Automation();
        // Starter UWP-appen via AppUserModelId og kobler til riktig prosess (CalculatorApp.exe).
        _app = Application.LaunchStoreApp("Microsoft.WindowsCalculator_8wekyb3d8bbwe!App");
        _window = _app.GetMainWindow(_automation, TimeSpan.FromSeconds(15))
                  ?? throw new InvalidOperationException("Fant ikke kalkulatorvinduet");

        // Kalkulatoren husker siste modus. Vi forutsetter Standard-modus.
        if (FindById("squareRootButton") is null)
            throw new InvalidOperationException("Kalkulatoren må være i Standard-modus for disse testene");
    }

    private AutomationElement? FindById(string automationId) =>
        Retry.WhileNull(
            () => _window.FindFirstDescendant(cf => cf.ByAutomationId(automationId)),
            TimeSpan.FromSeconds(5)).Result;

    public void Press(char key)
    {
        var id = Keys[key];
        if (!_buttons.TryGetValue(id, out var button))
        {
            button = FindById(id)?.AsButton() ?? throw new InvalidOperationException($"Fant ikke {id}");
            _buttons[id] = button;
        }
        // Invoke() bruker UIA InvokePattern: raskt og uavhengig av musepeker/fokus.
        // Bruk button.Click() hvis du vil simulere et ekte museklikk.
        button.Invoke();
    }

    /// <summary>Trykker en sekvens, f.eks. "12+30=". Mellomrom ignoreres.</summary>
    public void Enter(string sequence)
    {
        foreach (var ch in sequence.Where(c => !char.IsWhiteSpace(c))) Press(ch);
    }

    public void Clear() => Press('C');

    /// <summary>Teksten i displayet uten prefiks, f.eks. "1 234,5".</summary>
    public string DisplayText
    {
        get
        {
            var raw = FindById("CalculatorResults")!.Name; // "Resultatet er 12" / "Display is 12"
            return Regex.Replace(raw, @"^(Resultatet er|Display is)\s*", "").Trim();
        }
    }

    /// <summary>Tallet i displayet (håndterer norsk desimalkomma og tusenskille).</summary>
    public double Result
    {
        get
        {
            var text = DisplayText.Replace('\u2212', '-');      // typografisk minus
            text = Regex.Replace(text, "[\\s\u00a0\u202f]", ""); // tusenskille (mellomrom)
            text = text.Contains(',') ? text.Replace(".", "").Replace(',', '.') : text.Replace(",", "");
            return double.Parse(text, CultureInfo.InvariantCulture);
        }
    }

    public void Dispose()
    {
        // UWP-vinduet støtter ikke WindowPattern.Close, så vi lukker via prosessen.
        _app.Close();
        _app.Dispose();
        _automation.Dispose();
    }
}
