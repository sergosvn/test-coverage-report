import { spyActions } from './actions.spy';
import * as github from '@actions/github';
import { main } from '../src/main';
import * as Comment from '../src/commentCoverage';
import { EventInfo, ReportFile } from '../src/types';
import { getEventInfo } from '../src/eventInfo';
import * as core from '@actions/core';

const originalContext = { ...github.context };

describe('main tests', () => {
  beforeAll(() => {
    spyActions();
  });

  afterAll(() => {
    github.context.ref = originalContext.ref;
    github.context.sha = originalContext.sha;
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('empty content', async () => {
    const commentCoverageSpy = jest
      .spyOn(Comment, 'commentCoverage')
      .mockImplementation(async (eventInfo: EventInfo, body: string): Promise<void> => {
        return;
      });
    await main();
    const eventInfo: EventInfo = getEventInfo();
    expect(commentCoverageSpy).toHaveBeenCalledWith(
      eventInfo,
      '<!-- tests-coverage-report -->\n## Tests Report Mock :page_facing_up:\n',
    );
  });
  test('build test stats', async () => {
    const reportFiles = [
      {
        path: 'coverage/clover.xml',
        percentage: 49.0105,
      } as ReportFile,
    ];
    const actual = Comment.buildTestsStats(reportFiles);
    const expected =
      '| File | Coverage |\n| :--- | ---: |\n| coverage/clover.xml | 49.01% |\n';

    expect(actual).toBe(expected);
  });
  test('exception', async () => {
    jest
      .spyOn(Comment, 'commentCoverage')
      .mockImplementation(async (eventInfo: EventInfo, body: string): Promise<void> => {
        throw new Error('some error');
      });
    const coreErrorSpy = jest.spyOn(core, 'setFailed');
    await main();
    expect(coreErrorSpy).toHaveBeenCalledWith('some error');
  });
});
