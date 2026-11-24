[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "Agenda Clínica - Servidor Spring Boot & Painel"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Clear-Host
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   🌿 CONSULTÓRIO DE PSICOLOGIA CLÍNICA — DRA. THALITA DE PAULA" -ForegroundColor Green
Write-Host "   🚀 SISTEMA INTEGRADO: FRONTEND MODERNO + SPRING BOOT 3 + H2" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verifica se o Java está instalado
try {
    $javaCheck = & java -version 2>&1
    if (-not $javaCheck) {
        throw "Java não encontrado"
    }
} catch {
    Write-Host "[ERRO CRÍTICO] Java não foi localizado no seu sistema (PATH)." -ForegroundColor Red
    Write-Host "Por favor, instale o Java 21 ou superior para executar o backend." -ForegroundColor Yellow
    Read-Host "Pressione ENTER para sair"
    exit 1
}

# 2. Verifica se o JAR compilado existe (se não existir, compila via Maven Wrapper)
$jarPath = Join-Path $projectRoot "backend\target\agenda-backend-2.0.0.jar"
if (-not (Test-Path $jarPath)) {
    Write-Host "[INFO] Pacote JAR não encontrado. Compilando o backend via Maven Wrapper..." -ForegroundColor Yellow
    $backendDir = Join-Path $projectRoot "backend"
    $mvnwCmd = Join-Path $backendDir "mvnw.cmd"

    Push-Location $backendDir
    try {
        if (Test-Path $mvnwCmd) {
            & $mvnwCmd package -DskipTests
        } elseif (Get-Command mvn -ErrorAction SilentlyContinue) {
            & mvn package -DskipTests
        } else {
            $mvnFallback = "C:\tools\apache-maven-3.9.9\bin\mvn.cmd"
            if (Test-Path $mvnFallback) {
                & $mvnFallback package -DskipTests
            } else {
                throw "Maven não foi localizado para compilar o backend."
            }
        }
    } finally {
        Pop-Location
    }

    if (-not (Test-Path $jarPath)) {
        Write-Host "[ERRO] Falha ao compilar o backend. Verifique os logs do Maven." -ForegroundColor Red
        Read-Host "Pressione ENTER para sair"
        exit 1
    }
    Write-Host "[SUCESSO] Backend compilado com sucesso!" -ForegroundColor Green
}

# 3. Libera a porta 8080 se houver algum processo antigo preso
Write-Host "[1/3] Verificando e liberando porta 8080..." -ForegroundColor Yellow
$connections = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Milliseconds 600
}

# 4. Inicia o backend Spring Boot em segundo plano
Write-Host "[2/3] Iniciando o servidor Spring Boot 3 na porta 8080..." -ForegroundColor Yellow
$backendDir = Join-Path $projectRoot "backend"

$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = "java"
$startInfo.Arguments = "-jar `"$jarPath`""
$startInfo.WorkingDirectory = $backendDir
$startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Minimized
$startInfo.UseShellExecute = $true

$backendProcess = [System.Diagnostics.Process]::Start($startInfo)

# 5. Aguarda o health check
Write-Host "[3/3] Aguardando o banco H2 e os endpoints inicializarem..." -ForegroundColor Yellow
$isUp = $false
for ($i = 0; $i -lt 40; $i++) {
    try {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/agendamentos/health" -TimeoutSec 1 -ErrorAction Stop
        if ($res.status -eq "UP") {
            $isUp = $true
            break
        }
    } catch {
        Start-Sleep -Milliseconds 800
    }
}

if (-not $isUp) {
    Write-Host "[AVISO] O servidor demorou para responder, mas tentando abrir mesmo assim..." -ForegroundColor Yellow
} else {
    Write-Host "[SUCESSO] Servidor Spring Boot 100% ATIVO e operacional!" -ForegroundColor Green
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   ✅ SISTEMA ONLINE COM SUCESSO!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   🌐 Site Principal (Paciente)   : http://localhost:8080" -ForegroundColor White
Write-Host "   📋 Painel de Gestão (Psicóloga): http://localhost:8080/painel-agenda.html" -ForegroundColor White
Write-Host "   🗄️ Console do Banco de Dados H2: http://localhost:8080/h2-console" -ForegroundColor White
Write-Host "      - JDBC URL: jdbc:h2:file:./data/psicologo_db" -ForegroundColor Gray
Write-Host "      - Usuário : sa | Senha: (em branco)" -ForegroundColor Gray
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   Abrindo o site no seu navegador padrão..." -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

Start-Process "http://localhost:8080"

while ($true) {
    Write-Host ""
    Write-Host "Escolha uma ação rápida:" -ForegroundColor Cyan
    Write-Host "  [1] Abrir Site Principal (Agendamento de Paciente)"
    Write-Host "  [2] Abrir Painel da Psicóloga (Gestão da Agenda & WhatsApp 48h)"
    Write-Host "  [3] Abrir Console do Banco de Dados H2 (SQL)"
    Write-Host "  [4] Encerrar Servidor e Sair"
    Write-Host ""
    $opcao = Read-Host "Digite a opção desejada [1-4]"

    switch ($opcao) {
        "1" { Start-Process "http://localhost:8080" }
        "2" { Start-Process "http://localhost:8080/painel-agenda.html" }
        "3" { Start-Process "http://localhost:8080/h2-console" }
        "4" {
            Write-Host ""
            Write-Host "Encerrando processos na porta 8080..." -ForegroundColor Yellow
            $conns = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
            if ($conns) {
                foreach ($c in $conns) {
                    Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
                }
            }
            if ($backendProcess -and -not $backendProcess.HasExited) {
                $backendProcess.Kill()
            }
            Write-Host "Servidor finalizado com sucesso. Até logo!" -ForegroundColor Green
            Start-Sleep -Seconds 1
            exit 0
        }
        default { Write-Host "Opção inválida. Digite 1, 2, 3 ou 4." -ForegroundColor Red }
    }
}
