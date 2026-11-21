# Kalkulator-tester: C#, FlaUI og xUnit

[FlaUI](https://github.com/FlaUI/FlaUI) kaller UI Automation (UIA3) direkte fra testprosessen.
Det gir ingen server og ingen HTTP, og er derfor raskt.

## Krav

- Windows 10/11 med innlogget, ulåst skrivebord
- .NET 8 SDK (`winget install Microsoft.DotNet.SDK.8`)
- Kalkulatoren i Standard-modus

## Kom i gang

```powershell
dotnet test
```

Testene kan også kjøres fra Visual Studio eller Rider (Test Explorer).

## Struktur

```
CalculatorTests/CalculatorPage.cs     # page object
CalculatorTests/CalculatorFixture.cs  # én app-instans delt av testene (ICollectionFixture)
CalculatorTests/CalculatorTests.cs    # testene ([Theory]/[Fact])
CalculatorTests/xunit.runner.json     # slår av parallellkjøring
nuget.config                          # låser pakkekilde til nuget.org
```

## Verdt å vite

- `Application.LaunchStoreApp(...)` starter UWP-apper og kobler til riktig prosess.
  For vanlige apper bruker du `Application.Launch("sti\\til\\app.exe")`.
- UWP-vinduet støtter ikke `Window.Close()`. Appen lukkes med `Application.Close()`.
- Knappetrykk bruker `button.Invoke()` (InvokePattern). Bruk `button.Click()` for et ekte museklikk.
