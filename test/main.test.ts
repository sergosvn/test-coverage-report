import { main } from '../src/main';
import * as core from '@actions/core';
import { getEventInfo } from '../src/eventInfo';
import { calculatePercentageAll } from '../src/getCoverage';
import { findFiles } from '../src/getFiles';
import { commentCoverage, buildBody } from '../src/commentCoverage';
import { ReportFile, EventInfo } from '../src/types';

// Mock the modules
jest.mock('@actions/core');
jest.mock('../src/eventInfo');
jest.mock('../src/getCoverage');
jest.mock('../src/getFiles');
jest.mock('../src/commentCoverage');

describe('main', () => {
  const mockEventInfo: EventInfo = {
    token: 'mock-token',
    owner: 'mock-owner',
    repo: 'mock-repo',
    commitSha: 'mock-commit-sha',
    commentId: '<!-- test-comment -->',
    commentTitle: 'Coverage Report',
    cloverPath: './coverage',
    overrideComment: true,
    headRef: 'mock-head-ref',
    baseRef: 'mock-base-ref',
    pwd: '/github/workspace',
  };

  const mockReportFiles: ReportFile[] = [
    { path: 'service1-behat-coverage.xml', percentage: 85.5 },
    { path: 'service2-phpunit-coverage.xml', percentage: 90.12 },
  ];

  const mockCommentBody =
    `<!-- test-comment -->\n` +
    `## Coverage Report :page_facing_up:\n` +
    `| File | Coverage |\n` +
    `| :--- | ---: |\n` +
    `| service1-behat-coverage.xml | 85.5% |\n` +
    `| service2-phpunit-coverage.xml | 90.12% |\n`;

  beforeEach(() => {
    jest.clearAllMocks();
    (getEventInfo as jest.Mock).mockReturnValue(mockEventInfo);
    (calculatePercentageAll as jest.Mock).mockResolvedValue(mockReportFiles);
    (buildBody as jest.Mock).mockReturnValue(mockCommentBody);
    (findFiles as jest.Mock).mockReturnValue(mockReportFiles);
  });

  it('should return calculated files and call related functions', async () => {
    // Act
    const result = await main();

    // Assert
    expect(getEventInfo).toHaveBeenCalled();
    expect(findFiles).toHaveBeenCalledWith(mockEventInfo.cloverPath);
    expect(calculatePercentageAll).toHaveBeenCalledWith(mockReportFiles);
    expect(buildBody).toHaveBeenCalledWith(mockEventInfo, mockReportFiles);
    expect(commentCoverage).toHaveBeenCalledWith(mockEventInfo, expect.any(String));
    expect(result).toEqual(mockReportFiles);
  });

  it('should build the correct comment body and pass it to commentCoverage', async () => {
    // Act
    await main();

    // Assert
    expect(buildBody).toHaveBeenCalledWith(mockEventInfo, mockReportFiles);
    expect(commentCoverage).toHaveBeenCalledWith(
      mockEventInfo,
      expect.stringContaining('Coverage Report'),
    );
  });

  it('should call core.setFailed in case of an error', async () => {
    // Arrange
    const mockError = new Error('Something went wrong');
    (calculatePercentageAll as jest.Mock).mockRejectedValue(mockError);

    // Act
    await main();

    // Assert
    expect(core.setFailed).toHaveBeenCalledWith('Something went wrong');
  });

  it('should return an empty array in case of an error', async () => {
    // Arrange
    const mockError = new Error('Failed to calculate coverage');
    (calculatePercentageAll as jest.Mock).mockRejectedValue(mockError);

    // Act
    const result = await main();

    // Assert
    expect(result).toEqual([]);
    expect(core.setFailed).toHaveBeenCalledWith('Failed to calculate coverage');
  });
});
