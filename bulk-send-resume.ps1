$path = "C:\Users\mujun\Desktop\Yookatle Interview\emailnew.csv"
$rows = Import-Csv $path
$first = $rows | Select-Object -First 1
$prop = ($first | Get-Member -MemberType NoteProperty | Select-Object -First 1 -ExpandProperty Name)
$emails = $rows | ForEach-Object { ($_.$prop).ToString().Trim().ToLower() } | Where-Object { $_ -match "@" }

$batchSize = 10
$startIndex = 425
$total = $emails.Count

Write-Output ("Total emails: " + $total + ", using column: " + $prop)
Write-Output ("Resuming at index " + ($startIndex + 1) + " with batch size " + $batchSize)

for ($i = $startIndex; $i -lt $total; $i += $batchSize) {
  $end = [Math]::Min($i + $batchSize - 1, $total - 1)
  $batch = $emails[$i..$end]
  $batchNumber = [int]([Math]::Floor($i / $batchSize) + 1)
  Write-Output ("Sending batch " + $batchNumber + " (" + ($i + 1) + "-" + ($end + 1) + ")")

  try {
    $payload = @{ emails = $batch } | ConvertTo-Json -Depth 2
    $result = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/subscription/bulk -ContentType "application/json" -Body $payload
    Write-Output ("Batch result: success=" + $result.success + " total=" + $result.total + " ok=" + $result.successCount + " partial=" + $result.partialCount + " error=" + $result.errorCount)
  } catch {
    Write-Output ("Batch failed: " + $_.Exception.Message)
  }

  Start-Sleep -Seconds 5
}
