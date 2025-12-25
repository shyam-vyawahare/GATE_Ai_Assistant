@echo off
REM Commit and push all changes to GitHub
cd /d "%~dp0"

echo ==== Git Auto-Pusher ====
echo.

REM Ensure we are inside a git repository
git status >nul 2>&1
IF ERRORLEVEL 1 (
    echo ERROR: This folder is not a git repository.
    echo Initialize git first with 'git init'.
    pause
    goto :eof
)

echo Checking for changes...
git status --porcelain > nul
IF ERRORLEVEL 1 (
    echo No changes to commit.
    pause
    goto :eof
)

echo.
echo Staging all changes...
git add -A

echo.
set /p COMMIT_MSG="Enter commit message (Press Enter for 'Auto update'): "
IF "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Auto update
)

echo.
echo Committing with message: "%COMMIT_MSG%"
git commit -m "%COMMIT_MSG%"

echo.
echo Pushing to remote...
git push

IF ERRORLEVEL 1 (
    echo.
    echo ERROR: Push failed. Please check your internet connection or git credentials.
    pause
) ELSE (
    echo.
    echo Success! Changes pushed to repository.
    pause
)
