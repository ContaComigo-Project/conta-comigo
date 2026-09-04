# Valida os arquivos atualmente preparados em staging (git diff --cached)
# Verifica:
#   1. Arquivos sensíveis/segredos ou espúrios proibidos
#   2. Limite de 300 linhas em artefatos de agentes (.agents/{skills,rules,prompts}/*.md)
#   3. Resíduos de debug/prints em adições de código
# Uso: powershell -File scripts/validar-staging.ps1

$ErrorActionPreference = "Stop"
$Raiz = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Falhas = 0
$Avisos = 0

function Falhar([string]$Msg) {
    Write-Host "  [FALHA] $Msg" -ForegroundColor Red
    $script:Falhas++
}

function Avisar([string]$Msg) {
    Write-Host "  [AVISO] $Msg" -ForegroundColor Yellow
    $script:Avisos++
}

function Passar([string]$Msg) {
    Write-Host "  [OK]    $Msg" -ForegroundColor Green
}

Set-Location $Raiz
Write-Host "=== Validando arquivos em staging (pre-commit) ==="

# 1. Verificar se ha arquivos em staging
$StagedFiles = git diff --cached --name-only
if (-not $StagedFiles) {
    Write-Host "Nenhum arquivo em staging. Adicione arquivos com 'git add' antes de validar." -ForegroundColor Yellow
    exit 0
}

# 2. Inspecionar arquivos proibidos / segredos
Write-Host "`n1. Verificando presenca de arquivos proibidos ou segredos..."
$PadroesProibidos = @(
    '^\.env(\..+)?$',
    '\.(pem|key|pkcs12|pfx|kdbx)$',
    'id_rsa',
    '(^|[\\/])node_modules[\\/]',
    '(^|[\\/])(dist|\.next|build)[\\/]',
    '\.(log|tmp)$',
    '\.DS_Store$',
    'Thumbs\.db$'
)

$ArquivosProibidosDetectados = @()
foreach ($Arquivo in $StagedFiles) {
    # Permite arquivos de exemplo/template explicitos
    if ($Arquivo -match '\.example$') { continue }
    
    foreach ($Padrao in $PadroesProibidos) {
        if ($Arquivo -match $Padrao) {
            $ArquivosProibidosDetectados += "$Arquivo (padrao: $Padrao)"
            break
        }
    }
}

if ($ArquivosProibidosDetectados.Count -gt 0) {
    foreach ($Item in $ArquivosProibidosDetectados) {
        Falhar "Arquivo indevido no staging: $Item"
    }
} else {
    Passar "Nenhum arquivo de segredo, build ou temporario detectado no staging."
}

# 3. Limite de 300 linhas em artefatos .agents/
Write-Host "`n2. Verificando limite de linhas em artefatos de agentes (<= 300 linhas)..."
$ArtefatosExcedentes = @()
foreach ($Arquivo in $StagedFiles) {
    # Apenas arquivos .md sob .agents/{skills,rules,prompts}
    if ($Arquivo -match '^\.agents[\\/](skills|rules|prompts)[\\/].*\.md$') {
        # Regra 12b: subpasta assets/ e livre de limite de linhas
        if ($Arquivo -match '[\\/]assets[\\/]') { continue }
        
        if (Test-Path $Arquivo) {
            $Linhas = (Get-Content $Arquivo).Length
            if ($Linhas -gt 300) {
                $ArtefatosExcedentes += "$Arquivo ($Linhas linhas > 300)"
            }
        }
    }
}

if ($ArtefatosExcedentes.Count -gt 0) {
    foreach ($Item in $ArtefatosExcedentes) {
        Falhar "Artefato excede 300 linhas: $Item"
    }
} else {
    Passar "Artefatos em .agents/ estao dentro do limite permitido."
}

# 4. Residuos de debug / prints nas linhas adicionadas
Write-Host "`n3. Verificando residuos de debug nas adicoes staged..."
$DiffStaged = git diff --cached -U0 -- ":!scripts/*"
$LinhasAdicionadas = $DiffStaged | Where-Object { $_ -match '^\+[^\+]' }

$ResiduosDetectados = @()
$PadroesResiduos = @(
    'console\.log\(',
    'debugger;',
    'pdb\.set_trace\(',
    'TODO:\s*remove'
)

foreach ($Linha in $LinhasAdicionadas) {
    foreach ($Padrao in $PadroesResiduos) {
        if ($Linha -match $Padrao) {
            $ResiduosDetectados += "$Linha (padrao: $Padrao)"
            break
        }
    }
}

if ($ResiduosDetectados.Count -gt 0) {
    foreach ($Item in $ResiduosDetectados) {
        Avisar "Possivel residuo de debug encontrado: $Item"
    }
} else {
    Passar "Nenhum residuo obvio de debug (console.log, debugger, etc.) detectado."
}

# Resultado
Write-Host ""
if ($Falhas -eq 0) {
    Write-Host "Validacao do staging concluida com SUCESSO! ($Avisos aviso(s))" -ForegroundColor Green
    exit 0
}

Write-Host "Validacao do staging REPROVADA: $Falhas erro(s) critico(s) encontrado(s)." -ForegroundColor Red
exit 1
