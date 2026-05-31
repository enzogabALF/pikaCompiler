# Conveniencia: lanza Commitizen dentro de `web/` (PowerShell)
Push-Location -LiteralPath "$PSScriptRoot\..\web"
pnpm run commit
Pop-Location
