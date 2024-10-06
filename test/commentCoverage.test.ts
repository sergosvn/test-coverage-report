import { context, getOctokit } from '@actions/github';
import { commentCoverage, markdownTableRow } from '../src/commentCoverage';
import { EventInfo } from '../src/types';

jest.mock('@actions/github', () => ({
  context: {
    eventName: '',
    payload: {},
  },
  getOctokit: jest.fn(),
}));

describe('commentCoverage', () => {
  let mockOctokit: any;

  beforeEach(() => {
    // Reset and clear mocks before each test
    jest.clearAllMocks();

    // Mock octokit rest methods
    mockOctokit = {
      rest: {
        repos: {
          createCommitComment: jest.fn(),
        },
        issues: {
          listComments: jest.fn(),
          createComment: jest.fn(),
          updateComment: jest.fn(),
        },
      },
    };

    (getOctokit as jest.Mock).mockReturnValue(mockOctokit);
  });

  it('should create a commit comment for push event', async () => {
    // Mock the GitHub context for push event
    context.eventName = 'push';
    context.payload = {};

    const eventInfo: EventInfo = {
      token: 'fake-token',
      commentTitle: 'Coverage Report',
      owner: 'test-owner',
      repo: 'test-repo',
      cloverPath: './coverage/clover.xml',
      overrideComment: false,
      commentId: '',
      commitSha: '1234567890abcdef',
      headRef: '',
      baseRef: '',
      pwd: '',
    };

    const body = 'Test coverage comment for push event';

    // Call the function
    await commentCoverage(eventInfo, body);

    // Expect the correct GitHub API call to be made
    expect(mockOctokit.rest.repos.createCommitComment).toHaveBeenCalledWith({
      repo: eventInfo.repo,
      owner: eventInfo.owner,
      commit_sha: eventInfo.commitSha,
      body,
    });
  });

  it('should create a pull request comment when overrideComment is false', async () => {
    // Mock the GitHub context for pull_request event
    context.eventName = 'pull_request';
    context.payload = {
      pull_request: { number: 123 },
    };

    const eventInfo: EventInfo = {
      token: 'fake-token',
      commentTitle: 'Coverage Report',
      owner: 'test-owner',
      repo: 'test-repo',
      cloverPath: './coverage/clover.xml',
      overrideComment: false,
      commentId: '',
      commitSha: '',
      headRef: '',
      baseRef: '',
      pwd: '',
    };

    const body = 'Test pull request coverage comment';

    // Call the function
    await commentCoverage(eventInfo, body);

    // Expect a new comment to be created
    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
      repo: eventInfo.repo,
      owner: eventInfo.owner,
      issue_number: 123,
      body,
    });
  });

  it('should update an existing comment when overrideComment is true and comment exists', async () => {
    // Mock the GitHub context for pull_request event
    context.eventName = 'pull_request';
    context.payload = {
      pull_request: { number: 123 },
    };

    const eventInfo: EventInfo = {
      token: 'fake-token',
      commentTitle: 'Coverage Report',
      owner: 'test-owner',
      repo: 'test-repo',
      cloverPath: './coverage/clover.xml',
      overrideComment: true,
      commentId: 'coverage-comment-id',
      commitSha: '',
      headRef: '',
      baseRef: '',
      pwd: '',
    };

    const body = 'Updated pull request coverage comment';

    // Mock listComments to return an existing comment
    const existingComment = {
      id: 456,
      body: 'coverage-comment-id existing comment',
      user: { login: 'github-actions[bot]' },
    };

    mockOctokit.rest.issues.listComments.mockResolvedValue({
      data: [existingComment],
    });

    // Call the function
    await commentCoverage(eventInfo, body);

    // Expect the existing comment to be updated
    expect(mockOctokit.rest.issues.updateComment).toHaveBeenCalledWith({
      repo: eventInfo.repo,
      owner: eventInfo.owner,
      comment_id: existingComment.id,
      body,
    });
  });

  it('should create a new comment when overrideComment is true and no existing comment is found', async () => {
    // Mock the GitHub context for pull_request event
    context.eventName = 'pull_request';
    context.payload = {
      pull_request: { number: 123 },
    };

    const eventInfo: EventInfo = {
      token: 'fake-token',
      commentTitle: 'Coverage Report',
      owner: 'test-owner',
      repo: 'test-repo',
      cloverPath: './coverage/clover.xml',
      overrideComment: true,
      commentId: 'coverage-comment-id',
      commitSha: '',
      headRef: '',
      baseRef: '',
      pwd: '',
    };

    const body = 'New pull request coverage comment';

    // Mock listComments to return no matching comments
    mockOctokit.rest.issues.listComments.mockResolvedValue({
      data: [],
    });

    // Call the function
    await commentCoverage(eventInfo, body);

    // Expect a new comment to be created
    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
      repo: eventInfo.repo,
      owner: eventInfo.owner,
      issue_number: 123,
      body,
    });
  });
});
