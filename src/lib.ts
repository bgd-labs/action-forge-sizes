import { compareObjects } from "./compareObjects";
import md, { formatNumber } from "./md";

type FileReport = {
  runtime_size: number;
  init_size: number;
  runtime_margin: number;
  init_margin: number;
};
type Verdict = Record<keyof FileReport | "key", string | number>;
type Snapshot = Record<string, FileReport>;

export function snapshotDiff({
  before,
  after,
}: {
  before: Snapshot;
  after: Snapshot;
}) {
  const removed: string[] = [];
  const added: string[] = [];
  const changed: string[] = [];
  const unchanged: string[] = [];

  const verdictToArray = (verdict: Verdict) => [
    verdict.key,
    verdict.runtime_size,
    verdict.init_size,
    verdict.runtime_margin,
    verdict.init_margin,
  ];

  compareObjects(before, after, {
    onAdded: (key, _before, after) => {
      added.push(md.formatLine(verdictToArray({ key: `+${key}`, ...after })));
    },
    onChanged: (key, before, after) => {
      const verdict = Object.keys(after ?? {}).reduce<Verdict>(
        (acc, k) => {
          const before_value = before[k as keyof FileReport];
          const after_value = after[k as keyof FileReport];
          if (before_value !== after_value) {
            const diff = Math.abs(before_value - after_value);
            const diffPercentage = Math.round((diff / before_value) * 100);
            const diffSym =
              Number(before_value) < Number(after_value) ? "↑" : "↓";
            const diffSign =
              Number(before_value) < Number(after_value) ? "+" : "-";
            acc[
              k as keyof FileReport
            ] = `<sup>${diffSym}${diffPercentage}% (${diffSign}${diff})</sup> ${formatNumber(
              after_value
            )}`;
          }

          return acc;
        },
        {
          ...after,
          key: `~${key}`,
        }
      );
      changed.push(md.formatLine(verdictToArray(verdict)));
    },
    onRemoved: (key, before, _after) => {
      removed.push(
        md.formatLine(verdictToArray({ key: `-${key}`, ...before }))
      );
    },
    onUnchanged: (key, before, after) => {
      unchanged.push(md.formatLine(verdictToArray({ key, ...before })));
    },
  });

  return {
    removed,
    added,
    changed,
    unchanged,
  };
}

export const formatDiffMd = (
  heading: string,
  diff: ReturnType<typeof snapshotDiff>
) => {
  const th = "| Path | Value |";
  const hr = "| --- | ---: |";
  const br = "";

  const changedLinesHeader: string[] = [
    `### ♻️ ${heading}`,
    md.th([
      "Contract",
      "Runtime Size (B)",
      "Initcode Size (B)",
      "Runtime Margin (B)",
      "Initcode Margin (B)",
    ]),
    hr,
  ];
  let changedLines: string[] = [];
  const unchangedLinesHeader: string[] = [
    br,
    "<details><summary>🔕 Unchanged</summary>",
    br,
    th,
    hr,
  ];
  let unchangedLines: string[] = [];

  const changed = diff.changed;
  const added = diff.added;
  const removed = diff.removed;
  const unchanged = diff.unchanged;

  const sumChanged =
    Object.keys(changed).length +
    Object.keys(added).length +
    Object.keys(removed).length;
  if (sumChanged > 0) {
    changedLines.push(...changed);
    changedLines.push(...removed);
    changedLines.push(...added);
  }

  if (Object.keys(unchanged).length > 0) {
    unchangedLines.push(...unchanged);
  }

  if (changedLines.length > 0) {
    changedLines = [...changedLinesHeader, ...changedLines, "</details>"];
  }
  if (unchangedLines.length > 0) {
    unchangedLines = [...unchangedLinesHeader, ...unchangedLines, "</details>"];
  }

  return changedLines.concat(unchangedLines).join("\n");
};
