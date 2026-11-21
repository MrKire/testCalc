# Kalkulator-tester: Python, pywinauto og pytest

[pywinauto](https://github.com/pywinauto/pywinauto) med `backend="uia"` styrer appen via UI Automation.

## Krav

- Windows 10/11 med innlogget, ulåst skrivebord
- Python 3.8 eller nyere anbefales (PoC-en er verifisert på 3.7, som er den eneste versjonen på utviklermaskinen)
- Kalkulatoren i Standard-modus

## Kom i gang

```powershell
py -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python -m pytest
```

## Struktur

```
pages/calculator.py      # page object
tests/conftest.py        # calculator_app (session-scope) og calc (nullstilt per test)
tests/test_calculator.py # testene
pytest.ini
```

## Verdt å vite

- `calc.exe` er bare en starter for UWP-appen, så vi kobler til vinduet via tittel ("Kalkulator" eller "Calculator").
- Elementoppslag med `child_window()` tar omtrent 1 sekund hvert. Page objectet henter derfor alle elementer
  i ett `descendants()`-kall og cacher dem. Det tok kjøretiden fra 32 s til 7 s.
- `-p no:faulthandler` i `pytest.ini` skjuler ufarlige COM-meldinger (`0x8001010d`) som ellers vises som "fatal exception".
- Knappetrykk bruker `invoke()` (InvokePattern). Bruk `click_input()` for et ekte museklikk.
