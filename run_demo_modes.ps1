$base = 'http://localhost:8000'
$session = 'DEMO_GLOBAL_SESSION_01'
$audioPath = 'D:\itantra\test_speech.wav'
$audioUrl = $null
if (Test-Path $audioPath) {
  $audioUrl = 'data:audio/wav;base64,' + [Convert]::ToBase64String([IO.File]::ReadAllBytes($audioPath))
}
$tests = @(
  @{ name = 'Mode 1'; bandwidth_kbps = 20; latency_ms = 50; packet_loss_pct = 0; audio = $audioUrl },
  @{ name = 'Mode 2'; bandwidth_kbps = 6; latency_ms = 120; packet_loss_pct = 2; audio = $audioUrl },
  @{ name = 'Mode 3'; bandwidth_kbps = 1; latency_ms = 200; packet_loss_pct = 5; audio = $null }
)
foreach ($t in $tests) {
  $config = @{ session_id = $session; bandwidth_kbps = $t.bandwidth_kbps; latency_ms = $t.latency_ms; packet_loss_pct = $t.packet_loss_pct } | ConvertTo-Json
  $cfg = Invoke-RestMethod -Method Post -Uri "$base/api/simulator/config" -ContentType 'application/json' -Body $config
  $body = @{ session_id = $session; text = "Hello world - $($t.name) demo test"; is_emergency = $false; language = 'en'; latitude = 12.9642; longitude = 80.2520; audio_url = $t.audio } | ConvertTo-Json -Depth 3
  try {
    $res = Invoke-RestMethod -Method Post -Uri "$base/api/messages/send" -ContentType 'application/json' -Body $body -TimeoutSec 30
    Write-Output ("{0}: status={1} bandwidth={2} audio_sent={3}" -f $t.name,$res.status,$t.bandwidth_kbps,([bool]$t.audio))
  } catch {
    Write-Output ("{0}: ERROR {1}" -f $t.name,$_.Exception.Message)
  }
}
$messages = Invoke-RestMethod -Uri "$base/api/messages/all" -TimeoutSec 30
$messages | Where-Object { $_.text -like 'Hello world - Mode*' } | Select-Object id,text,language,audio_url,original_audio_bytes,created_at | ForEach-Object {
  $audioState = if ($_.audio_url) { "present length=$($_.audio_url.Length)" } else { 'missing' }
  Write-Output ("RECEIVED text={0} audio={1} original_audio_bytes={2}" -f $_.text,$audioState,$_.original_audio_bytes)
}
