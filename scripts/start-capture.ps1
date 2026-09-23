$ErrorActionPreference = 'Stop'
$captureRoot = Split-Path -Parent $PSScriptRoot
$captureRuntime = Join-Path $captureRoot '.capture-runtime'
New-Item -ItemType Directory -Force -Path $captureRuntime | Out-Null
$captureScript = Join-Path $PSScriptRoot 'capture.cjs'
Start-Process -FilePath (Get-Command node.exe).Source -ArgumentList @(('"' + $captureScript + '"'), '--watch') -WorkingDirectory $captureRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $captureRuntime 'stdout.log') -RedirectStandardError (Join-Path $captureRuntime 'stderr.log')
