# 🚀 Guide de Démarrage Rapide

## Lancement de l'application

### Méthode 1 : Python (Recommandé - Simple)

Si vous avez Python installé :

```bash
# Ouvrir un terminal dans le dossier pwa-app
cd pwa-app

# Lancer le serveur
python -m http.server 8000

# Ou avec Python 2
python -m SimpleHTTPServer 8000
```

Puis ouvrir dans le navigateur : **http://localhost:8000**

### Méthode 2 : Node.js

Si vous avez Node.js installé :

```bash
# Installer http-server globalement (une seule fois)
npm install -g http-server

# Lancer le serveur
cd pwa-app
http-server -p 8000
```

Puis ouvrir dans le navigateur : **http://localhost:8000**

### Méthode 3 : PHP

Si vous avez PHP installé :

```bash
cd pwa-app
php -S localhost:8000
```

Puis ouvrir dans le navigateur : **http://localhost:8000**

### Méthode 4 : Visual Studio Code (Live Server)

1. Installer l'extension "Live Server" dans VS Code
2. Ouvrir le dossier `pwa-app` dans VS Code
3. Clic droit sur `index.html` → "Open with Live Server"
4. L'application s'ouvre automatiquement dans le navigateur

### Méthode 5 : Ouvrir directement (Limité)

⚠️ **Note** : Cette méthode peut avoir des limitations avec le Service Worker

1. Double-cliquer sur `index.html`
2. L'application s'ouvre dans le navigateur par défaut

## Premier test de l'application

### 1. Écran des Départements

Au lancement, vous devriez voir :
- ✅ Une liste de 8 départements
- ✅ Une barre de recherche fonctionnelle
- ✅ Des colonnes triables (cliquer sur les en-têtes)
- ✅ Un menu déroulant "Action" sur chaque ligne

**Test** :
1. Rechercher "IT" dans la barre de recherche
2. Cliquer sur l'en-tête "Nom du département" pour trier
3. Sélectionner "5 - Voir" dans le menu d'un département

### 2. Écran des Employés

Après avoir sélectionné "5 - Voir" :
- ✅ Liste des employés du département
- ✅ Total des salaires affiché en haut
- ✅ Bouton "Nouvel employé"
- ✅ Bouton "Retour" pour revenir aux départements

**Test** :
1. Vérifier que le total des salaires s'affiche
2. Rechercher un employé par nom
3. Cliquer sur "Nouvel employé"

### 3. Formulaire Nouvel Employé

Après avoir cliqué sur "Nouvel employé" :
- ✅ ID généré automatiquement
- ✅ Département pré-rempli
- ✅ Tous les champs de saisie présents

**Test** :
1. Remplir le formulaire :
   - Prénom : Jean
   - Initiale : M
   - Nom : Dupont
   - Poste : Manager
   - Salaire : 50000
   - Téléphone : 1234
2. Cliquer sur "Créer l'employé"
3. Vérifier que l'employé apparaît dans la liste

### 4. Thème Sombre

**Test** :
1. Cliquer sur l'icône soleil/lune en haut à droite
2. Le thème devrait basculer entre clair et sombre
3. Recharger la page : le thème devrait être conservé

## Vérification des fonctionnalités

### ✅ Checklist complète

- [ ] L'application se charge sans erreur
- [ ] Les 8 départements s'affichent
- [ ] La recherche fonctionne
- [ ] Le tri des colonnes fonctionne
- [ ] Navigation vers les employés (option 5)
- [ ] Navigation vers nouvel employé (option 8)
- [ ] Le total des salaires s'affiche correctement
- [ ] Le formulaire de création fonctionne
- [ ] Les validations du formulaire fonctionnent
- [ ] Les notifications toast s'affichent
- [ ] Le bouton retour fonctionne
- [ ] Le thème clair/sombre fonctionne
- [ ] Les données persistent après rechargement
- [ ] L'application est responsive (tester sur mobile)

## Résolution des problèmes courants

### Problème : Page blanche

**Solution** :
1. Ouvrir la console développeur (F12)
2. Vérifier les erreurs JavaScript
3. S'assurer que tous les fichiers sont présents
4. Vérifier que le serveur est bien lancé

### Problème : Aucune donnée ne s'affiche

**Solution** :
1. Ouvrir la console développeur (F12)
2. Taper : `DataAPI.resetData()` puis `location.reload()`
3. Les données devraient se régénérer

### Problème : Le Service Worker ne fonctionne pas

**Solution** :
1. Le Service Worker nécessite HTTPS ou localhost
2. Utiliser un serveur local (pas file://)
3. Vérifier dans DevTools > Application > Service Workers

### Problème : Les styles ne s'appliquent pas

**Solution** :
1. Vider le cache du navigateur (Ctrl+Shift+Delete)
2. Recharger avec Ctrl+F5
3. Vérifier que `styles.css` se charge dans l'onglet Network

## Commandes de débogage

Ouvrir la console développeur (F12) et tester :

```javascript
// Voir tous les départements
console.table(DataAPI.getDepartments());

// Voir tous les employés
console.table(DataAPI.getEmployees());

// Voir les employés d'un département spécifique
console.table(DataAPI.getEmployeesByDepartment('B01'));

// Réinitialiser toutes les données
DataAPI.resetData();
location.reload();

// Changer le thème
app.toggleTheme();

// Afficher une notification de test
app.showToast('Test réussi !', 'success');

// Voir le total des salaires d'un département
console.log(DataAPI.getTotalSalary('B01'));
```

## Test sur mobile

### Simulateur dans Chrome

1. Ouvrir DevTools (F12)
2. Cliquer sur l'icône mobile (Ctrl+Shift+M)
3. Sélectionner un appareil (iPhone, iPad, etc.)
4. Tester la navigation et les formulaires

### Test sur appareil réel

1. Trouver l'adresse IP de votre ordinateur
   - Windows : `ipconfig`
   - Mac/Linux : `ifconfig`
2. Sur le mobile, ouvrir : `http://[VOTRE_IP]:8000`
3. Exemple : `http://192.168.1.100:8000`

## Installation en tant que PWA

### Sur Desktop (Chrome/Edge)

1. Ouvrir l'application
2. Cliquer sur l'icône d'installation dans la barre d'adresse
3. Cliquer sur "Installer"
4. L'application s'ouvre comme une application native

### Sur Mobile (Android)

1. Ouvrir l'application dans Chrome
2. Menu (⋮) > "Ajouter à l'écran d'accueil"
3. L'icône apparaît sur l'écran d'accueil

### Sur Mobile (iOS)

1. Ouvrir l'application dans Safari
2. Bouton Partager > "Sur l'écran d'accueil"
3. L'icône apparaît sur l'écran d'accueil

## Performance

L'application devrait :
- ✅ Se charger en moins de 2 secondes
- ✅ Répondre instantanément aux interactions
- ✅ Fonctionner hors ligne après la première visite
- ✅ Utiliser moins de 5 Mo de mémoire

## Support

Si vous rencontrez des problèmes :

1. Vérifier la console développeur pour les erreurs
2. Consulter le fichier README.md pour plus de détails
3. S'assurer d'utiliser un navigateur moderne et à jour
4. Tester dans un autre navigateur (Chrome, Firefox, Edge)

## Prochaines étapes

Une fois l'application testée :

1. 📝 Lire le README.md complet pour toutes les fonctionnalités
2. 🎨 Créer les icônes PWA (voir INSTRUCTIONS.md)
3. 🚀 Déployer sur un serveur web si nécessaire
4. 📱 Tester sur différents appareils
5. 🎯 Personnaliser selon vos besoins

---

**Bon test ! 🎉**