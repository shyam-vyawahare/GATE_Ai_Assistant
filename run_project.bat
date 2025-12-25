@echo off
REM Activate virtual environment and run the FastAPI app
cd /d "%~dp0"

echo.
echo ==== GATE/NET Exam Assistant Runner ====
echo.

REM Check if Python launcher exists
py --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo ERROR: Python Launcher 'py' is not installed or not in PATH.
    echo.
    echo Please install Python from https://www.python.org/downloads/windows/
    echo - During installation, CHECK the box "Add python.exe to PATH".
    echo - Then close this window and run run_project.bat again.
    echo.
    pause
    goto :eof
)

IF NOT EXIST ".venv" (
    echo Creating virtual environment...
    py -m venv .venv
)

IF NOT EXIST ".venv\Scripts\python.exe" (
    echo ERROR: Virtual environment was not created correctly.
    echo Make sure Python is installed correctly.
    echo You can try deleting the ".venv" folder and running this script again.
    pause
    goto :eof
)

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Installing required packages...
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\python.exe -m pip install -r requirements.txt

echo Starting GATE/NET Exam Assistant (FastAPI app) on http://127.0.0.1:8000 ...
.venv\Scripts\python.exe main.py

pause
