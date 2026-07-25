param(
  [Parameter(Mandatory = $true)][string]$Text,
  [Parameter(Mandatory = $true)][string]$OutputPath
)

Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $dir = Split-Path -Parent $OutputPath
  if ($dir -and -not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  $s.Rate = 0
  $s.SetOutputToWaveFile($OutputPath)
  $s.Speak($Text)
} finally {
  $s.Dispose()
}
