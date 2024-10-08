import { commentCoverage, buildBody } from '../src/commentCoverage';
import { context, getOctokit } from '@actions/github';
import { EventInfo, ReportFile } from '../src/types';

// Mock getOctokit
jest.mock('@actions/github', () => ({
  context: {
    eventName: '',
    payload: {},
  },
  getOctokit: jest.fn(),
}));

describe('commentCoverage', () => {
  const mockOctokit = {
    rest: {
      repos: {
        createCommitComment: jest.fn(),
      },
      issues: {
        listComments: jest.fn(),
        updateComment: jest.fn(),
        createComment: jest.fn(),
      },
    },
  };

  const eventInfo: EventInfo = {
    token: 'test-token',
    owner: 'test-owner',
    repo: 'test-repo',
    commitSha: 'abc123',
    commentId: '<!-- test-comment -->',
    commentTitle: 'Test Coverage Report',
    cloverPath: '',
    overrideComment: true,
    headRef: '',
    baseRef: '',
    pwd: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getOctokit as jest.Mock).mockReturnValue(mockOctokit);
  });

  it('should create a commit comment for a push event', async () => {
    // Arrange
    context.eventName = 'push';
    const body = 'Test commit comment';

    // Act
    await commentCoverage(eventInfo, body);

    // Assert
    expect(mockOctokit.rest.repos.createCommitComment).toHaveBeenCalledWith({
      repo: eventInfo.repo,
      owner: eventInfo.owner,
      commit_sha: eventInfo.commitSha,
      body,
    });
  });

  it('should create a new pull request comment if no comment exists', async () => {
    // Arrange
    context.eventName = 'pull_request';
    context.payload = { pull_request: { number: 1 } };
    mockOctokit.rest.issues.listComments.mockResolvedValue({ data: [] });
    const body = 'Test PR comment';

    // Act
    await commentCoverage(eventInfo, body);

    // Assert
    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
      repo: eventInfo.repo,
      owner: eventInfo.owner,
      issue_number: 1,
      body,
    });
  });

  it('should handle missing pull_request in the payload by setting issue_number to 0', async () => {
    // Arrange
    context.eventName = 'pull_request';
    context.payload = {}; // No pull_request in payload
    const body = 'Test PR comment without pull_request';

    // Act
    await commentCoverage(eventInfo, body);

    // Assert
    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
      repo: eventInfo.repo,
      owner: eventInfo.owner,
      issue_number: 0, // Should default to 0
      body,
    });
  });

  it('should update an existing pull request comment if it exists', async () => {
    // Arrange
    context.eventName = 'pull_request';
    context.payload = { pull_request: { number: 1 } };
    const existingComment = {
      id: 12345,
      user: { login: 'github-actions[bot]' },
      body: '<!-- test-comment --> Previous comment',
    };
    mockOctokit.rest.issues.listComments.mockResolvedValue({ data: [existingComment] });
    const body = 'Updated PR comment';

    // Act
    await commentCoverage(eventInfo, body);

    // Assert
    expect(mockOctokit.rest.issues.updateComment).toHaveBeenCalledWith({
      repo: eventInfo.repo,
      owner: eventInfo.owner,
      comment_id: existingComment.id,
      body,
    });
  });

  it('should create a new pull request comment if overrideComment is false', async () => {
    // Arrange
    context.eventName = 'pull_request';
    context.payload = { pull_request: { number: 1 } };
    eventInfo.overrideComment = false;
    const body = 'New PR comment without override';

    // Act
    await commentCoverage(eventInfo, body);

    // Assert
    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
      repo: eventInfo.repo,
      owner: eventInfo.owner,
      issue_number: 1,
      body,
    });
  });
});

describe('buildBody', () => {
  it('should build the correct comment body with report files', () => {
    // Arrange
    const eventInfo: EventInfo = {
      commentId: '<!-- test-comment -->',
      commentTitle: 'Coverage Report',
      token: '',
      cloverPath: '',
      overrideComment: false,
      repo: '',
      owner: '',
      commitSha: '',
      headRef: '',
      baseRef: '',
      pwd: '',
    };
    const reportFiles: ReportFile[] = [
      { path: 'service1-behat-coverage.xml', percentage: 85.5 },
      { path: 'service2-phpunit-coverage.xml', percentage: 90.12 },
    ];

    // Act
    const result = buildBody(eventInfo, reportFiles);

    // Assert
    const expectedBody =
      `<!-- test-comment -->\n` +
      `## Coverage Report :page_facing_up:\n` +
      `| File | Coverage |\n` +
      `| :--- | ---: |\n` +
      `| service1-behat-coverage.xml | 85.5% |\n` +
      `| service2-phpunit-coverage.xml | 90.12% |\n`;

    expect(result).toBe(expectedBody);
  });

  it('should build the correct comment body with no report files', () => {
    // Arrange
    const eventInfo: EventInfo = {
      commentId: '<!-- test-comment -->',
      commentTitle: 'Coverage Report',
      token: '',
      cloverPath: '',
      overrideComment: false,
      repo: '',
      owner: '',
      commitSha: '',
      headRef: '',
      baseRef: '',
      pwd: '',
    };
    const reportFiles: ReportFile[] = [];

    // Act
    const result = buildBody(eventInfo, reportFiles);

    // Assert
    const expectedBody = `<!-- test-comment -->\n## Coverage Report :page_facing_up:\n`;

    expect(result).toBe(expectedBody);
  });
});
