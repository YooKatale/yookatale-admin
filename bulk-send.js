/**
 * Bulk send subscription emails from emailnew.csv
 * Usage: node bulk-send.js [baseUrl] [--limit N]
 * Example: node bulk-send.js
 *          node bulk-send.js http://localhost:3003
 *          node bulk-send.js https://www.yookatle.app --limit 50
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const startIdx = args.indexOf("--start-from");
const LIMIT = limitIdx >= 0 && args[limitIdx + 1] ? parseInt(args[limitIdx + 1], 10) : null;
const START_FROM = startIdx >= 0 && args[startIdx + 1] ? parseInt(args[startIdx + 1], 10) : 0;
const WITH_NEWSLETTER = args.includes("--with-newsletter");
const BASE_URL = (args[0] && !args[0].startsWith("--") ? args[0] : "http://localhost:3000");
const BULK_PATH = WITH_NEWSLETTER ? "/api/subscription/bulk" : "/api/subscription/bulk-email-only";
const CSV_PATH = path.join(__dirname, "emailnew.csv");
const LOG_PATH = path.join(
  __dirname,
  `bulk-send-log-${Date.now()}.txt`
);
const BATCH_SIZE = 20;
const DELAY_MS = 400;
const BATCH_TIMEOUT_MS = 600000;

function log(msg) {
  const s = `${new Date().toISOString()} ${msg}\n`;
  fs.appendFileSync(LOG_PATH, s);
  process.stdout.write(msg + "\n");
}

function parseEmails() {
  const raw = fs.readFileSync(CSV_PATH, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const header = (lines[0] || "").toLowerCase();
  const col = header.includes("email") ? 0 : 0;
  const rows = lines.slice(1);
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emails = rows
    .map((line) => {
      const cell = (line.split(",")[col] || "").trim().toLowerCase();
      return cell;
    })
    .filter((e) => e && re.test(e) && e.length <= 254);
  const uniq = [...new Set(emails)];
  let out = LIMIT ? uniq.slice(0, LIMIT) : uniq;
  if (START_FROM > 0) out = out.slice(START_FROM);
  return out;
}

async function sendBatch(emails) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), BATCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${BULK_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json();
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

async function run() {
  fs.writeFileSync(LOG_PATH, "");
  const emails = parseEmails();
  const total = emails.length;
  log(`Total emails: ${total}${START_FROM > 0 ? ` (resuming from ${START_FROM})` : ""}`);
  log(`Base URL: ${BASE_URL} | Path: ${BULK_PATH} | Batch size: ${BATCH_SIZE} | Delay: ${DELAY_MS}ms | Timeout: ${BATCH_TIMEOUT_MS / 60000}min`);
  log(`Log: ${LOG_PATH}`);
  log("");

  let ok = 0,
    partial = 0,
    err = 0;
  const totalBatches = Math.ceil(total / BATCH_SIZE);

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const startEmails = START_FROM + i + 1;
    const endEmails = START_FROM + i + batch.length;
    const msg = `Batch ${batchNum}/${totalBatches} (emails ${startEmails}-${endEmails})... `;

    try {
      log(msg.trim());
      const result = await sendBatch(batch);
      ok += result.successCount || 0;
      partial += result.partialCount || 0;
      err += result.errorCount || 0;
      const pc = result.partialCount || 0;
      log(`success=${result.successCount} partial=${pc} error=${result.errorCount}`);
    } catch (e) {
      const fail = `FAILED: ${e.message}`;
      log(fail);
      err += batch.length;
    }

    if (i + BATCH_SIZE < total) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  log(`\nDone. Total: ${total} | success: ${ok} | partial: ${partial} | error: ${err}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
