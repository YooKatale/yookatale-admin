#!/bin/sh
# One-time: use repo .githooks so Co-authored-by is stripped from commit messages
git config core.hooksPath .githooks
echo "Hooks path set to .githooks"
