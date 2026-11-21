import { remote, type Browser } from 'webdriverio';

/** Tegn -> AutomationId. AutomationId er språkuavhengig, i motsetning til knappenavnene. */
const KEYS: Record<string, string> = {
  ...Object.fromEntries([...'0123456789'].map((d) => [d, `num${d}Button`])),
  '+': 'plusButton',
  '-': 'minusButton',
  '*': 'multiplyButton',
  '/': 'divideButton',
  '=': 'equalButton',
  ',': 'decimalSeparatorButton',
  '.': 'decimalSeparatorButton',
  C: 'clearButton',
};

/** Page object for Windows-kalkulatoren – samme mønster som et Playwright page object. */
export class CalculatorPage {
  private constructor(readonly driver: Browser) {}

  static async launch(port: number): Promise<CalculatorPage> {
    const driver = await remote({
      hostname: '127.0.0.1',
      port,
      logLevel: 'warn',
      capabilities: {
        platformName: 'Windows',
        'appium:automationName': 'NovaWindows',
        // AppUserModelId for den innebygde UWP-kalkulatoren
        'appium:app': 'Microsoft.WindowsCalculator_8wekyb3d8bbwe!App',
      },
    });
    const page = new CalculatorPage(driver);
    try {
      await page.ensureStandardMode();
    } catch (err) {
      await driver.deleteSession(); // ikke la appen bli hengende hvis oppstarten feiler
      throw err;
    }
    return page;
  }

  /** "~id" er accessibility id, som NovaWindows mapper til UIA AutomationId. */
  private byId(automationId: string) {
    return this.driver.$(`~${automationId}`);
  }

  async ensureStandardMode() {
    // Kalkulatoren husker siste modus. Vi forutsetter Standard-modus.
    // waitForExist venter på at UI-et er lastet (kaldstart kan ta noen sekunder).
    await this.byId('squareRootButton').waitForExist({
      timeout: 15_000,
      timeoutMsg: 'Kalkulatoren må være i Standard-modus for disse testene',
    });
  }

  private readonly buttons = new Map<string, WebdriverIO.Element>(); // cache: oppslag i UIA-treet er tregt

  async press(key: string) {
    const id = KEYS[key];
    let button = this.buttons.get(id);
    if (!button) {
      button = await this.byId(id).getElement();
      this.buttons.set(id, button);
    }
    // "windows: invoke" bruker UIA InvokePattern. Det er raskt og robust, og uavhengig av
    // musepeker og fokus. element.click() simulerer et ekte museklikk, som kan miste trykk.
    await this.driver.executeScript('windows: invoke', [button]);
  }

  /** Trykker en sekvens, f.eks. "12+30=". Mellomrom ignoreres. */
  async enter(sequence: string) {
    for (const ch of sequence.replace(/\s/g, '')) await this.press(ch);
  }

  async clear() {
    await this.press('C');
  }

  /** Teksten i displayet uten prefiks, f.eks. "1 234,5". */
  async displayText(): Promise<string> {
    const raw = await this.byId('CalculatorResults').getText(); // "Resultatet er 12" / "Display is 12"
    return raw.replace(/^(Resultatet er|Display is)\s*/, '').trim();
  }

  /** Tallet i displayet (håndterer norsk desimalkomma og tusenskille). */
  async result(): Promise<number> {
    let text = (await this.displayText())
      .replace(/\u2212/g, '-') // typografisk minus
      .replace(/[\s\u00a0\u202f]/g, ''); // tusenskille (mellomrom)
    text = text.includes(',') ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');
    return Number(text);
  }

  async close() {
    await this.driver.deleteSession(); // lukker også appen
  }
}
