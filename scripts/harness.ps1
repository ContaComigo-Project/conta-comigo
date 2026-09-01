# Harness local (Windows) - equivalente a scripts/harness.sh.
# Os comandos reais vivem em scripts/harness.env (ver harness.env.example).
[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [string]$Tarefa = "help"
)

$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot
$arquivoEnv = Join-Path $PSScriptRoot "harness.env"

function Show-Uso {
  @"
Uso: powershell -File scripts/harness.ps1 <tarefa>

Tarefas:
  setup           prepara o ambiente em maquina limpa
  down            derruba e limpa o ambiente local
  build           compila / empacota
  lint            analise estatica e formatacao
  test-funcional  testes funcionais / BDD
  test-unitario   testes unitarios
  test            suite completa
  coverage        relatorio de cobertura
  security        verificacao de seguranca
  run             executa a aplicacao localmente
  gates           lint + test + coverage + security, parando no primeiro erro

Configuracao: copie scripts/harness.env.example para scripts/harness.env
e preencha os comandos do projeto (historia HT-005).
"@
}

function Get-Comandos {
  if (-not (Test-Path $arquivoEnv)) {
    Write-Error "harness: scripts/harness.env nao existe. Copie harness.env.example e preencha os comandos."
  }
  $mapa = @{}
  foreach ($linha in Get-Content $arquivoEnv -Encoding utf8) {
    $texto = $linha.Trim()
    if ($texto -eq "" -or $texto.StartsWith("#")) { continue }
    $partes = $texto.Split("=", 2)
    if ($partes.Count -ne 2) { continue }
    $mapa[$partes[0].Trim()] = $partes[1].Trim().Trim('"').Trim("'")
  }
  return $mapa
}

function Invoke-Tarefa {
  param([hashtable]$Comandos, [string]$Chave)

  $comando = $Comandos[$Chave]
  if ([string]::IsNullOrWhiteSpace($comando)) {
    Write-Error "harness: comando nao configurado ($Chave). Defina-o em scripts/harness.env."
  }

  Write-Host "harness: $Chave -> $comando"
  Push-Location $raiz
  try {
    & cmd.exe /c $comando
    if ($LASTEXITCODE -ne 0) { Write-Error "harness: $Chave falhou com codigo $LASTEXITCODE" }
  } finally {
    Pop-Location
  }
}

$chaves = @{
  "setup"          = "HARNESS_SETUP"
  "down"           = "HARNESS_DOWN"
  "build"          = "HARNESS_BUILD"
  "lint"           = "HARNESS_LINT"
  "test-funcional" = "HARNESS_TEST_FUNCTIONAL"
  "test-unitario"  = "HARNESS_TEST_UNIT"
  "test"           = "HARNESS_TEST"
  "coverage"       = "HARNESS_COVERAGE"
  "security"       = "HARNESS_SECURITY"
  "run"            = "HARNESS_RUN"
}

if ($Tarefa -in @("help", "-h", "--help", "")) { Show-Uso; return }

$comandos = Get-Comandos

if ($Tarefa -eq "gates") {
  Write-Host "harness: executando gates na ordem - falha no primeiro erro"
  foreach ($chave in @("HARNESS_LINT", "HARNESS_TEST", "HARNESS_COVERAGE", "HARNESS_SECURITY")) {
    Invoke-Tarefa -Comandos $comandos -Chave $chave
  }
  Write-Host "harness: gates concluidos"
  return
}

if (-not $chaves.ContainsKey($Tarefa)) {
  Write-Error "harness: tarefa desconhecida '$Tarefa'. Use 'help' para ver as validas."
}

Invoke-Tarefa -Comandos $comandos -Chave $chaves[$Tarefa]
