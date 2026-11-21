// Installerer NovaWindows-driveren i en prosjektlokal APPIUM_HOME (./.appium),
// slik at ingenting installeres globalt på maskinen.
import { execSync } from 'node:child_process';
import path from 'node:path';

const env = { ...process.env, APPIUM_HOME: path.resolve('.appium') };
const installed = execSync('npx appium driver list --installed --json', { env }).toString();
if (installed.includes('novawindows')) {
  console.log('NovaWindows-driver er allerede installert.');
} else {
  execSync('npx appium driver install --source=npm appium-novawindows-driver', { env, stdio: 'inherit' });
}
