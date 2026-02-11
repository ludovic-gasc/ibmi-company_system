# Système de Gestion d'Entreprise - PWA

Application Web Progressive moderne pour la gestion des départements et employés, reproduisant fidèlement les fonctionnalités de l'application RPG AS/400 d'origine.

## 📋 Fonctionnalités

### Écrans principaux

1. **Liste des Départements**
   - Affichage de tous les départements avec ID, nom et localisation
   - Recherche en temps réel
   - Tri par colonnes (ID, nom)
   - Actions disponibles :
     - Option 5 : Voir les employés du département
     - Option 8 : Créer un nouvel employé dans le département

2. **Liste des Employés**
   - Affichage des employés d'un département spécifique
   - Affichage du total des salaires du département
   - Recherche en temps réel
   - Tri par colonnes (ID, nom, poste, salaire)
   - Actions disponibles :
     - Option 5 : Voir les détails d'un employé
   - Bouton pour créer un nouvel employé

3. **Formulaire Nouvel Employé**
   - Génération automatique de l'ID employé
   - Champs de saisie :
     - Prénom (max 12 caractères)
     - Initiale (1 caractère)
     - Nom de famille (max 15 caractères)
     - Département (pré-rempli, lecture seule)
     - Poste (max 8 caractères)
     - Salaire (nombre décimal)
     - Téléphone (4 chiffres)
   - Validation complète des données
   - Messages d'erreur clairs

## 🎨 Caractéristiques techniques

### Design moderne
- Interface utilisateur intuitive et responsive
- Thème clair/sombre avec basculement
- Animations fluides et transitions
- Palette de couleurs professionnelle (bleu principal)
- Typographie claire et lisible
- Icônes SVG vectorielles

### Architecture
- **HTML5** : Structure sémantique
- **CSS3** : Variables CSS, Grid, Flexbox
- **JavaScript Vanilla** : Pas de dépendances externes
- **PWA** : Service Worker pour fonctionnement hors ligne
- **LocalStorage** : Persistance des données côté client

### Responsive Design
- Adapté aux écrans desktop, tablette et mobile
- Breakpoints : 768px et 480px
- Navigation optimisée pour mobile
- Formulaires adaptés au tactile

## 🚀 Installation et utilisation

### Prérequis
- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Serveur web local (optionnel pour le développement)

### Installation

1. **Cloner ou télécharger le projet**
   ```bash
   cd pwa-app
   ```

2. **Lancer avec un serveur local**
   
   Option 1 - Python :
   ```bash
   python -m http.server 8000
   ```
   
   Option 2 - Node.js (http-server) :
   ```bash
   npx http-server -p 8000
   ```
   
   Option 3 - PHP :
   ```bash
   php -S localhost:8000
   ```

3. **Ouvrir dans le navigateur**
   ```
   http://localhost:8000
   ```

### Installation en tant que PWA

1. Ouvrir l'application dans Chrome/Edge
2. Cliquer sur l'icône d'installation dans la barre d'adresse
3. Confirmer l'installation
4. L'application sera disponible comme une application native

## 📊 Données

### Départements (8 départements)
- A00 - Administration Générale (Paris)
- B01 - Technologies de l'Information (Lyon)
- C01 - Finance et Comptabilité (Marseille)
- D11 - Direction et Management (Paris)
- E21 - Ressources Humaines (Toulouse)
- D21 - Développement Logiciel (Lyon)
- E11 - Opérations et Support (Nantes)
- F22 - Marketing et Communication (Bordeaux)

### Employés
- Environ 80 employés répartis dans les départements
- Données générées aléatoirement avec :
  - Prénoms et noms français
  - Postes variés (Manager, Analyst, Clerk, Designer, Engineer, etc.)
  - Salaires entre 30 000 € et 100 000 €
  - Numéros de téléphone à 4 chiffres

### Stockage des données
- Toutes les données sont stockées dans le LocalStorage du navigateur
- Les données persistent entre les sessions
- Possibilité de réinitialiser les données (via la console développeur)

## 🎯 Navigation

### Flux de navigation
```
Départements
    ├─ [Option 5] → Employés du département
    │                   ├─ [Option 5] → Détails employé (toast)
    │                   ├─ [Bouton] → Nouvel employé
    │                   └─ [F12/Retour] → Départements
    │
    └─ [Option 8] → Nouvel employé
                        └─ [F12/Retour] → Départements
```

