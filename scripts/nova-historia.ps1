# Cria a pasta de execucao de uma historia a partir do template (Windows).
# Uso: powershell -File scripts/nova-historia.ps1 HT-005
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Chave
)

$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot

if ($Chave -notmatch '^(HN|HT)-\d{3}$') {
  Write-Error "chave invalida: '$Chave'. Use HN-XXX (negocio) ou HT-XXX (tecnica)."
}

$template = Join-Path $raiz "docs\tasks\_TEMPLATE"
$destino = Join-Path $raiz "docs\tasks\$Chave"

if (Test-Path $destino) {
  Write-Error "ja existe: docs/tasks/$Chave - nada foi alterado."
}

Copy-Item -Recurse $template $destino

$chaveMinuscula = $Chave.ToLower()

foreach ($arquivo in Get-ChildItem $destino -File) {
  $conteudo = Get-Content $arquivo.FullName -Raw -Encoding utf8
  $conteudo = $conteudo.Replace("[CHAVE]", $Chave)
  $conteudo = [regex]::Replace($conteudo, '(?m)^name: (.*)-template$', "name: `$1-$chaveMinuscula")
  Set-Content $arquivo.FullName $conteudo -Encoding utf8 -NoNewline
}

Write-Host "criado docs/tasks/$Chave/ com TASK.md, IMPLEMENTATION.md e progress.txt"
Write-Host ""
Write-Host "proximos passos:"
Write-Host "  1. preencher TASK.md e IMPLEMENTATION.md antes de escrever codigo"
Write-Host "  2. mover $Chave para 'Em execucao' no docs/jira-pessoal/KANBAN-OFICIAL.md"
Write-Host "  3. seguir .agents/prompts/ralph-loop.md"
