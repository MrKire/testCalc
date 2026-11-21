import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pages.calculator import CalculatorPage  # noqa: E402


@pytest.fixture(scope="session")
def calculator_app():
    app = CalculatorPage.launch()
    yield app
    app.close()


@pytest.fixture
def calc(calculator_app):
    """Ny, nullstilt kalkulator for hver test (gjenbruker samme vindu for fart)."""
    calculator_app.clear()
    return calculator_app
