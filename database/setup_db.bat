@echo off
setlocal enabledelayedexpansion

REM =====================================================
REM Farlandet.dk Database Setup Script (Windows)
REM =====================================================

echo ============================================
echo   Farlandet.dk Database Setup
echo ============================================
echo.

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env fil ikke fundet. Kopierer fra .env.example...
    copy .env.example .env
    echo [WARNING] Husk at opdatere database credentials i .env filen!
    echo.
)

REM Load environment variables from .env (simplified)
if exist .env (
    for /f "usebackq tokens=1,* delims==" %%a in (.env) do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" set %%a=%%b
    )
)

REM Default values
if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_PORT%"=="" set DB_PORT=5432
if "%DB_NAME%"=="" set DB_NAME=farlandet
if "%DB_USER%"=="" set DB_USER=postgres

echo Database Configuration:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo.

REM Prompt for password if not set
if "%DB_PASSWORD%"=="" (
    echo Indtast database password for %DB_USER%:
    set /p DB_PASSWORD=
)
set PGPASSWORD=%DB_PASSWORD%

echo.

REM Test database connection
echo [INFO] Tester database forbindelse...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Kunne ikke forbinde til database
    echo [ERROR] Tjek venligst dine credentials og at PostgreSQL korer
    exit /b 1
)
echo [OK] Database forbindelse OK
echo.

REM Check if database exists
echo [INFO] Tjekker om database '%DB_NAME%' eksisterer...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -lqt | findstr /C:"%DB_NAME%" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Database '%DB_NAME%' findes ikke. Opretter...
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "CREATE DATABASE %DB_NAME%;"
    echo [OK] Database '%DB_NAME%' oprettet
) else (
    echo [OK] Database '%DB_NAME%' findes
)
echo.

REM Ask if user wants to run migrations
set /p RUN_MIGRATIONS="Vil du kore database migrations? (y/n): "
if /i "%RUN_MIGRATIONS%"=="y" (
    echo [INFO] Korer database migrations...
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f database\migrations\001_initial_schema.sql
    if errorlevel 1 (
        echo [ERROR] Migration fejlede
        exit /b 1
    )
    echo [OK] Migrations kort succesfuldt
) else (
    echo [INFO] Springer migrations over
)
echo.

REM Ask if user wants to run seeds
set /p RUN_SEEDS="Vil du kore seed data (kategorier, tags, demo content)? (y/n): "
if /i "%RUN_SEEDS%"=="y" (
    echo [INFO] Korer seed data...
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f database\seeds\001_seed_data.sql
    if errorlevel 1 (
        echo [ERROR] Seed data fejlede
        exit /b 1
    )
    echo [OK] Seed data indsat succesfuldt
) else (
    echo [INFO] Springer seed data over
)
echo.

REM Verify setup
echo [INFO] Verificerer database setup...
echo.

REM Count tables (simplified check)
for /f %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'" 2^>nul') do set TABLES=%%i
if not defined TABLES set TABLES=0
echo   Tabeller oprettet: %TABLES%

REM Count categories
for /f %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -tAc "SELECT COUNT(*) FROM categories" 2^>nul') do set CATEGORIES=%%i
if not defined CATEGORIES set CATEGORIES=0
echo   Kategorier: %CATEGORIES%

REM Count tags
for /f %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -tAc "SELECT COUNT(*) FROM tags" 2^>nul') do set TAGS=%%i
if not defined TAGS set TAGS=0
echo   Tags: %TAGS%

REM Count resources
for /f %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -tAc "SELECT COUNT(*) FROM resources" 2^>nul') do set RESOURCES=%%i
if not defined RESOURCES set RESOURCES=0
echo   Resources: %RESOURCES%

echo.
echo ============================================
echo [OK] Database setup fuldfort!
echo ============================================
echo.
echo Naeste skridt:
echo   1. Opdater .env fil med DATABASE_URL
echo   2. Kor 'npm run dev' for at starte serveren
echo   3. Tilgaa http://localhost:5173
echo.
pause
