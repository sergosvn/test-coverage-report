import * as core from '@actions/core';
import { context } from '@actions/github';
import { getEventInfo } from '../src/eventInfo'; // Adjust path as per your project structure
import { EventInfo } from '../src/types';

// Mock core and context
jest.mock('@actions/core');
jest.mock('@actions/github', () => ({
  context: {
    repo: {
      owner: 'test-owner',
      repo: 'test-repo',
    },
    eventName: '',
    payload: {},
    ref: 'refs/heads/main',
  },
}));

describe('getEventInfo', () => {
  const mockedGetInput = core.getInput as jest.Mock;

  beforeEach(() => {
    mockedGetInput.mockClear();
    context.eventName = '';
    context.payload = {};
  });

  it('should return event info for pull request event', () => {
    // Arrange
    mockedGetInput.mockImplementation((inputName: string) => {
      switch (inputName) {
        case 'github-token':
          return 'fake-token';
        case 'title':
          return 'Test Title';
        case 'clover-path':
          return './clover.xml';
        default:
          return '';
      }
    });

    context.eventName = 'pull_request';
    context.payload = {
      pull_request: {
        number: 123,
        head: {
          sha: '12345',
          ref: 'feature-branch',
        },
        base: {
          ref: 'main',
        },
      },
    };

    // Act
    const eventInfo: EventInfo = getEventInfo();

    // Assert
    expect(eventInfo).toEqual({
      token: 'fake-token',
      commentTitle: 'Test Title',
      cloverPath: './clover.xml',
      owner: 'test-owner',
      repo: 'test-repo',
      overrideComment: true,
      commentId: '<!-- tests-coverage-report -->',
      commitSha: '12345',
      headRef: 'feature-branch',
      baseRef: 'main',
      pwd: process.env.GITHUB_WORKSPACE || '',
    });
  });

  it('should return event info for push event', () => {
    // Arrange
    mockedGetInput.mockImplementation((inputName: string) => {
      switch (inputName) {
        case 'github-token':
          return 'fake-token';
        case 'title':
          return 'Test Title';
        case 'clover-path':
          return './clover.xml';
        default:
          return '';
      }
    });

    context.eventName = 'push';
    context.payload = {
      after: '67890',
    };
    context.ref = 'refs/heads/main';

    // Act
    const eventInfo: EventInfo = getEventInfo();

    // Assert
    expect(eventInfo).toEqual({
      token: 'fake-token',
      commentTitle: 'Test Title',
      cloverPath: './clover.xml',
      owner: 'test-owner',
      repo: 'test-repo',
      overrideComment: true,
      commentId: '<!-- tests-coverage-report -->',
      commitSha: '67890',
      headRef: 'refs/heads/main',
      baseRef: '',
      pwd: process.env.GITHUB_WORKSPACE || '',
    });
  });

  it('should return event info for a different event without payload', () => {
    // Arrange
    mockedGetInput.mockImplementation((inputName: string) => {
      switch (inputName) {
        case 'github-token':
          return 'fake-token';
        case 'title':
          return 'Test Title';
        case 'clover-path':
          return './clover.xml';
        default:
          return '';
      }
    });

    context.eventName = 'workflow_dispatch';

    // Act
    const eventInfo: EventInfo = getEventInfo();

    // Assert
    expect(eventInfo).toEqual({
      token: 'fake-token',
      commentTitle: 'Test Title',
      cloverPath: './clover.xml',
      owner: 'test-owner',
      repo: 'test-repo',
      overrideComment: true,
      commentId: '<!-- tests-coverage-report -->',
      commitSha: '',
      headRef: '',
      baseRef: '',
      pwd: process.env.GITHUB_WORKSPACE || '',
    });
  });
});
