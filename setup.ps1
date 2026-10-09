$ErrorActionPreference = "Stop"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Installez Node.js LTS : https://nodejs.org/" }
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) { throw "Installez FFmpeg et ajoutez son dossier bin au PATH." }
npm install
if ($LASTEXITCODE -ne 0) { throw "Échec de npm install." }
npx playwright install chromium
if ($LASTEXITCODE -ne 0) { throw "Échec de l'installation Chromium." }
New-Item -ItemType Directory -Force -Path ".\output" | Out-Null
npm run check
if ($LASTEXITCODE -ne 0) { throw "La vérification a échoué." }
Write-Host "Installation terminée." -ForegroundColor Green
Write-Host "Aperçu : npm run preview"
Write-Host "Export final : npm run render"
Write-Host "Qualité supérieure : npm run render:quality"
