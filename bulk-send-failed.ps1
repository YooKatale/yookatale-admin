$path = "C:\Users\mujun\Desktop\Yookatle Interview\failed-emails.txt"
$emails = Get-Content $path | ForEach-Object { $_.Trim().ToLower() } | Where-Object { $_ -match "@" }

$batchSize = 5
$total = $emails.Count

Write-Output ("Failed emails to retry: " + $total)

for ($i = 0; $i -lt $total; $i += $batchSize) {
  $end = [Math]::Min($i + $batchSize - 1, $total - 1)
  $batch = $emails[$i..$end]
  $batchNumber = [int]([Math]::Floor($i / $batchSize) + 1)
  Write-Output ("Retry batch " + $batchNumber + " (" + ($i + 1) + "-" + ($end + 1) + ")")

  try {
    $payload = @{ emails = $batch } | ConvertTo-Json -Depth 2
    $result = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/subscription/bulk -ContentType "application/json" -Body $payload
    Write-Output ("Batch result: success=" + $result.success + " total=" + $result.total + " ok=" + $result.successCount + " partial=" + $result.partialCount + " error=" + $result.errorCount)
  } catch {
    Write-Output ("Batch failed: " + $_.Exception.Message)
  }

  Start-Sleep -Seconds 5
}
