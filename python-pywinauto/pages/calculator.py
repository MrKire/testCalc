"""Page object for Windows-kalkulatoren (samme mønster som et Playwright page object)."""
import re
import subprocess

from pywinauto import Desktop

# Tegn -> AutomationId. AutomationId er språkuavhengig, i motsetning til knappenavnene.
KEYS = {
    **{str(d): f"num{d}Button" for d in range(10)},
    "+": "plusButton",
    "-": "minusButton",
    "*": "multiplyButton",
    "/": "divideButton",
    "=": "equalButton",
    ",": "decimalSeparatorButton",
    ".": "decimalSeparatorButton",
    "C": "clearButton",
}

TITLE = "Kalkulator|Calculator"  # norsk eller engelsk Windows


class CalculatorPage:
    def __init__(self, window):
        self.window = window
        self._buttons = {}  # cache: å lete opp elementer i UIA-treet er tregt

    @classmethod
    def launch(cls, timeout=15):
        # calc.exe er bare en starter som åpner selve UWP-appen, så vi kobler oss
        # til vinduet via tittel i stedet for via prosessen vi startet.
        subprocess.Popen("calc.exe")
        window = Desktop(backend="uia").window(title_re=TITLE, control_type="Window")
        window.wait("visible", timeout=timeout)
        page = cls(window)
        try:
            page.ensure_standard_mode()
        except Exception:
            page.close()  # ikke la appen bli hengende hvis oppstarten feiler
            raise
        return page

    def ensure_standard_mode(self):
        # Kalkulatoren husker siste modus. Vi forutsetter Standard-modus.
        # Venter litt, siden UI-et kan bruke noen sekunder på å laste ved kaldstart.
        if not self.window.child_window(auto_id="squareRootButton").exists(timeout=10):
            raise RuntimeError("Kalkulatoren må være i Standard-modus for disse testene")

    def press(self, key):
        # invoke() bruker UIA InvokePattern: raskt og uavhengig av musepeker/fokus.
        # Bruk click_input() hvis du vil simulere et ekte museklikk.
        self._element(KEYS[key]).invoke()

    def _element(self, auto_id):
        if not self._buttons:
            # Ett søk gjennom hele UIA-treet er mye raskere enn ett child_window()-oppslag per element.
            self._buttons = {e.element_info.automation_id: e for e in self.window.descendants()}
        return self._buttons[auto_id]

    def enter(self, sequence):
        """Trykker en sekvens, f.eks. '12+30='. Mellomrom ignoreres."""
        for ch in sequence.replace(" ", ""):
            self.press(ch)

    def clear(self):
        self.press("C")

    @property
    def display_text(self):
        # f.eks. "Resultatet er 1 234,5" / "Display is 1,234.5"
        raw = self._element("CalculatorResults").window_text()
        return re.sub(r"^(Resultatet er|Display is)\s*", "", raw).strip()

    @property
    def result(self):
        """Tallet i displayet som float (håndterer norsk desimalkomma og tusenskille)."""
        text = self.display_text.replace("\u2212", "-")   # typografisk minus
        text = re.sub("[\\s\u00a0\u202f]", "", text)     # tusenskille (mellomrom)
        if "," in text:                                    # norsk format
            text = text.replace(".", "").replace(",", ".")
        else:                                              # engelsk format
            text = text.replace(",", "")
        return float(text)

    def close(self):
        self.window.close()
