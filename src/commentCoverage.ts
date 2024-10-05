import { context, getOctokit } from '@actions/github';
import { EventInfo, ReportFile } from './types';

export const commentCoverage = async (
  eventInfo: EventInfo,
  body: string,
): Promise<void> => {
  const { eventName, payload } = context;
  const octokit = getOctokit(eventInfo.token);

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
        await octokit.rest.issues.createComment({
          repo: eventInfo.repo,
          owner: eventInfo.owner,
          issue_number: payload.pull_request?.number || 0,
          body,
        });
      }
    } else {
      await octokit.rest.issues.createComment({
        repo: eventInfo.repo,
        owner: eventInfo.owner,
        issue_number: payload.pull_request?.number || 0,
        body,
      });
    }
  }
};

export const buildBody = (eventInfo: EventInfo, reportFiles: ReportFile[]): string => {
  let body = `${eventInfo.commentId}\n`;
  body += `## ${eventInfo.commentTitle} :page_facing_up:\n`;
  body += buildTestsStats(reportFiles);
  return body;
};

export const buildTestsStats = (reportFiles: ReportFile[]): string => {
  return reportFiles.length ? markdownTable(reportFiles) : '';
};

const markdownTable = (reportFiles: ReportFile[]): string => {
  let markdown = markdownTableRow('File', 'Coverage');
  markdown += markdownTableRow(':---', '---:');
  reportFiles.map((reportFile: ReportFile) => {
    const printablePercentage = reportFile?.percentage
      ? `${Math.round((reportFile?.percentage + Number.EPSILON) * 100) / 100}%`
      : 'N/A';
    markdown += markdownTableRow(reportFile.path, printablePercentage);
  });

  return markdown;
};

const markdownTableRow = (...values: (string | number)[]): string => {
  return `| ${values.join(' | ')} |\n`;
};
