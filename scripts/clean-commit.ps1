# PowerShell script to clean commit message and commit without Co-authored-by trailer
# Usage: .\scripts\clean-commit.ps1 -Message "Your commit message"

param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

# Get current commit info
$commit = git rev-parse HEAD
$tree = git rev-parse "$commit^{tree}"
$parent = git rev-parse "$commit^"
$authorName = git log -1 --format="%an" $commit
$authorEmail = git log -1 --format="%ae" $commit
$authorDate = git log -1 --format="%ad" --date=format:"%s %z" $commit

# Set environment variables for commit
$env:GIT_AUTHOR_NAME = $authorName
$env:GIT_AUTHOR_EMAIL = $authorEmail
$env:GIT_AUTHOR_DATE = $authorDate
$env:GIT_COMMITTER_NAME = $authorName
$env:GIT_COMMITTER_EMAIL = $authorEmail
$env:GIT_COMMITTER_DATE = $authorDate

# Create new commit without trailer
$newCommit = git commit-tree $tree -p $parent -m $Message
git update-ref HEAD $newCommit

Write-Host "✅ Commit created successfully without Co-authored-by trailer"
git log -1 --format=full
