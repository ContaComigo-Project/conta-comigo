# Verifica o fechamento de uma entrega:
#   1. a tag existe;
#   2. a tag aponta para o mesmo commit de fechamento;
#   3. a mensagem do commit e semantica e cita a chave da historia (HN-/HT-);
#   4. existe documento de entrega citando a chave.
# Uso: powershell -File scripts/verificar-fechamento.ps1 vX.Y.Z [commit]

param(
    [Parameter(Position=0)]
    [string]$Tag,
    [Parameter(Position=1)]
    [string]$Commit = "HEAD"
)

$ErrorActionPreference = "Stop"
$Raiz = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Falhas = 0

function Falhar([string]$Msg) {
    Write-Host "  [FALHA] $Msg" -ForegroundColor Red
    $script:Falhas++
}

function Passar([string]$Msg) {
    Write-Host "  [OK]    $Msg" -ForegroundColor Green
}

if (-not $Tag) {
    Write-Error "Uso: powershell -File scripts/verificar-fechamento.ps1 vX.Y.Z [commit]"
    exit 1
}

Set-Location $Raiz
Write-Host "verificando fechamento da tag $Tag"

# 1. formato da versao
if ($Tag -match '^v[0-9]+\.[0-9]+\.[0-9]+$') {
    Passar "versao semantica no formato vMAJOR.MINOR.PATCH"
} else {
    Falhar "tag '$Tag' nao esta no formato vMAJOR.MINOR.PATCH"
}

# 2. tag existe e aponta para o mesmo hash
$TagRef = git rev-parse -q --verify "refs/tags/$Tag" 2>$null
if ($LASTEXITCODE -eq 0 -and $TagRef) {
    Passar "tag $Tag existe"
    $HashTag = (git rev-list -n 1 $Tag).Trim()
    $HashCommit = (git rev-parse $Commit).Trim()
    if ($HashTag -eq $HashCommit) {
        Passar "tag e commit apontam para $HashCommit"
    } else {
        Falhar "tag aponta para $HashTag, commit de fechamento e $HashCommit"
    }
} else {
    Falhar "tag $Tag nao existe"
    $HashCommit = (git rev-parse $Commit).Trim()
}

# 3. commit semantico com a chave da historia
$Assunto = (git log -1 --format="%s" $HashCommit).Trim()
Write-Host "  commit: $Assunto"

if ($Assunto -match '^(feat|fix|refactor|test|docs|chore|perf|build|ci)(\([^)]+\))?!?: .+') {
    Passar "mensagem segue commit semantico"
} else {
    Falhar "mensagem nao segue 'tipo(escopo): descricao'"
}

if ($Assunto -match '((HN|HT)-[0-9]{3})') {
    $Chave = $Matches[1]
    Passar "commit cita a historia $Chave"
} else {
    $Chave = $null
    Falhar "mensagem nao cita chave de historia (HN-XXX ou HT-XXX)"
}

# 4. documento de entrega
if ($Chave) {
    $Entregas = Get-ChildItem -Path "docs/entregas" -Filter "ENTREGA-$Chave-*.md" -ErrorAction SilentlyContinue
    if ($Entregas -and $Entregas.Count -gt 0) {
        Passar "documento de entrega encontrado para $Chave"
    } else {
        Falhar "nenhum docs/entregas/ENTREGA-$Chave-*.md encontrado"
    }
}

# 5. evidencia de execucao em disco
# Historia sem comportamento testavel (documentacao) nao tem evidencia: nesse
# caso avisa, nao reprova. Quando a pasta existe, ela passa a ter dentes.
if ($Chave) {
    $PastaEvidencia = "docs/tasks/$Chave/evidencia"
    $Arquivos = @()
    if (Test-Path $PastaEvidencia) {
        $Arquivos = @(Get-ChildItem -Path $PastaEvidencia -Filter "*.txt" -ErrorAction SilentlyContinue)
    }

    if ($Arquivos.Count -gt 0) {
        Passar "evidencia de execucao presente em $PastaEvidencia"

        $ConteudoEvidencia = $Arquivos | ForEach-Object { Get-Content $_.FullName }
        if ($ConteudoEvidencia -match "EXIT_CODE=0") {
            Passar "existe execucao verde registrada"
        } else {
            Falhar "nenhuma evidencia com EXIT_CODE=0 em $PastaEvidencia"
        }

        # A saida no documento de entrega tem de ser a saida real, copiada.
        $Entrega = Get-ChildItem -Path "docs/entregas" -Filter "ENTREGA-$Chave-*.md" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($Entrega) {
            $Dentro = $false
            $Secao = $false
            $Orfas = 0
            # So os blocos da secao "Evidencia de testes" precisam ser saida real.
            foreach ($Linha in (Get-Content $Entrega.FullName)) {
                if ($Linha -match '^## ') { $Secao = ($Linha -match '^## Evid'); $Dentro = $false; continue }
                if (-not $Secao) { continue }
                if ($Linha -match '^```') { $Dentro = -not $Dentro; continue }
                if (-not $Dentro) { continue }
                if ([string]::IsNullOrWhiteSpace($Linha)) { continue }
                if ($ConteudoEvidencia -notcontains $Linha) { $Orfas++ }
            }

            if ($Orfas -eq 0) {
                Passar "blocos de saida da entrega conferem com a evidencia em disco"
            } else {
                Falhar "$Orfas linha(s) de saida na entrega nao existem na evidencia (reescrita a mao?)"
            }
        }
    } else {
        Write-Host "  [AVISO] sem evidencia de execucao para $Chave (esperado apenas em historia de documentacao)"
    }
}

Write-Host ""
if ($Falhas -eq 0) {
    Write-Host "fechamento verificado: $Tag -> $HashCommit" -ForegroundColor Green
    exit 0
}

Write-Host "fechamento reprovado: $Falhas verificacao(oes) falharam" -ForegroundColor Red
exit 1
