# CROUSTY CHIPS — Cinematic Advertising Project

## Prérequis
- Node.js LTS
- FFmpeg et FFprobe dans le PATH
- Connexion Internet au premier lancement pour les polices et les modules Three.js/GSAP chargés par CDN

## Installation (Windows PowerShell)
```powershell
Set-ExecutionPolicy -Scope Process Bypass
./setup.ps1
```

## Commandes
```bash
npm run check
npm run preview
npm run render
npm run render:quality
```

## Sorties
- `output/crousty-chips-preview.mp4` : aperçu à 10 fps source, export final à 30 fps.
- `output/crousty-chips.mp4` : export H.264, 1080 × 1920, 30 fps.
- `output/video-report.txt` : métadonnées FFprobe, si disponible.

## Important
La composition comprend un packaging graphique stylisé créé en HTML/CSS et des particules Three.js. Ce n'est pas un rendu photoréaliste du produit réel et aucun audio n'est inclus. Pour une publicité fidèle à la marque, remplacez le packaging stylisé par les visuels produits autorisés et ajoutez une piste sonore licenciée si nécessaire.
