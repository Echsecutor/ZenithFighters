# Downloads optional fight-scene assets (floor, background).
# Run from project root: ./scripts/download-assets.ps1

$base = "$PSScriptRoot/../public/assets"
New-Item -ItemType Directory -Force -Path "$base/backgrounds" | Out-Null

$assets = @(
    @{
        Url = "https://opengameart.org/sites/default/files/arcadefloor.png"
        Out = "$base/backgrounds/arcade_floor.png"
    }
)

foreach ($a in $assets) {
    if (-not (Test-Path $a.Out)) {
        Write-Host "Downloading $($a.Url) -> $($a.Out)"
        Invoke-WebRequest -Uri $a.Url -OutFile $a.Out -UseBasicParsing
    } else {
        Write-Host "Already exists: $($a.Out)"
    }
}