### Raccourcis clavier simulés
- **F3** : Quitter (retour aux départements)
- **F12** : Retour à l'écran précédent
- **Enter** : Valider un formulaire

## 🔧 Fonctionnalités avancées

### Recherche
- Recherche instantanée dans les tableaux
- Recherche sur tous les champs visibles
- Mise en évidence des résultats

### Tri
- Tri ascendant/descendant sur toutes les colonnes
- Indicateurs visuels de tri
- Tri numérique pour les salaires

### Validation
- Validation en temps réel des formulaires
- Messages d'erreur contextuels
- Contraintes de longueur et de format

### Notifications
- Toasts pour les actions réussies/échouées
- 4 types : succès, erreur, avertissement, info
- Disparition automatique après 5 secondes

### Thème
- Thème clair par défaut
- Thème sombre disponible
- Préférence sauvegardée dans LocalStorage
- Transition fluide entre les thèmes

## 📱 Compatibilité

### Navigateurs supportés
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

### Appareils
- Desktop (Windows, macOS, Linux)
- Tablettes (iPad, Android)
- Smartphones (iOS, Android)

## 🛠️ Structure du projet

```
pwa-app/
├── index.html              # Page principale
├── manifest.json           # Manifest PWA
├── service-worker.js       # Service Worker
├── README.md              # Documentation
├── css/
│   └── styles.css         # Styles CSS
├── js/
│   ├── app.js            # Logique application
│   └── data.js           # Gestion des données
└── images/               # Icônes PWA (à créer)
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-192.png
    ├── icon-384.png
    └── icon-512.png
```

## 🔒 Sécurité

- Échappement HTML pour prévenir les injections XSS
- Validation stricte des entrées utilisateur
- Pas de dépendances externes (pas de vulnérabilités tierces)
- Fonctionnement 100% côté client (pas de backend)

## 🎓 Utilisation de la console développeur

### Commandes utiles

```javascript
// Réinitialiser toutes les données
DataAPI.resetData();
location.reload();

// Voir tous les départements
console.table(DataAPI.getDepartments());

// Voir tous les employés
console.table(DataAPI.getEmployees());

// Voir les employés d'un département
console.table(DataAPI.getEmployeesByDepartment('B01'));

// Changer le thème
app.toggleTheme();

// Afficher une notification
app.showToast('Message de test', 'success');
```

## 📝 Notes de développement

### Correspondance avec l'application RPG

| Écran RPG | Vue PWA | Fonctionnalités |
|-----------|---------|-----------------|
| depts.dspf | departmentsView | Liste départements, options 5 et 8 |
| emps.dspf | employeesView | Liste employés, total salaires |
| nemp.dspf | newEmployeeView | Formulaire création employé |

### Champs de données

**Department (DEPARTMENT table)**
- DEPTNO (3 char) → id
- DEPTNAME (36 varchar) → name
- MGRNO (6 char) → mgrno
- ADMRDEPT (3 char) → admrdept
- LOCATION (16 char) → location

**Employee (EMPLOYEE table)**
- EMPNO (6 char) → empno
- FIRSTNME (12 varchar) → firstnme
- MIDINIT (1 char) → midinit
- LASTNAME (15 varchar) → lastname
- WORKDEPT (3 char) → workdept
- PHONENO (4 char) → phoneno
- HIREDATE (date) → hiredate
- JOB (8 char) → job
- EDLEVEL (smallint) → edlevel
- SEX (1 char) → sex
- BIRTHDATE (date) → birthdate
- SALARY (decimal 9,2) → salary
- BONUS (decimal 9,2) → bonus
- COMM (decimal 9,2) → comm

## 🚧 Améliorations futures possibles

- [ ] Export des données en CSV/Excel
- [ ] Impression des listes
- [ ] Graphiques et statistiques
- [ ] Modification des employés existants
- [ ] Suppression d'employés
- [ ] Gestion des départements (CRUD complet)
- [ ] Historique des modifications
- [ ] Filtres avancés
- [ ] Pagination pour grandes listes
- [ ] Mode multi-utilisateurs avec backend

## 📄 Licence

Ce projet est une démonstration éducative reproduisant les fonctionnalités d'une application RPG AS/400.

## 👨‍💻 Auteur

Développé avec ❤️ en utilisant les meilleures pratiques web modernes.

---

**Version:** 1.0.0  
**Date:** Février 2026