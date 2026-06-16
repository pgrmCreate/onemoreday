@echo off
title One More Day - Editeur de cartes
cd /d "%~dp0"

echo.
echo   ONE MORE DAY - Editeur de cartes...
echo.

where node >nul 2>nul
if errorlevel 1 goto :python
start "" http://localhost:8420/editeur.html
node server.js
goto :fin

:python
where python >nul 2>nul
if errorlevel 1 goto :rien
echo   Editeur : http://localhost:8420/editeur.html
echo   Ctrl+C pour arreter.
echo.
start "" http://localhost:8420/editeur.html
python -m http.server 8420 --bind 0.0.0.0
goto :fin

:rien
echo   ERREUR : ni Node.js ni Python n'ont ete trouves sur ce PC.
echo   Installe Node.js (https://nodejs.org) ou Python (https://python.org), puis relance.
pause

:fin
