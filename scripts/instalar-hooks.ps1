# Configura o Git para utilizar os hooks versionados em .githooks (Windows PowerShell)
# Uso: powershell -File scripts/instalar-hooks.ps1

$ErrorActionPreference = "Stop"
$Raiz = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Raiz

git config core.hooksPath .githooks

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Git hooks configurados com sucesso em '.githooks'!" -ForegroundColor Green
    Write-Host "O pre-commit hook validara automaticamente seu staging a cada commit." -ForegroundColor Cyan
} else {
    Write-Error "Falha ao configurar core.hooksPath no Git."
}
