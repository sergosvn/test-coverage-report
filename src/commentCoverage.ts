import { context, getOctokit } from '@actions/github';
import { EventInfo, ReportFile } from './types';
import { markdownTable } from './markdownTable';

export const commentCoverage = async (
  eventInfo: EventInfo,
  body: string,
): Promise<void> => {
  const { eventName, payload } = context;
  const octokit = getOctokit(eventInfo.token);

  const createComment = () => {
    return octokit.rest.issues.createComment({
      repo: eventInfo.repo,
      owner: eventInfo.owner,
      issue_number: payload.pull_request?.number || 0,
      body,
    });
  };

  if (eventName === 'push') {
    await octokit.rest.repos.createCommitComment({
      repo: eventInfo.repo,
      owner: eventInfo.owner,
      commit_sha: eventInfo.commitSha,
      body,
    });
  } else if (eventName === 'pull_request') {
    if (eventInfo.overrideComment) {
      const { data: comments } = await octokit.rest.issues.listComments({
        repo: eventInfo.repo,
        owner: eventInfo.owner,
        issue_number: payload.pull_request ? payload.pull_request.number : 0,
      });

      const comment = comments.find(
        (comment) =>
          comment.user?.login === 'github-actions[bot]' &&
          comment.body?.startsWith(eventInfo.commentId),
      );

      if (comment) {
        await octokit.rest.issues.updateComment({
          repo: eventInfo.repo,
          owner: eventInfo.owner,
          comment_id: comment.id,
          body,
        });
      } else {
        await createComment();
      }
    } else {
      await createComment();
    }
  }
};

export const buildBody = (eventInfo: EventInfo, reportFiles: ReportFile[]): string => {
  let body = `${eventInfo.commentId}\n`;
  body += `## ${eventInfo.commentTitle} :page_facing_up:\n`;
  body += reportFiles.length ? markdownTable(reportFiles) : '';
  return body;
};
