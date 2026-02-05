# Setup script to install git hooks that remove Co-authored-by trailer
# Run this script once to set up the hooks in your repository

Write-Host "Setting up git hooks to remove Co-authored-by trailer..." -ForegroundColor Green

$hooksDir = ".git\hooks"
if (-not (Test-Path $hooksDir)) {
    Write-Host "Creating hooks directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
}

# Create the Perl hook (works on Git Bash, Unix, Mac)
$perlHook = @'
#!/usr/bin/env perl
# Git hook to remove Co-authored-by trailer from Cursor
# This hook runs before commit message is finalized

use strict;
use warnings;

my $commit_msg_file = $ARGV[0];
if (-f $commit_msg_file) {
    # Read the commit message file
    local $/;
    open(my $fh, '<', $commit_msg_file) or die "Cannot open $commit_msg_file: $!";
    my $content = <$fh>;
    close($fh);
    
    # Remove Co-authored-by trailer lines (case-insensitive, with or without spaces)
    $content =~ s/^Co-authored-by:\s*Cursor\s*<cursoragent@cursor\.com>\s*\r?\n//gmi;
    $content =~ s/^Co-authored-by:\s*Cursor\s*<cursoragent@cursor\.com>\s*$//gmi;
    
    # Remove any trailing blank lines
    $content =~ s/\r?\n\r?\n+$/\n/;
    
    # Write back the cleaned commit message
    open($fh, '>', $commit_msg_file) or die "Cannot write to $commit_msg_file: $!";
    print $fh $content;
    close($fh);
}
'@

$perlHook | Out-File -FilePath "$hooksDir\prepare-commit-msg" -Encoding utf8 -NoNewline

# Create the Windows batch hook
$batchHook = @'
@echo off
REM Git hook to remove Co-authored-by trailer from Cursor (Windows batch version)
REM This hook runs before commit message is finalized

setlocal enabledelayedexpansion

set "commit_msg_file=%~1"
if not exist "%commit_msg_file%" exit /b 0

REM Use PowerShell to remove the Co-authored-by line
powershell -NoProfile -Command "$content = Get-Content '%commit_msg_file%' -Raw; $content = $content -replace '(?m)^Co-authored-by:\s*Cursor\s*<cursoragent@cursor\.com>\s*$\r?\n', ''; $content = $content -replace '\r?\n\r?\n+$', [Environment]::NewLine; Set-Content '%commit_msg_file%' -Value $content -NoNewline"

exit /b 0
'@

$batchHook | Out-File -FilePath "$hooksDir\prepare-commit-msg.bat" -Encoding utf8

Write-Host "✅ Git hooks installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "The hooks will automatically remove 'Co-authored-by: Cursor <cursoragent@cursor.com>' from all commit messages." -ForegroundColor Cyan
Write-Host ""
Write-Host "To test, try making a commit and check the message with: git log -1 --format=full" -ForegroundColor Yellow
