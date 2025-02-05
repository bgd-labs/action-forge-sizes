import { readFile } from "node:fs/promises";
import { debug, getInput, setOutput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { formatDiffMd, snapshotDiff } from "./lib";

const heading = getInput("heading");
const baseReportPath = getInput("base-report-path");
const reportPath = getInput("report-path");
const octokit = getOctokit(getInput("token"));
const shouldComment = getInput("comment") === "true";

const key = `<-- ${encodeURIComponent(heading)} -->`;

const createOrUpdateComment = async (body: string) => {
  const { data: comments } = await octokit.rest.issues.listComments({
    ...context.repo,
    issue_number: context.issue.number,
  });

  const comment = comments.find((comment) => comment.body_text?.includes(key));

  if (comment) {
    await octokit.rest.issues.updateComment({
      ...context.repo,
      comment_id: comment.id,
      body,
    });
  } else {
    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: context.issue.number,
      body,
    });
  }
}

const run = async () => {
  debug("Starting run");
  const baseReportFile = await readFile(baseReportPath, "utf8");
  const reportFile = await readFile(reportPath, "utf8");

  const diff = snapshotDiff({
    before: JSON.parse(baseReportFile),
    after: JSON.parse(reportFile),
  });


  debug(`Results: ${JSON.stringify(diff)}`);
  const report = formatDiffMd(heading, diff);
  if (shouldComment) await createOrUpdateComment(report);
  debug(`Report: ${report} `);

  setOutput("report", report);
}

run()