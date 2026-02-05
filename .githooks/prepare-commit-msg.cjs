#!/usr/bin/env node
/**
 * Git hook: strip Co-authored-by trailer (e.g. Cursor) from commit messages.
 * Run: git config core.hooksPath .githooks
 */
const fs = require("fs");
const path = process.argv[2];
if (!path || !fs.existsSync(path)) process.exit(0);
let content = fs.readFileSync(path, "utf8");
content = content.replace(/^Co-authored-by:\s*.*\s*<[^>]+>\s*$/gmi, "");
content = content.replace(/\n{3,}/g, "\n\n").replace(/\n+$/, "\n");
fs.writeFileSync(path, content, "utf8");
