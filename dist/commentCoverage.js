"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBody = exports.commentCoverage = void 0;
const github_1 = require("@actions/github");
const commentCoverage = async (eventInfo, body) => {
    const { eventName, payload } = github_1.context;
    const octokit = (0, github_1.getOctokit)(eventInfo.token);
    if (eventName === 'push') {
        await octokit.rest.repos.createCommitComment({
            repo: eventInfo.repo,
            owner: eventInfo.owner,
            commit_sha: eventInfo.commitSha,
            body,
        });
    }
    else if (eventName === 'pull_request') {
        if (eventInfo.overrideComment) {
            const { data: comments } = await octokit.rest.issues.listComments({
                repo: eventInfo.repo,
                owner: eventInfo.owner,
                issue_number: payload.pull_request ? payload.pull_request.number : 0,
            });
            const comment = comments.find((comment) => comment.user?.login === 'github-actions[bot]' &&
                comment.body?.startsWith(eventInfo.commentId));
            if (comment) {
                await octokit.rest.issues.updateComment({
                    repo: eventInfo.repo,
                    owner: eventInfo.owner,
                    comment_id: comment.id,
                    body,
                });
            }
            else {
                await octokit.rest.issues.createComment({
                    repo: eventInfo.repo,
                    owner: eventInfo.owner,
                    issue_number: payload.pull_request?.number || 0,
                    body,
                });
            }
        }
        else {
            await octokit.rest.issues.createComment({
                repo: eventInfo.repo,
                owner: eventInfo.owner,
                issue_number: payload.pull_request?.number || 0,
                body,
            });
        }
    }
};
exports.commentCoverage = commentCoverage;
const buildBody = (eventInfo, reportFiles) => {
    let body = `${eventInfo.commentId}\n`;
    body += `## ${eventInfo.commentTitle} :page_facing_up:\n`;
    body += buildTestsStats(reportFiles);
    return body;
};
exports.buildBody = buildBody;
const buildTestsStats = (reportFiles) => {
    let markdown = '| ------------------ | ----------------- |\n';
    reportFiles.map((reportFile) => {
        const percentage = reportFile?.percentage ?? 0;
        const printablePercentage = percentage > 0 ? Math.round((percentage + Number.EPSILON) * 100) / 100 : 'N/A';
        markdown += `| ${reportFile.path} | ${printablePercentage} |\n`;
        markdown += `| ------------------ | ----------------- |`;
    });
    return `${markdown}\n`;
};
//# sourceMappingURL=commentCoverage.js.map