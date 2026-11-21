# PoC: Testautomatisering av native Windows-apper

Tre prosjekter tester **Windows-kalkulatoren** med de samme 8 testene, hver med sin teknologi.
Formålet er å sammenligne verktøyene for testing av native Windows-applikasjoner.

> **Hvorfor ikke bare Playwright?** Playwright styrer kun nettlesere (og Electron) via nettleserprotokoller.
> Native Windows-apper (Win32, WPF, WinForms, UWP/WinUI) må styres via **UI Automation (UIA)**, Windows sitt
> tilgjengelighets-API. Alle tre prosjektene under bygger på UIA.

| Prosjekt | Språk | Verktøy | Testrunner | Kjøretid (8 tester) |
|---|---|---|---|---|
| [`typescript-appium/`](typescript-appium/) | TypeScript | Appium + NovaWindows Driver via WebdriverIO | **Playwright Test** | ~12 s |
| [`csharp-flaui/`](csharp-flaui/) | C# (.NET 8) | FlaUI (UIA3) | xUnit | ~1 s (+ bygg) |
| [`python-pywinauto/`](python-pywinauto/) | Python | pywinauto (UIA-backend) | pytest | ~7 s |

## Hva testene dekker

Alle prosjektene har samme struktur: et **page object** (`CalculatorPage`), en fixture som starter appen
én gang og nullstiller den før hver test, og disse testene:

- Aritmetikk (parametrisert): `7+5=12`, `12-20=-8`, `6*7=42`, `8/2=4`, `1,5+2,25=3,75`, `999*999=998001`
- Clear nullstiller displayet
- Deling på null gir feilmelding

## Sammenligning

| | TypeScript / Appium | C# / FlaUI | Python / pywinauto |
|---|---|---|---|
| **Passer for teamet (TS/Playwright-kultur)** | Best: samme runner, fixtures, `expect` og HTML-rapport | Krever C#-kompetanse | Krever Python-kompetanse |
| **Arkitektur** | Klient → HTTP (WebDriver) → Appium-server → UIA | Direkte UIA-kall i prosessen | Direkte UIA-kall i prosessen |
| **Hastighet** | Middels (HTTP-runde per kommando) | Raskest | Middels (tregt elementsøk, må caches) |
| **Oppsett** | `npm install` (Appium og driver installeres lokalt) | .NET SDK | Python og venv |
| **Modenhet** | NovaWindows er ny (2024–), aktiv utvikling | Moden, mye brukt | Moden, men lite vedlikeholdt de siste årene |
| **Kjør på annen maskin / grid** | Ja (Appium-server kan stå remote) | Nei (lokalt) | Nei (lokalt) |
| **Passer best når** | Teamet vil ha én verktøykjede (Playwright) for web og desktop | Appen er .NET (WPF/WinForms), og dev-teamet skriver testene | Rask scripting eller RPA-aktige oppgaver |

**Anbefaling:** Start med **TypeScript/Appium**, siden det lar teamet bruke Playwright Test som de allerede kjenner.
Velg **C#/FlaUI** hvis applikasjonen dere skal teste er .NET-basert og utviklerne skal eie testene, eller hvis
hastighet og stabilitet over UIA er viktigst.

## Erfaringer fra PoC-en (gjelder alle verktøyene)

- **Bruk AutomationId, ikke tekst.** Knappenavnene er lokaliserte ("Pluss" og "Plus"), mens AutomationId (`plusButton`) er stabil.
  Be utviklerne sette AutomationId på kontrollene i egen app. Det tilsvarer `data-testid` på web.
- **Bruk InvokePattern i stedet for museklikk.** Simulerte museklikk mistet av og til et tastetrykk (flaky test).
  `invoke` er raskere og uavhengig av musepeker og fokus.
- **Vent eksplisitt ved oppstart.** UI-et kan bruke flere sekunder på å laste ved kaldstart.
- **Rydd opp ved feil.** Hvis oppstarten feiler, må appen lukkes, ellers blir prosessene hengende igjen.
- **Cache elementoppslag.** Søk i UIA-treet er tregt. I pywinauto gikk kjøretiden fra 32 s til 7 s.
- **Desktop-tester kjører sekvensielt** (ett vindu, én mus), og krever en innlogget, ulåst Windows-sesjon.
  I CI betyr det en dedikert Windows-agent med autologin, ikke en tjeneste i "session 0".
- Testene forutsetter at kalkulatoren står i **Standard-modus** (den husker siste modus).
- **Verktøy for å finne AutomationId:** [Accessibility Insights for Windows](https://accessibilityinsights.io/downloads/)
  eller `inspect.exe` fra Windows SDK. Det tilsvarer DevTools på web.
