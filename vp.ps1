Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

if ($args.Count -eq 0) {
  Write-Host @"
Usage:
  .\vp.ps1 run <script>     e.g. .\vp.ps1 run dev
  .\vp.ps1 i                same as npm install
  .\vp.ps1 install          same as npm install

In PowerShell you must prefix with .\ (current directory is not on PATH).
"@
  exit 1
}

switch -Wildcard ($args[0]) {
  'run' {
    if ($args.Count -lt 2) {
      Write-Error 'Missing script name. Example: .\vp.ps1 run dev'
      exit 1
    }
    $scriptName = $args[1]
    $rest = @()
    if ($args.Count -gt 2) {
      $rest = $args[2..($args.Count - 1)]
    }
    npm run $scriptName @rest
    exit $LASTEXITCODE
  }
  'i' {
    $extra = @()
    if ($args.Count -gt 1) {
      $extra = $args[1..($args.Count - 1)]
    }
    npm install @extra
    exit $LASTEXITCODE
  }
  'install' {
    $extra = @()
    if ($args.Count -gt 1) {
      $extra = $args[1..($args.Count - 1)]
    }
    npm install @extra
    exit $LASTEXITCODE
  }
  default {
    Write-Error "Unknown command: $($args[0]). Use run, i, or install."
    exit 1
  }
}
