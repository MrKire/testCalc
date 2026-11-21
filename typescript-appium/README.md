# Kalkulator-tester: TypeScript, Playwright Test og Appium (NovaWindows)

**Playwright Test** brukes som testrunner (fixtures, `expect`, rapporter), mens **WebdriverIO** og
**Appium med [NovaWindows Driver](https://github.com/AutomateThePlanet/appium-novawindows-driver)** styrer den native appen.

## Krav

- Windows 10/11 med innlogget, ulåst skrivebord
- Node.js 20 eller nyere
- Kalkulatoren i Standard-modus

## Kom i gang

```powershell
npm install        # installerer også NovaWindows-driveren lokalt i ./.appium (postinstall)
npm test           # Playwright starter og stopper Appium automatisk (webServer i config)
npm run report     # åpner HTML-rapporten
```

## Struktur

```
playwright.config.ts      # workers: 1 og webServer som starter Appium
pages/calculator.ts       # page object: oppstart, press/enter, lesing av display
tests/fixtures.ts         # calculatorApp (worker-scope) og calc (nullstilt per test)
tests/calculator.spec.ts  # testene
scripts/install-driver.mjs
```

## Verdt å vite

- Appium installeres som devDependency, og driveren havner i prosjektlokal `APPIUM_HOME` (`./.appium`).
  Ingenting installeres globalt.
- Elementer finnes med `~automationId`, som NovaWindows mapper til UIA AutomationId.
- Knappetrykk bruker `driver.executeScript('windows: invoke', [element])` (UIA InvokePattern).
  Vanlig `element.click()` er et simulert museklikk, og mistet av og til trykk i PoC-en.
- Appen startes med AppUserModelId (`Microsoft.WindowsCalculator_8wekyb3d8bbwe!App`).
  For en vanlig `.exe` setter du full sti i `appium:app`.
