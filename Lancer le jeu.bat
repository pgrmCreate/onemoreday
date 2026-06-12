@echo off
title One More Day
cd /d "%~dp0"

echo.
echo   ONE MORE DAY - lancement du jeu...
echo.

where node >nul 2>nul
if errorlevel 1 goto :python
start "" http://localhost:8420
node server.js
goto :fin

:python
where python >nul 2>nul
if errorlevel 1 goto :rien
echo   Sur ce PC   : http://localhost:8420
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do echo   Sur Android :http://%%a:8420  (meme Wi-Fi, sans espace)
echo.
echo   Android : ouvre l'adresse dans Chrome puis "Ajouter a l'ecran d'accueil".
echo   Ctrl+C pour arreter.
echo.
start "" http://localhost:8420
python -m http.server 8420 --bind 0.0.0.0
goto :fin

:rien
echo   ERREUR : ni Node.js ni Python n'ont ete trouves sur ce PC.
echo   Installe Node.js (https://nodejs.org) ou Python (https://python.org), puis relance.
pause

:fin
