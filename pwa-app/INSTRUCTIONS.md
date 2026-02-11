# Instructions de génération des icônes PWA

## Création des icônes

Les icônes PWA sont nécessaires pour l'installation de l'application. Voici comment les créer :

### Option 1 : Utiliser un générateur en ligne (Recommandé)

1. **Créer une icône de base (512x512px)**
   - Utilisez un outil de design (Figma, Canva, Photoshop, etc.)
   - Créez une icône carrée de 512x512 pixels
   - Utilisez un fond de couleur unie (bleu #1e40af recommandé)
   - Ajoutez un symbole simple (bâtiment, briefcase, ou logo d'entreprise)

2. **Générer toutes les tailles avec PWA Asset Generator**
   - Visitez : https://www.pwabuilder.com/imageGenerator
   - Ou utilisez : https://realfavicongenerator.net/
   - Uploadez votre icône 512x512
   - Téléchargez le pack complet d'icônes
   - Placez tous les fichiers dans le dossier `images/`

### Option 2 : Utiliser un outil en ligne de commande

Si vous avez Node.js installé :

```bash
# Installer pwa-asset-generator
npm install -g pwa-asset-generator

# Générer les icônes (depuis le dossier pwa-app)
pwa-asset-generator logo.svg images/ --icon-only --background "#1e40af"
```

### Option 3 : Créer manuellement avec un éditeur d'images

Créez les fichiers suivants dans le dossier `images/` :

- `icon-72.png` (72x72px)
- `icon-96.png` (96x96px)
- `icon-128.png` (128x128px)
- `icon-144.png` (144x144px)
- `icon-152.png` (152x152px)
- `icon-192.png` (192x192px)
- `icon-384.png` (384x384px)
- `icon-512.png` (512x512px)

## Design recommandé pour l'icône

### Concept simple
```
┌─────────────────┐
│                 │
│   ┌───┐ ┌───┐   │
│   │   │ │   │   │  ← Représente un bâtiment/entreprise
│   │   │ │   │   │
│   └───┘ └───┘   │
│   ┌─────────┐   │
│   │         │   │
│   └─────────┘   │
│                 │
└─────────────────┘
```

### Couleurs suggérées
- Fond : #1e40af (bleu principal)
- Icône : #ffffff (blanc)
- Alternative : Dégradé de bleu

### Outils de design gratuits
- **Figma** : https://www.figma.com/ (gratuit, en ligne)
- **Canva** : https://www.canva.com/ (gratuit, templates disponibles)
- **GIMP** : https://www.gimp.org/ (gratuit, desktop)
- **Inkscape** : https://inkscape.org/ (gratuit, vectoriel)

## Vérification

Après avoir créé les icônes, vérifiez que :

1. Tous les fichiers sont présents dans `images/`
2. Les noms correspondent exactement à ceux du `manifest.json`
3. Les dimensions sont correctes
4. Le format est PNG
5. Les icônes sont visibles et claires à toutes les tailles

## Test de l'application

Une fois les icônes créées :

1. Lancez un serveur local
2. Ouvrez l'application dans Chrome
3. Ouvrez les DevTools (F12)
4. Allez dans l'onglet "Application" > "Manifest"
5. Vérifiez que toutes les icônes s'affichent correctement

## Note importante

L'application fonctionnera sans les icônes, mais :
- L'installation PWA ne sera pas optimale
- Les icônes par défaut du navigateur seront utilisées
- L'expérience utilisateur sera moins professionnelle

Pour une démonstration rapide, vous pouvez utiliser des icônes placeholder ou simplement des carrés de couleur unie aux bonnes dimensions.