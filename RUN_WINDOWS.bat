@echo off
cd /d "%~dp0"
echo Open http://localhost:8080 and http://localhost:8080/admin.html
py -m http.server 8080
if errorlevel 1 python -m http.server 8080
pause
