@echo off
title One More Day - Android
cd /d "%~dp0"

echo.
echo   ONE MORE DAY - deploiement sur Android...
echo.

where node >nul 2>nul
if errorlevel 1 goto :pasnode

rem --- Option cable USB (adb) : telephone branche = installation automatique
where adb >nul 2>nul
if errorlevel 1 goto :wifi
adb get-state >nul 2>nul
if errorlevel 1 goto :wifi

echo   Telephone detecte par cable USB :
echo    - redirection du port du jeu vers le PC (adb reverse)...
adb reverse tcp:8420 tcp:8420 >nul
echo    - ouverture du jeu sur le telephone...
adb shell am start -a android.intent.action.VIEW -d "http://localhost:8420" >nul
echo.
echo   Sur le telephone : menu de Chrome (trois points en haut a droite)
echo   puis "Ajouter a l'ecran d'accueil" : le jeu s'installe avec son
echo   icone et restera jouable HORS-LIGNE, meme cable debranche.
echo.
goto :serveur

:wifi
echo   Pas de telephone USB detecte : installation par Wi-Fi.
echo   Une page d'instructions s'ouvre sur ce PC. Suis les etapes
echo   avec ton telephone (meme reseau Wi-Fi que ce PC).
echo.
start "" http://localhost:8420/android.html

:serveur
node server.js
goto :fin

:pasnode
echo   ERREUR : Node.js est introuvable sur ce PC.
echo   Installe Node.js (https://nodejs.org) puis relance ce fichier.
pause

:fin
