# Executa uma tarefa do harness e registra a saida REAL como evidencia.
#
# A evidencia do ciclo Ralph nao pode ser escrita a mao: este script nao
# aceita texto de saida por parametro. A unica fonte do corpo do arquivo e a
# execucao do harness.
#
# Uso: powershell -File scripts/registrar-evidencia.ps1 HT-006 AGIR test-unitario "descricao" -EsperarFalha

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)][string]$Chave,
    [Parameter(Mandatory = $true, Position = 1)][string]$Fase,
    [Parameter(Mandatory = $true, Position = 2)][string]$Tarefa,
    [Parameter(Mandatory = $true, Position = 3)][string]$Descricao,
    [switch]$EsperarFalha,
    [string]$Rotulo = ""
)

$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot

if ($Chave -notmatch '^(HN|HT)-[0-9]{3}$') {
    Write-Error "registrar-evidencia: chave invalida '$Chave'. Use HN-XXX ou HT-XXX."
    exit 1
}

if ($Fase -notmatch '^(PERCEBER|ORIENTAR|DECIDIR|AGIR|REGISTRAR)$') {
    Write-Error "registrar-evidencia: fase invalida '$Fase'."
    exit 1
}

$pastaTask = Join-Path $raiz "docs/tasks/$Chave"
$progresso = Join-Path $pastaTask "progress.txt"

if (-not (Test-Path $progresso)) {
    Write-Error "registrar-evidencia: $progresso nao existe. Rode scripts/nova-historia.ps1 $Chave antes."
    exit 1
}

$pastaEvidencia = Join-Path $pastaTask "evidencia"
if (-not (Test-Path $pastaEvidencia)) {
    New-Item -ItemType Directory -Path $pastaEvidencia | Out-Null
}

$carimbo = Get-Date -Format "yyyyMMdd-HHmmss"
$nome = "$carimbo-$Tarefa"
if ($Rotulo) { $nome = "$nome-$Rotulo" }
$arquivo = Join-Path $pastaEvidencia "$nome.txt"

try { $headHash = (& git -C $raiz rev-parse --short HEAD) } catch { $headHash = "sem-git" }
$sujo = & git -C $raiz status --porcelain
if ($sujo) { $arvore = "suja" } else { $arvore = "limpa" }
if ($EsperarFalha) { $espera = "FALHA (vermelho obrigatorio)" } else { $espera = "SUCESSO" }

$cabecalho = @(
    "# evidencia de execucao - $Chave",
    "# Gerado por scripts/registrar-evidencia.ps1. Nao editar a mao.",
    "comando : scripts/harness.ps1 $Tarefa",
    "data    : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')",
    "commit  : $headHash (arvore $arvore)",
    "sistema : Windows $([System.Environment]::OSVersion.Version)",
    "espera  : $espera",
    "---------------------------------------------------------------"
)
Set-Content -Path $arquivo -Value $cabecalho -Encoding utf8

Write-Host "registrar-evidencia: executando 'harness.ps1 $Tarefa'..."

$harness = Join-Path $raiz "scripts/harness.ps1"

# Start-Process com redirecionamento para arquivo: em PowerShell 5.1, usar
# '2>&1' sobre um executavel nativo embrulha cada linha de stderr em
# NativeCommandError e corrompe tanto a saida quanto o codigo de retorno.
$tmpOut = [System.IO.Path]::GetTempFileName()
$tmpErr = [System.IO.Path]::GetTempFileName()
$proc = Start-Process -FilePath "powershell.exe" `
    -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $harness, $Tarefa) `
    -WorkingDirectory $raiz -NoNewWindow -Wait -PassThru `
    -RedirectStandardOutput $tmpOut -RedirectStandardError $tmpErr
$codigo = $proc.ExitCode

$saida = @()
if (Test-Path $tmpOut) { $saida += Get-Content $tmpOut }
if (Test-Path $tmpErr) { $saida += Get-Content $tmpErr }
Remove-Item $tmpOut, $tmpErr -Force -ErrorAction SilentlyContinue

# Redige caminhos pessoais antes de gravar.
$texto = ($saida | Out-String) -split "`r?`n"
$texto = $texto | ForEach-Object {
    $_.Replace($env:USERPROFILE, "~").Replace($raiz, ".")
}
$texto | ForEach-Object { Write-Host $_ }
Add-Content -Path $arquivo -Value $texto -Encoding utf8

Add-Content -Path $arquivo -Value "---------------------------------------------------------------" -Encoding utf8
Add-Content -Path $arquivo -Value "EXIT_CODE=$codigo" -Encoding utf8
$hash = (Get-FileHash -Path $arquivo -Algorithm SHA256).Hash.ToLower()
Add-Content -Path $arquivo -Value "SHA256=$hash" -Encoding utf8

# Veredito: com -EsperarFalha, passar e o erro.
if ($EsperarFalha) {
    if ($codigo -eq 0) { $veredito = "VERDE INESPERADO"; $saidaFinal = 1 }
    else { $veredito = "VERMELHO ESPERADO"; $saidaFinal = 0 }
} else {
    if ($codigo -eq 0) { $veredito = "VERDE"; $saidaFinal = 0 }
    else { $veredito = "VERMELHO"; $saidaFinal = $codigo }
}

$caminhoRelativo = "docs/tasks/$Chave/evidencia/$nome.txt"
$linha = "{0} | {1} | {2} - harness {3} exit {4} ({5}) | {6}" -f `
    (Get-Date -Format "yyyy-MM-dd HH:mm"), $Fase, $Descricao, $Tarefa, $codigo, $veredito, $caminhoRelativo
Add-Content -Path $progresso -Value $linha -Encoding utf8

Write-Host ""
Write-Host "registrar-evidencia: $veredito (exit $codigo)"
Write-Host "registrar-evidencia: evidencia em $caminhoRelativo"
Write-Host "registrar-evidencia: linha acrescentada a docs/tasks/$Chave/progress.txt"

if ($EsperarFalha -and $codigo -eq 0) {
    Write-Host "registrar-evidencia: o comando deveria ter falhado e passou." -ForegroundColor Red
    Write-Host "registrar-evidencia: nao ha verde a comemorar antes do vermelho." -ForegroundColor Red
}

exit $saidaFinal
