# Builds a .zip download for each project listed in projects.json (that isn't hidden in admin.json
# and isn't flagged "skipDownload" for being too large / containing huge model weights).
# Run this from PowerShell whenever project folders change: powershell -ExecutionPolicy Bypass -File build-downloads.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$siteDir = $PSScriptRoot
$downloadsDir = Join-Path $siteDir "downloads"
New-Item -ItemType Directory -Force -Path $downloadsDir | Out-Null

$projects = Get-Content (Join-Path $siteDir "projects.json") -Raw | ConvertFrom-Json
$admin = Get-Content (Join-Path $siteDir "admin.json") -Raw | ConvertFrom-Json

$excludeDirs = @("node_modules", ".git", "venv", ".venv", "__pycache__", "dist", "build", ".next", "target", ".cache", ".gradle", "bin", "obj")
$maxBytes = 150MB
$manifest = @{}

foreach ($p in $projects) {
    $id = $p.id
    $visible = $true
    if ($admin.visibility.PSObject.Properties.Name -contains $id) {
        $visible = $admin.visibility.$id
    }
    if (-not $visible) { continue }
    if ($p.skipDownload) {
        Write-Host "Skipping $id (flagged skipDownload: too large / not meant to be zipped)"
        continue
    }

    $srcPath = Join-Path $root $id
    if (-not (Test-Path $srcPath)) {
        Write-Host "Skipping $id (folder not found)"
        continue
    }

    $stagePath = Join-Path $env:TEMP ("zipstage_" + ($id -replace '[^a-zA-Z0-9]', '_'))
    if (Test-Path $stagePath) { Remove-Item -Recurse -Force $stagePath }
    New-Item -ItemType Directory -Force -Path $stagePath | Out-Null

    $xdArgs = $excludeDirs | ForEach-Object { Join-Path $srcPath $_ }
    robocopy $srcPath $stagePath /E /XD $xdArgs /NFL /NDL /NJH /NJS /NC /NS | Out-Null

    $size = (Get-ChildItem -Recurse -File $stagePath -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if ($size -gt $maxBytes) {
        Write-Host "Skipping $id (${size} bytes exceeds ${maxBytes} byte cap after excluding node_modules/.git/etc - too large for a web download)"
        Remove-Item -Recurse -Force $stagePath
        continue
    }

    $zipPath = Join-Path $downloadsDir ("$id.zip")
    if (Test-Path $zipPath) { Remove-Item -Force $zipPath }
    Compress-Archive -Path (Join-Path $stagePath "*") -DestinationPath $zipPath -CompressionLevel Optimal
    Remove-Item -Recurse -Force $stagePath
    $mb = [math]::Round($size/1MB,1)
    $manifest[$id] = $mb
    Write-Host "Built $id.zip ($mb MB)"
}

$manifest | ConvertTo-Json | Set-Content -Path (Join-Path $siteDir "downloads-manifest.json") -Encoding utf8
Write-Host "Done. Zips are in $downloadsDir"
