import { test as base } from '@playwright/test';
import { CalculatorPage } from '../pages/calculator';
import { APPIUM_PORT } from '../playwright.config';

type TestFixtures = { calc: CalculatorPage };
type WorkerFixtures = { calculatorApp: CalculatorPage };

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Én app-instans per worker (gjenbrukes på tvers av tester for fart)
  calculatorApp: [
    async ({}, use) => {
      const app = await CalculatorPage.launch(APPIUM_PORT);
      await use(app);
      await app.close();
    },
    { scope: 'worker' },
  ],

  // Nullstilt kalkulator for hver test
  calc: async ({ calculatorApp }, use) => {
    await calculatorApp.clear();
    await use(calculatorApp);
  },
});

export { expect } from '@playwright/test';
