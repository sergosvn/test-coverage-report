import * as core from '@actions/core';
import { EventInfo } from './types';
import { context } from '@actions/github';

export const getEventInfo = (): EventInfo => {
  const eventInfo: EventInfo = {
    token: core.getInput('github-token', { required: true }),
    commentTitle: core.getInput('title', { required: false }),
    owner: context.repo.owner,
    repo: context.repo.repo,
    cloverPath: core.getInput('clover-path', { required: true }),
    overrideComment: true,
    commentId: '<!-- tests-coverage-report -->',
    commitSha: '',
    headRef: '',
    baseRef: '',
    pwd: process.env.GITHUB_WORKSPACE || '',
  };
  if (context.eventName === 'pull_request' && context.payload) {
    eventInfo.commitSha = context.payload.pull_request?.head.sha;
    eventInfo.headRef = context.payload.pull_request?.head.ref;
    eventInfo.baseRef = context.payload.pull_request?.base.ref;
  } else if (context.eventName === 'push') {
    eventInfo.commitSha = context.payload.after;
    eventInfo.headRef = context.ref;
  }
  return eventInfo;
};
