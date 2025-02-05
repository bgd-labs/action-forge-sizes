import { readFile } from "node:fs/promises";
import { debug, getInput, setOutput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { formatDiffMd, snapshotDiff } from "./lib";
import { z } from "zod";

const heading = getInput("heading");
const baseReportPath = getInput("base-report-path");
const reportPath = getInput("report-path");
const octokit = getOctokit(getInput("token"));
const shouldComment = getInput("comment") === "true";

const key = `<!-- ${encodeURIComponent(heading)} -->`;

const createOrUpdateComment = async (body: string) => {
  body = `${body}\n\n${key}`;
  const { data: comments } = await octokit.rest.issues.listComments({
    ...context.repo,
    issue_number: context.issue.number,
  });
  const comment = comments.find((comment) => comment.body?.includes(key));

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
};

const reportValidator = z.preprocess(v => JSON.parse(v as string), z.record(
  z.string(),
  z.object({
    runtime_size: z.preprocess((v) => Number(v), z.number().int().positive()),
    init_size: z.preprocess((v) => Number(v), z.number().int().positive()),
    runtime_margin: z.preprocess((v) => Number(v), z.number().int()),
    init_margin: z.preprocess((v) => Number(v), z.number().int()),
  })
));

export type Report = z.infer<typeof reportValidator>;

const run = async () => {
  debug("Starting run");
  const baseReportFile = await readFile(baseReportPath, "utf8");
  const reportFile = await readFile(reportPath, "utf8");
  const before = reportValidator.parse(baseReportFile);
  const after = reportValidator.parse(reportFile);
  const negativeContracts = Object.entries(after).filter(([contact, content]) => Object.values(content).some(value => value < 0)).map(([contract]) => contract);

  const diff = snapshotDiff({
    before,
    after,
  });

  debug(`Results: ${JSON.stringify(diff)}`);
  const output = formatDiffMd(heading, diff);

  if (shouldComment) await createOrUpdateComment(output);

  debug(`Report: ${output} `);

  setOutput("report", output);

  if (negativeContracts[0]) {
    setFailed(`Allowed build-size exceeded for contract(s) ${negativeContracts.map(contract => `"${contract}"`).join(", ")}.`);
  }
};

run();
