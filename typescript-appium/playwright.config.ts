import { defineConfig } from '@playwright/test';
import path from 'node:path';

export const APPIUM_PORT = 4723;

export default defineConfig({
  testDir: './tests',
  // Én desktop-app, ett vindu: kjør testene sekvensielt.
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never' }]],

  // Playwright starter Appium-serveren før testene og stopper den etterpå.
  webServer: {
    command: `npx appium --port ${APPIUM_PORT} --log-level warn`,
    url: `http://127.0.0.1:${APPIUM_PORT}/status`,
    reuseExistingServer: true,
    timeout: 60_000,
    env: { APPIUM_HOME: path.resolve(__dirname, '.appium') },
  },
});
