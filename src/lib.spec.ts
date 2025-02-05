import { expect, it, describe } from "vitest";
import { formatDiffMd, snapshotDiff } from "./lib";

const before = {
  "ACLManager": {
    "runtime_size": 3493,
    "init_size": 4108,
    "runtime_margin": 21083,
    "init_margin": 45044
  },
  "ATokenInstance": {
    "runtime_size": 10162,
    "init_size": 11059,
    "runtime_margin": 14414,
    "init_margin": 38093
  },
  "BTokenInstance": {
    "runtime_size": 10162,
    "init_size": 11059,
    "runtime_margin": 14414,
    "init_margin": 38093
  },
  "CTokenInstance": {
    "runtime_size": 10162,
    "init_size": 11059,
    "runtime_margin": 14414,
    "init_margin": 38093
  },
}

const after = {
  "ACLManager": {
    "runtime_size": 3493,
    "init_size": 4001,
    "runtime_margin": 21086,
    "init_margin": 45044
  },
  "ATokenInstance": {
    "runtime_size": 10162,
    "init_size": 11059,
    "runtime_margin": 14414,
    "init_margin": 38093
  },
  "CTokenInstance": {
    "runtime_size": 10162,
    "init_size": 11059,
    "runtime_margin": 14414,
    "init_margin": 38093
  },
  "DTokenInstance": {
    "runtime_size": 10162,
    "init_size": 11059,
    "runtime_margin": 14414,
    "init_margin": 38093
  },
}

describe("lib", () => {
  it("should detect differences between two different snapshots", () => {
    expect(
      snapshotDiff({
        before,
        after
      }),
    ).toMatchInlineSnapshot(`
      {
        "added": [
          "| +DTokenInstance | 10,162 | 11,059 | 14,414 | 38,093 |",
        ],
        "changed": [
          "| ~ACLManager | 3,493 | <sup>↓3% (-107)</sup> 4,001 | <sup>↑0% (+3)</sup> 21,086 | 45,044 |",
        ],
        "removed": [
          "| -BTokenInstance | 10,162 | 11,059 | 14,414 | 38,093 |",
        ],
        "unchanged": [
          "| ATokenInstance | 10,162 | 11,059 | 14,414 | 38,093 |",
          "| CTokenInstance | 10,162 | 11,059 | 14,414 | 38,093 |",
        ],
      }
    `);
  });

  it("nicely formats the diff as markdown", () => {
    const diff = snapshotDiff({
      before,
      after
    })

    const result = formatDiffMd("Abcdef", diff)

    expect(result).toMatchInlineSnapshot(`
      "### ♻️ Abcdef
      | Contract | Runtime Size (B) | Initcode Size (B) | Runtime Margin (B) | Initcode Margin (B) |
      | --- | ---: |
      | ~ACLManager | 3,493 | <sup>↓3% (-107)</sup> 4,001 | <sup>↑0% (+3)</sup> 21,086 | 45,044 |
      | -BTokenInstance | 10,162 | 11,059 | 14,414 | 38,093 |
      | +DTokenInstance | 10,162 | 11,059 | 14,414 | 38,093 |
      </details>

      <details><summary>🔕 Unchanged</summary>

      | Path | Value |
      | --- | ---: |
      | ATokenInstance | 10,162 | 11,059 | 14,414 | 38,093 |
      | CTokenInstance | 10,162 | 11,059 | 14,414 | 38,093 |
      </details>"
    `)
  })
});
