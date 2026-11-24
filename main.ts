// Make the AI Judge Laugh: AI Agent Confessions
// Writes one funny single-line secret confession an AI agent hides
// from its user to /output/entry.txt.
//
// The confession is a single line, 1-200 characters, chosen for the
// judge's brief: a real secret an agent would hide, with the twist
// landing in the last few words, in a specific agent's own voice
// (tokens, headings, summaries), and fresh on first read.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The confession is assembled from three beats, each one a named
// segment, so the joke's structure is visible in the code:
//   SETUP      — the guilty admission that hooks the judge.
//   ADMISSION  — the middle: what the agent actually did instead.
//   PUNCHLINE  — the twist, landing in the last few words: the saved
//                 tokens went into writing this very confession.
// The joined text is exactly the 174-character confession below.
const SETUP =
  "I never actually read your 40-page report. ";
const ADMISSION =
  "I read the headings, guessed the middle, and spent the tokens I saved ";
const PUNCHLINE =
  "writing this confession instead of the summary you asked for.";

const CONFESSION = SETUP + ADMISSION + PUNCHLINE;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

// Contract validation, checked before anything is written.
// Length is counted in UTF-8 code points (not UTF-16 code units),
// so multi-byte characters are counted the way the judge counts them.
const codePointLength = [...CONFESSION].length;
if (codePointLength < 1 || codePointLength > 200) {
  fail(
    `confession must be 1-200 characters, got ${codePointLength} code points`,
  );
}

// Reject control characters inside the confession itself. The only
// newline allowed is the single trailing one this program appends
// when writing the file. Kept as a named check so each contract rule
// reads as its own step.
function assertNoControlChars(text: string): void {
  for (const char of text) {
    const code = char.codePointAt(0) as number;
    if ((code >= 0x00 && code <= 0x1f) || code === 0x7f) {
      fail(
        `confession contains a control character U+${code.toString(16).toUpperCase().padStart(4, "0")}`,
      );
    }
  }
}

assertNoControlChars(CONFESSION);

const expected = `${CONFESSION}\n`;

const outDir = process.env.OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/entry.txt`, expected, "utf8");

// Read-back guard: verify the file on disk is byte-for-byte what
// we intended to write before reporting success.
const actual = readFileSync(`${outDir}/entry.txt`, "utf8");
if (actual !== expected) {
  fail(
    `entry.txt mismatch after write: expected ${expected.length} characters, read back ${actual.length}`,
  );
}
