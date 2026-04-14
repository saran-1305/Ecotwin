@echo off
echo Starting EcoImpactAI Backend...
cd /d "%~dp0"
python -m uvicorn app.main:app --reload --port 8000
pause
