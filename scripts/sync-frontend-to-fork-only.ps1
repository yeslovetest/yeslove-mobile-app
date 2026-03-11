param(
    [string]$SourceBranch = "frontend-share-20260311",
    [string]$TargetBranch = "fork-only-replay-20260310",
    [string]$Remote = "iglefork",
    [switch]$Push
)

$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
    Write-Error $Message
    exit 1
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$hasChanges = git status --porcelain
if ($hasChanges) {
    Fail "Working tree is not clean. Commit/stash changes before syncing frontend commits."
}

$sourceRef = "refs/heads/$SourceBranch"
$targetRef = "refs/heads/$TargetBranch"

if (-not (git show-ref --verify --quiet $sourceRef)) {
    Fail "Source branch '$SourceBranch' does not exist locally."
}
if (-not (git show-ref --verify --quiet $targetRef)) {
    Fail "Target branch '$TargetBranch' does not exist locally."
}

$latestFrontendCommit = git log $SourceBranch --max-count=1 --pretty=format:%H -- frontendmobileapp
if (-not $latestFrontendCommit) {
    Fail "No frontendmobileapp commit found on '$SourceBranch'."
}

$latestFrontendMessage = git log --max-count=1 --pretty=format:%s $latestFrontendCommit
$currentBranch = git branch --show-current

Write-Host "Current branch: $currentBranch"
Write-Host "Latest frontend commit on ${SourceBranch}: $latestFrontendCommit"
Write-Host "Message: $latestFrontendMessage"

try {
    git switch $TargetBranch | Out-Null

    $alreadyApplied = $false
    $equivalent = git cherry $TargetBranch $SourceBranch
    if ($equivalent) {
        $lines = $equivalent -split "`n"
        foreach ($line in $lines) {
            if ($line -match "^\+\s+$latestFrontendCommit$") {
                $alreadyApplied = $false
                break
            }
            if ($line -match "^-\s+$latestFrontendCommit$") {
                $alreadyApplied = $true
                break
            }
        }
    }

    if ($alreadyApplied) {
        Write-Host "Frontend commit already present on $TargetBranch (or equivalent patch already applied)."
    } else {
        Write-Host "Cherry-picking $latestFrontendCommit onto $TargetBranch ..."
        git cherry-pick $latestFrontendCommit
        Write-Host "Cherry-pick complete."
    }

    if ($Push) {
        Write-Host "Pushing $TargetBranch to $Remote ..."
        git push $Remote $TargetBranch
        Write-Host "Push complete."
    } else {
        Write-Host "Push skipped. Re-run with -Push to publish."
    }
}
finally {
    git switch $currentBranch | Out-Null
}
