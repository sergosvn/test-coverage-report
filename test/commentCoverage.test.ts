import { markdownTableRow } from '../src/commentCoverage';

describe('commentCoverage tests', () => {
  test('markdownTableRow success', async () => {
    const actual = markdownTableRow('test', 10, 0.0005);
    expect(actual).toBe('| test | 10 | 0.0005 |\n');
  });
});
