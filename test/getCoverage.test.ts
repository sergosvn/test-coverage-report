import { calculateCoverage } from '../src/getCoverage';

describe('getCoverage tests', () => {
  test('calculateCoverage success', async () => {
    const actual = await calculateCoverage('./test/fixture/test-behat-coverage.xml');
    expect(actual).toBeCloseTo(59.87);
  });
});
