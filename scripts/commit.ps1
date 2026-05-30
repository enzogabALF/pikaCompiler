# Conveniencia: lanza Commitizen dentro de `web/` (PowerShell)
Push-Location -LiteralPath "$PSScriptRoot\..\web"
npm run commit
Pop-Location
