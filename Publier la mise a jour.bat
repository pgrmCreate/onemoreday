@echo off
title One More Day - publier la mise a jour
cd /d "%~dp0"
echo.
echo   Publication de la mise a jour sur GitHub (branche master)...
echo.
git push origin master
if errorlevel 1 (
  echo.
  echo   ECHEC : verifie ta connexion GitHub ^(git push^) puis relance.
) else (
  echo.
  echo   OK ! GitHub Pages redeploie le jeu dans 1 a 2 minutes :
  echo   https://pgrmcreate.github.io/onemoreday/
)
echo.
pause
