# Bulk send subscription emails from emailnew.csv
# Usage: .\bulk-send.ps1
#        .\bulk-send.ps1 -BaseUrl "https://www.yookatle.app"
# Prefer: node bulk-send.js [baseUrl] [--limit N] [--with-newsletter] (faster, logs to bulk-send-log-*.txt)
param(
  [string]$BaseUrl = "http://localhost:3000",
  [int]$BatchSize = 10,
  [int]$DelaySeconds = 2,
  [switch]$WithNewsletter
)

$path = Join-Path $PSScriptRoot "emailnew.csv"
if (-not (Test-Path $path)) {
  Write-Error "CSV not found: $path"
  exit 1
}

$rows = Import-Csv $path
$first = $rows | Select-Object -First 1
$prop = ($first | Get-Member -MemberType NoteProperty | Select-Object -First 1 -ExpandProperty Name)
$emails = $rows | ForEach-Object { ($_.$prop).ToString().Trim().ToLower() } | Where-Object { $_ -match "@" }
$total = $emails.Count

$apiPath = if ($WithNewsletter) { "/api/subscription/bulk" } else { "/api/subscription/bulk-email-only" }
$uri = "$BaseUrl$apiPath"
Write-Output "Total emails: $total (column: $prop)"
Write-Output "Base URL: $BaseUrl | Path: $apiPath | Batch size: $BatchSize | Delay: ${DelaySeconds}s"
Write-Output ""

$ok = 0
$partial = 0
$err = 0

for ($i = 0; $i -lt $total; $i += $BatchSize) {
  $end = [Math]::Min($i + $BatchSize - 1, $total - 1)
  $batch = $emails[$i..$end]
  $batchNum = [int]($i / $BatchSize) + 1
  $totalBatches = [Math]::Ceiling($total / $BatchSize)
  Write-Output "Batch $batchNum/$totalBatches (emails $($i+1)-$($end+1))..."

  try {
    $payload = @{ emails = @($batch) } | ConvertTo-Json -Depth 2
    $result = Invoke-RestMethod -Method Post -Uri $uri -ContentType "application/json" -Body $payload
    $ok += $result.successCount
    $partial += $result.partialCount
    $err += $result.errorCount
    Write-Output "  success=$($result.successCount) partial=$($result.partialCount) error=$($result.errorCount)"
  } catch {
    Write-Output "  FAILED: $($_.Exception.Message)"
    $err += $batch.Count
  }

  if ($i + $BatchSize -lt $total) {
    Start-Sleep -Seconds $DelaySeconds
  }
}

Write-Output ""
Write-Output "Done. Total: $total | success: $ok | partial: $partial | error: $err"
