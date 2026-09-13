# Watches the "programming projects" folder for changes and auto-syncs them into
# the KoshkaKochkaWebsite Vercel site via git, so every save triggers a redeploy.
#
# Run with: powershell -ExecutionPolicy Bypass -File watch-sync.ps1
# Leave the window open; press Ctrl+C to stop.

$ErrorActionPreference = "Stop"
$siteDir = $PSScriptRoot
$root = Split-Path -Parent $siteDir
$logFile = Join-Path $siteDir "sync-log.txt"

$excludeDirs = @("node_modules", ".git", "venv", ".venv", "__pycache__", "dist", "build", ".next", "target", ".cache", ".gradle", "bin", "obj")

function Write-Log($msg) {
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg"
    Write-Host $line
    Add-Content -Path $logFile -Value $line
}

function Get-Visibility($id, $admin) {
    if ($admin.visibility.PSObject.Properties.Name -contains $id) {
        return $admin.visibility.$id
    }
    return $true
}

$pending = New-Object System.Collections.Generic.HashSet[string]
$lock = New-Object object
$timer = New-Object System.Timers.Timer
$timer.Interval = 8000
$timer.AutoReset = $false

$syncAction = {
    [System.Threading.Monitor]::Enter($lock)
    try {
        $ids = @($pending)
        $pending.Clear()
    } finally {
        [System.Threading.Monitor]::Exit($lock)
    }
    if ($ids.Count -eq 0) { return }

    $admin = Get-Content (Join-Path $siteDir "admin.json") -Raw | ConvertFrom-Json
    $syncedAny = $false

    foreach ($id in $ids) {
        if ($id -eq "KoshkaKochkaWebsite") { continue }

        $visible = Get-Visibility $id $admin
        if (-not $visible) {
            Write-Log "Skipping '$id' (hidden in admin.json)"
            continue
        }

        $srcPath = Join-Path $root $id
        $destPath = Join-Path $siteDir "projects\$id"
        if (-not (Test-Path $srcPath)) { continue }
        if (-not (Test-Path $destPath)) {
            Write-Log "Skipping '$id' (not published under projects\, not auto-adding)"
            continue
        }

        $xdArgs = $excludeDirs | ForEach-Object { Join-Path $srcPath $_ }
        robocopy $srcPath $destPath /MIR /XD $xdArgs /NFL /NDL /NJH /NJS /NC /NS | Out-Null
        Write-Log "Synced '$id' -> projects\$id"
        $syncedAny = $true
    }

    if (-not $syncedAny) { return }

    Push-Location $siteDir
    try {
        & powershell -ExecutionPolicy Bypass -File (Join-Path $siteDir "build-downloads.ps1") *> $null
        git add -A
        $status = git status --porcelain
        if ($status) {
            $names = ($ids -join ", ")
            git commit -m "Auto-sync: update $names" *> $null
            git push *> $null
            Write-Log "Committed and pushed changes for: $names"
        } else {
            Write-Log "No git changes to commit after sync for: $($ids -join ', ')"
        }
    } catch {
        Write-Log "ERROR during git sync: $_"
    } finally {
        Pop-Location
    }
}

Register-ObjectEvent -InputObject $timer -EventName Elapsed -Action $syncAction | Out-Null

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $root
$watcher.IncludeSubdirectories = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite, DirectoryName, Size'

$onChange = {
    $fullPath = $Event.SourceEventArgs.FullPath
    $rel = $fullPath.Substring($root.Length + 1)
    if ($rel -match '^(\.git|node_modules|venv|\.venv|__pycache__|dist|build|\.next|target|\.cache|\.gradle|bin|obj)([\\/]|$)') { return }

    $topFolder = $rel.Split('\')[0]
    if ($topFolder -eq $fullPath) { return } # a file directly at root, not a project folder

    [System.Threading.Monitor]::Enter($lock)
    try {
        [void]$pending.Add($topFolder)
    } finally {
        [System.Threading.Monitor]::Exit($lock)
    }
    $timer.Stop()
    $timer.Start()
}

Register-ObjectEvent -InputObject $watcher -EventName Created -Action $onChange | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $onChange | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Renamed -Action $onChange | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Deleted -Action $onChange | Out-Null

$watcher.EnableRaisingEvents = $true

Write-Log "Watching '$root' for changes. Publishing into KoshkaKochkaWebsite on save (8s debounce)."
Write-Log "Folders marked visible:false in admin.json are skipped."

try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Log "Watcher stopped."
}
