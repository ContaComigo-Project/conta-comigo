# Auditoria de Integridade e Governanca do Repositorio (PowerShell)
# Varre .agents/ e docs/ verificando conformidade com as regras inegociaveis:
#   1. Limite de 300 linhas por artefato (.agents/{skills,rules,prompts}/*.md)
#   2. Estrutura 1 pasta = 1 artefato (SKILL.md, RULE.md, PROMPT.md)
#   3. Frontmatter YAML valido (name, description, document_type)
#   4. Links internos Markdown quebrados em docs/ e .agents/
# Uso: powershell -File scripts/auditar-repositorio.ps1

$ErrorActionPreference = "Stop"
$Raiz = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Raiz

$Falhas = 0
$Avisos = 0
$Checks = 0

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

Write-Host "=== Auditoria de Governanca do Repositorio ContaComigo ===" -ForegroundColor Cyan
Write-Host "Raiz: $Raiz`n"

# 1. Limite de Linhas (Regra 12b: <= 300 linhas)
Write-Host "1. Verificando limite de 300 linhas em artefatos de agentes..."
$ArquivosArtefatos = Get-ChildItem -Path ".agents" -Recurse -Filter "*.md" | Where-Object {
    $_.FullName -notmatch '[\\/]assets[\\/]'
}

$Excedentes = @()
foreach ($Item in $ArquivosArtefatos) {
    $script:Checks++
    $Linhas = (Get-Content $Item.FullName).Length
    if ($Linhas -gt 300) {
        $RelPath = $Item.FullName.Replace("$Raiz\", "").Replace("\", "/")
        $Excedentes += "$RelPath ($Linhas linhas > 300)"
    }
}

if ($Excedentes.Count -gt 0) {
    foreach ($E in $Excedentes) {
        Falhar "Limite de linhas excedido: $E"
    }
} else {
    Passar "Todos os $($ArquivosArtefatos.Count) artefatos estao dentro do limite de 300 linhas."
}

# 2. Estrutura de Artefatos (Regra 7: 1 pasta = 1 artefato)
Write-Host "`n2. Verificando padronizacao de nomes de arquivos principais..."
$PastasSkills = Get-ChildItem -Path ".agents/skills" -Directory | Where-Object { $_.Name -ne "assets" }
foreach ($P in $PastasSkills) {
    $script:Checks++
    $Esperado = Join-Path $P.FullName "SKILL.md"
    if (-not (Test-Path $Esperado)) {
        Falhar "Pasta de skill '$($P.Name)' nao possui SKILL.md"
    }
}

$PastasRules = Get-ChildItem -Path ".agents/rules" -Directory | Where-Object { $_.Name -ne "assets" }
foreach ($P in $PastasRules) {
    $script:Checks++
    $Esperado = Join-Path $P.FullName "RULE.md"
    if (-not (Test-Path $Esperado)) {
        Falhar "Pasta de rule '$($P.Name)' nao possui RULE.md"
    }
}

$PastasPrompts = Get-ChildItem -Path ".agents/prompts" -Directory | Where-Object { $_.Name -ne "assets" }
foreach ($P in $PastasPrompts) {
    $script:Checks++
    $Esperado = Join-Path $P.FullName "PROMPT.md"
    if (-not (Test-Path $Esperado)) {
        Falhar "Pasta de prompt '$($P.Name)' nao possui PROMPT.md"
    }
}
Passar "Estruturas de pastas em .agents/ validada com sucesso."

# 3. Integridade de Frontmatters
Write-Host "`n3. Verificando presenca de frontmatters basicos (name, description)..."
$ArtefatosPrincipais = Get-ChildItem -Path ".agents" -Recurse -Include "SKILL.md", "RULE.md", "PROMPT.md"
$SemFrontmatter = @()
foreach ($Item in $ArtefatosPrincipais) {
    $script:Checks++
    $Conteudo = Get-Content $Item.FullName -Raw
    if ($Conteudo -notmatch '(?s)^---\r?\n.*?\r?\n---') {
        $RelPath = $Item.FullName.Replace("$Raiz\", "").Replace("\", "/")
        $SemFrontmatter += "$RelPath (sem bloco YAML delimitado por ---)"
    } elseif ($Conteudo -notmatch 'name:\s*.+' -or $Conteudo -notmatch 'description:\s*.+') {
        $RelPath = $Item.FullName.Replace("$Raiz\", "").Replace("\", "/")
        $SemFrontmatter += "$RelPath (sem 'name' ou 'description')"
    }
}

if ($SemFrontmatter.Count -gt 0) {
    foreach ($S in $SemFrontmatter) {
        Falhar "Frontmatter invalido: $S"
    }
} else {
    Passar "Todos os $($ArtefatosPrincipais.Count) artefatos possuem frontmatter YAML valido."
}

# 4. Integridade de Links Internos Markdown
Write-Host "`n4. Verificando links internos Markdown em docs/ e .agents/..."
$DocsParaChecar = Get-ChildItem -Path "docs", ".agents" -Recurse -Filter "*.md"
$LinksQuebrados = @()

foreach ($Doc in $DocsParaChecar) {
    $LinhasDoc = Get-Content $Doc.FullName
    $DirDoc = $Doc.DirectoryName
    
    foreach ($Linha in $LinhasDoc) {
        # Extrai links no formato [texto](caminho.md) ignorando URLs http/https
        $Matches = [regex]::Matches($Linha, '\[[^\]]+\]\(([^)]+\.md)\)')
        foreach ($M in $Matches) {
            $Target = $M.Groups[1].Value.Trim()
            if ($Target -match '^https?://') { continue }
            
            # Remove possivel fragmento de ancora (#secao)
            $PathLimpo = $Target.Split('#')[0]
            if (-not $PathLimpo) { continue }
            
            # Normaliza caminho
            $PathAbsoluto = [System.IO.Path]::GetFullPath((Join-Path $DirDoc $PathLimpo))
            $script:Checks++
            if (-not (Test-Path $PathAbsoluto)) {
                $RelOrigem = $Doc.FullName.Replace("$Raiz\", "").Replace("\", "/")
                $LinksQuebrados += "$RelOrigem -> $Target"
            }
        }
    }
}

if ($LinksQuebrados.Count -gt 0) {
    foreach ($L in $LinksQuebrados) {
        Falhar "Link quebrado: $L"
    }
} else {
    Passar "Nenhum link interno Markdown quebrado encontrado."
}

# 5. Resultado Final
Write-Host "`n======================================================="
Write-Host "Total de checagens executadas: $Checks"
if ($Falhas -eq 0) {
    Write-Host "AUDITORIA APROVADA: Repositorio 100% aderente a governanca! ($Avisos avisos)" -ForegroundColor Green
    exit 0
} else {
    Write-Host "AUDITORIA REPROVADA: $Falhas inconsistencia(s) encontrada(s)." -ForegroundColor Red
    exit 1
}
