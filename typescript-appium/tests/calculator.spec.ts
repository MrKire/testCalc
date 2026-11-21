import { test, expect } from './fixtures';

const cases: Array<[sequence: string, expected: number]> = [
  ['7+5=', 12],
  ['12-20=', -8],
  ['6*7=', 42],
  ['8/2=', 4],
  ['1,5+2,25=', 3.75],
  ['999*999=', 998001],
];

test.describe('Aritmetikk', () => {
  for (const [sequence, expected] of cases) {
    test(`${sequence} gir ${expected}`, async ({ calc }) => {
      await calc.enter(sequence);
      expect(await calc.result()).toBeCloseTo(expected);
    });
  }
});

test('clear nullstiller displayet', async ({ calc }) => {
  await calc.enter('123');
  await calc.clear();
  expect(await calc.result()).toBe(0);
});

test('deling på null gir feilmelding', async ({ calc }) => {
  await calc.enter('5/0=');
  expect(await calc.displayText()).toMatch(/null|zero/i);
});
