import re

import pytest


@pytest.mark.parametrize(
    "sequence, expected",
    [
        ("7+5=", 12),
        ("12-20=", -8),
        ("6*7=", 42),
        ("8/2=", 4),
        ("1,5+2,25=", 3.75),
        ("999*999=", 998001),
    ],
)
def test_aritmetikk(calc, sequence, expected):
    calc.enter(sequence)
    assert calc.result == pytest.approx(expected)


def test_clear_nullstiller_displayet(calc):
    calc.enter("123")
    calc.clear()
    assert calc.result == 0


def test_deling_paa_null_gir_feilmelding(calc):
    calc.enter("5/0=")
    assert re.search(r"null|zero", calc.display_text, re.IGNORECASE)
