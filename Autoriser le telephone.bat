@echo off
title One More Day - autoriser le telephone
rem ---------------------------------------------------------------------------
rem  A lancer UNE FOIS si le telephone n'arrive pas a ouvrir le jeu sur le Wi-Fi.
rem  Windows bloque souvent les connexions entrantes vers Node.js (surtout si on a
rem  clique "Annuler" sur la fenetre du pare-feu au premier lancement, ou si le
rem  Wi-Fi est en reseau "Public"). Ce script ouvre UNIQUEMENT le port 8420 du jeu.
rem ---------------------------------------------------------------------------
net session >nul 2>&1
if errorlevel 1 (
  echo   Windows va demander l'autorisation administrateur : clique "Oui".
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)
cd /d "%~dp0"
echo.
echo   1/3  Suppression des anciennes regles qui bloquent Node.js...
netsh advfirewall firewall delete rule name="Node.js JavaScript Runtime" >nul 2>&1
netsh advfirewall firewall delete rule name="node.exe" >nul 2>&1
netsh advfirewall firewall delete rule name="One More Day (port 8420)" >nul 2>&1
netsh advfirewall firewall delete rule name="One More Day (Node.js)" >nul 2>&1

echo   2/3  Ouverture du port 8420 (tous les reseaux)...
netsh advfirewall firewall add rule name="One More Day (port 8420)" dir=in action=allow protocol=TCP localport=8420 profile=any >nul
for /f "delims=" %%i in ('where node 2^>nul') do netsh advfirewall firewall add rule name="One More Day (Node.js)" dir=in action=allow program="%%i" enable=yes profile=any >nul

echo   3/3  Adresses de ce PC sur le reseau :
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do for /f "tokens=*" %%b in ("%%a") do echo        http://%%b:8420
echo.
echo   C'est fait. Maintenant :
echo     - lance "Lancer le jeu.bat" (laisse la fenetre ouverte) ;
echo     - sur le telephone, dans Chrome, tape l'adresse qui commence par 192.168.1.
echo       (en http:// et pas https://), avec ":8420" a la fin.
echo     - Si ca ne marche toujours pas : le telephone doit etre sur le MEME Wi-Fi que le PC
echo       (pas le Wi-Fi "invites", pas la 4G), et la box ne doit pas isoler les appareils.
echo.
pause
