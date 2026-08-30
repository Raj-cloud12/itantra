$deadline = (Get-Date).AddSeconds(30)
$seen = @{}
while ((Get-Date) -lt $deadline) {
  try {
    $items = (Invoke-RestMethod -UseBasicParsing 'http://localhost:8000/api/messages/all' -TimeoutSec 5)
    foreach ($m in $items) {
      $key = "{0}|{1}|{2}" -f $m.id,$m.text,$m.created_at
      if (-not $seen.ContainsKey($key)) {
        $seen[$key] = $true
        $audio = if ($m.audio_url) { "audio_url_present length=$($m.audio_url.Length)" } else { 'audio_url_missing' }
        Write-Output ("MESSAGE id={0} text={1} language={2} audio={3} original_audio_bytes={4}" -f $m.id,$m.text,$m.language,$audio,$m.original_audio_bytes)
      }
    }
  } catch {
    Write-Output ("MONITOR_ERROR {0}" -f $_.Exception.Message)
  }
  Start-Sleep -Seconds 1
}
Write-Output 'MONITOR_DONE'
