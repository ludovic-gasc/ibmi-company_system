# Analyse Technique Complète - IBM i Company System

## Vue d'ensemble du projet

**Company System** est une application de démonstration IBM i qui illustre les meilleures pratiques de développement moderne sur la plateforme AS/400. L'application gère les employés et les départements d'une entreprise avec une interface 5250 (écran vert) traditionnelle.

### Informations générales
- **Nom du projet** : Company System
- **Repository** : git@github.com:IBM/ibmi-company_system.git
- **Bibliothèque cible** : CMPSYS
- **Type d'application** : Application interactive 5250 avec base de données DB2 for i

---

## 1. Architecture de l'application

### 1.1 Structure globale

L'application suit une architecture en couches typique des applications IBM i modernes :

```
┌─────────────────────────────────────────┐
│     Couche Présentation (5250)          │
│  - depts.dspf (Liste départements)      │
│  - emps.dspf (Liste employés)           │
│  - nemp.dspf (Nouvel employé)           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│     Couche Logique Métier (RPG)         │
│  - depts.pgm.sqlrpgle (Gestion depts)   │
│  - employees.pgm.sqlrpgle (Gestion emp) │
│  - newemp.pgm.sqlrpgle (Création emp)   │
│  - empdet.sqlrpgle (Service program)    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│     Couche Données (DB2 for i)          │
│  - EMPLOYEE (Table employés)            │
│  - DEPARTMENT (Table départements)      │
│  - popemp (Procédure stockée)           │
│  - popdept (Procédure stockée)          │
└─────────────────────────────────────────┘
```

### 1.2 Type d'interface

**Interface 5250 (Green Screen)** - Application interactive traditionnelle utilisant :
- Fichiers d'affichage DDS (Display Files)
- Subfiles pour l'affichage de listes
- Navigation par touches de fonction (F3, F12, Enter)
- Pas d'interface web native

### 1.3 Approche de développement

- **ILE (Integrated Language Environment)** : Utilisation de programmes ILE RPG
- **SQL intégré** : Embedded SQL dans les programmes RPG
- **Modularité** : Service programs pour la réutilisation du code
- **Build moderne** : Support de GNU Make, ibmi-bob, et ARCAD Builder

---

## 2. Technologies et langages de programmation

### 2.1 Langages utilisés

| Langage | Version | Fichiers | Usage |
|---------|---------|----------|-------|
| **ILE RPG** | RPG IV (Free-format) | `*.sqlrpgle`, `*.pgm.rpgle` | Logique métier principale |
| **SQL** | DB2 for i | `*.table`, `*.sqlprc` | Définition de schéma et procédures stockées |
| **DDS** | - | `*.dspf` | Définition des écrans d'affichage |
| **CL** | ILE CL | `*.clle` | Programme de commande (exemple simple) |

### 2.2 Détails des technologies

#### ILE RPG (Integrated Language Environment RPG)
- **Format** : Free-format (`**free`)
- **Caractéristiques** :
  - `Ctl-Opt DFTACTGRP(*no)` : Activation groups pour isolation
  - `BNDDIR('APP')` : Binding directories pour résolution de symboles
  - SQL embarqué avec `EXEC SQL`
  - Procédures exportées pour service programs

#### SQL embarqué
- **Curseurs déclarés** : Pour parcourir les résultats
- **Transactions** : `COMMIT(*NONE)` - pas de gestion transactionnelle
- **Fonctions SQL** : `COALESCE`, `SUM`, `MAX`, `RTRIM`
- **JSON parsing** : Utilisation de `JSON_VALUE` pour API REST

#### DDS (Data Description Specifications)
- **INDARA** : Indicateurs séparés
- **SFL** : Subfiles pour affichage de listes
- **Attributs d'affichage** : `DSPATR(HI)`, `DSPATR(UL)`, `COLOR()`

---

## 3. Structure de la base de données

### 3.1 Schéma de base de données

#### Table EMPLOYEE

```sql
CREATE TABLE EMPLOYEE (
    EMPNO       CHAR(6)         NOT NULL PRIMARY KEY,
    FIRSTNME    VARCHAR(12)     NOT NULL,
    MIDINIT     CHAR(1)         NOT NULL,
    LASTNAME    VARCHAR(15)     NOT NULL,
    WORKDEPT    CHAR(3),                    -- FK vers DEPARTMENT
    PHONENO     CHAR(4),
    HIREDATE    DATE,
    JOB         CHAR(8),
    EDLEVEL     SMALLINT        NOT NULL,
    SEX         CHAR(1),
    BIRTHDATE   DATE,
    SALARY      DECIMAL(9,2),
    BONUS       DECIMAL(9,2),
    COMM        DECIMAL(9,2)
)
```

**Contraintes** :
- Clé primaire : `EMPNO`
- Contrainte CHECK : `PHONENO >= '0000' AND PHONENO <= '9998'`
- Référence circulaire commentée vers DEPARTMENT (évite les problèmes de dépendances)

#### Table DEPARTMENT

```sql
CREATE TABLE DEPARTMENT (
    DEPTNO      CHAR(3)         NOT NULL PRIMARY KEY,
    DEPTNAME    VARCHAR(36)     NOT NULL,
    MGRNO       CHAR(6)         NOT NULL,    -- FK vers EMPLOYEE (commentée)
    ADMRDEPT    CHAR(3)         NOT NULL,    -- FK auto-référence
    LOCATION    CHAR(16)        NOT NULL
)
```

**Contraintes** :
- Clé primaire : `DEPTNO`
- Clé étrangère : `ADMRDEPT` référence `DEPARTMENT(DEPTNO)` avec `ON DELETE CASCADE`
- Référence circulaire commentée vers EMPLOYEE (évite les problèmes de dépendances)

### 3.2 Relations entre tables

```
DEPARTMENT (1) ──────< (N) EMPLOYEE
   DEPTNO                  WORKDEPT

DEPARTMENT (1) ──────< (N) DEPARTMENT
   DEPTNO                  ADMRDEPT (auto-référence)
```

**Note importante** : Les références circulaires entre EMPLOYEE et DEPARTMENT sont intentionnellement commentées pour éviter les problèmes lors de la création des tables et l'insertion de données.

### 3.3 Index

Les index sont commentés dans les scripts de création mais seraient recommandés en production :
- `XDEPT1` sur `DEPARTMENT(DEPTNO)` - UNIQUE
- `XDEPT2` sur `DEPARTMENT(MGRNO)`
- `XDEPT3` sur `DEPARTMENT(ADMRDEPT)`
- `XEMP1` sur `EMPLOYEE(EMPNO)` - UNIQUE
- `XEMP2` sur `EMPLOYEE(WORKDEPT)`

---

## 4. Inventaire des programmes

### 4.1 Programmes interactifs

#### [`depts.pgm.sqlrpgle`](qrpglesrc/depts.pgm.sqlrpgle)
- **Type** : Programme interactif principal
- **Fonction** : Gestion et affichage de la liste des départements
- **Écran** : [`depts.dspf`](qddssrc/depts.dspf)
- **Caractéristiques** :
  - Subfile pour affichage de la liste
  - Options : 5=Voir employés, 8=Nouvel employé
  - Appelle [`employees.pgm.sqlrpgle`](qrpglesrc/employees.pgm.sqlrpgle) et [`newemp.pgm.sqlrpgle`](qrpglesrc/newemp.pgm.sqlrpgle)
  - Curseur SQL pour charger les départements
- **Touches de fonction** : F3=Quitter

#### [`employees.pgm.sqlrpgle`](qrpglesrc/employees.pgm.sqlrpgle)
- **Type** : Programme interactif
- **Fonction** : Affichage des employés d'un département
- **Écran** : [`emps.dspf`](qddssrc/emps.dspf)
- **Paramètre d'entrée** : `DEPTNO` (CHAR(3))
- **Caractéristiques** :
  - Subfile pour liste d'employés
  - Affiche le total des salaires du département
  - Utilise le service program [`empdet`](qrpglesrc/empdet.sqlrpgle) via `getDeptDetail()`
  - Binding directory : `APP`
- **Touches de fonction** : F12=Retour

#### [`newemp.pgm.sqlrpgle`](qrpglesrc/newemp.pgm.sqlrpgle)
- **Type** : Programme interactif
- **Fonction** : Création d'un nouvel employé
- **Écran** : [`nemp.dspf`](qddssrc/nemp.dspf)
- **Paramètre d'entrée** : `currentDepartment` (CHAR(3))
- **Caractéristiques** :
  - Génération automatique du numéro d'employé (MAX+100)
  - Validation des champs (nom, téléphone, salaire)
  - Insertion SQL avec `INSERT INTO EMPLOYEE`
  - Gestion d'erreurs avec affichage de messages
- **Touches de fonction** : F12=Annuler, Enter=Créer

#### [`mypgm.pgm.rpgle`](qrpglesrc/mypgm.pgm.rpgle)
- **Type** : Programme de démonstration
- **Fonction** : Exemple d'utilisation de la fonction C `printf`
- **Caractéristiques** : Appel de fonction externe, pas d'utilisation dans l'application principale

### 4.2 Service Programs

#### [`empdet.sqlrpgle`](qrpglesrc/empdet.sqlrpgle)
- **Type** : Service program (NOMAIN)
- **Fonction** : Services de récupération de détails employés/départements
- **Exports** (via [`empdet.bnd`](qrpglesrc/empdet.bnd)) :
  - `GETEMPLOYEEDETAIL` : Récupère nom complet et revenu net d'un employé
  - `GETDEPTDETAIL` : Récupère détails département et total des salaires
- **Structures de données** :
  - `employee_detail_t` : found, name, netincome
  - `department_detail_t` : found, deptname, location, totalsalaries
- **Utilisation** : Inclus via binding directory `APP`

### 4.3 Programmes CL

#### [`mypgm.clle`](qrpglesrc/mypgm.clle)
- **Type** : Programme CL simple
- **Fonction** : Exemple d'envoi de message
- **Caractéristiques** : Utilise `SNDPGMMSG` pour envoyer un message d'information

### 4.4 Hiérarchie d'appels

```
depts.pgm.sqlrpgle (Programme principal)
    ├─> employees.pgm.sqlrpgle
    │       └─> empdet.sqlrpgle (getDeptDetail)
    └─> newemp.pgm.sqlrpgle
            └─> getNewEmpId() (procédure interne)
```

---

## 5. Flux de données

### 5.1 Flux principal de l'application

```
1. Démarrage
   └─> depts.pgm.sqlrpgle
       └─> LoadSubfile()
           └─> EXEC SQL DECLARE deptCur CURSOR
               └─> SELECT DEPTNO, DEPTNAME FROM DEPARTMENT
                   └─> Affichage dans subfile

2. Sélection option 5 (Voir employés)
   └─> Appel employees.pgm.sqlrpgle(DEPTNO)
       ├─> getDeptDetail(DEPTNO) → Récupère total salaires
       └─> LoadSubfile()
           └─> EXEC SQL DECLARE empCur CURSOR
               └─> SELECT EMPNO, FIRSTNME, LASTNAME, JOB
                   WHERE WORKDEPT = :DEPTNO
                   └─> Affichage dans subfile

3. Sélection option 8 (Nouvel employé)
   └─> Appel newemp.pgm.sqlrpgle(DEPTNO)
       ├─> getNewEmpId() → MAX(EMPNO) + 100
       ├─> Saisie utilisateur
       ├─> GetError() → Validation
       └─> HandleInsert()
           └─> INSERT INTO EMPLOYEE VALUES (...)
```

### 5.2 Opérations de base de données

#### Lectures (SELECT)
- **Départements** : Lecture complète via curseur dans [`depts.pgm.sqlrpgle`](qrpglesrc/depts.pgm.sqlrpgle:101-112)
- **Employés par département** : Lecture filtrée dans [`employees.pgm.sqlrpgle`](qrpglesrc/employees.pgm.sqlrpgle:108-123)
- **Détails département** : Requête avec sous-requête dans [`empdet.sqlrpgle`](qrpglesrc/empdet.sqlrpgle:42-56)
- **Détails employé** : Calcul revenu net dans [`empdet.sqlrpgle`](qrpglesrc/empdet.sqlrpgle:14-24)
- **Nouvel ID employé** : MAX(EMPNO) dans [`newemp.pgm.sqlrpgle`](qrpglesrc/newemp.pgm.sqlrpgle:181-184)

#### Écritures (INSERT)
- **Nouvel employé** : INSERT dans [`newemp.pgm.sqlrpgle`](qrpglesrc/newemp.pgm.sqlrpgle:106-109)
- **Population départements** : Boucle INSERT dans [`popdept.sqlprc`](qsqlsrc/popdept.sqlprc:35-36)
- **Population employés** : INSERT avec données API dans [`popemp.sqlprc`](qsqlsrc/popemp.sqlprc:83-86)

#### Transactions
- **Mode** : `COMMIT(*NONE)` - Pas de gestion transactionnelle
- **Isolation** : Auto-commit après chaque instruction SQL
- **Note** : L'option `WITH NC` (No Commit) est utilisée dans les INSERT

---

## 6. Procédures stockées et utilitaires

### 6.1 [`popdept.sqlprc`](qsqlsrc/popdept.sqlprc)

**Fonction** : Génération automatique de 5 départements de test

**Caractéristiques** :
- Génère des données aléatoires (numéros, managers, localisations)
- Départements prédéfinis : Admin, IT, Finance, Management, HR
- Utilise `RAND()` pour générer des valeurs aléatoires
- Boucle WHILE pour insertion de 5 enregistrements

**Utilisation** :
```sql
CALL popdept();
```

### 6.2 [`popemp.sqlprc`](qsqlsrc/popemp.sqlprc)

**Fonction** : Génération automatique de 200 employés via API externe

**Caractéristiques** :
- **API externe** : https://randomuser.me/api/
- **Paramètre** : Nationalité (défaut: 'gb')
- **Fonctionnalités** :
  - Appel HTTP via `SYSTOOLS.HTTP_GET()` ou `SYSTOOLS.HTTPGETCLOB()`
  - Parsing JSON avec `JSON_VALUE()`
  - Génération de 200 employés par exécution
  - Attribution aléatoire aux départements existants
  - Calcul de dates, salaires, bonus aléatoires

**Compatibilité** :
- IBM i 7.5+ : `SYSTOOLS.HTTP_GET()`
- IBM i 7.4 et antérieur : `SYSTOOLS.HTTPGETCLOB()`

**Utilisation** :
```sql
CALL popemp('fr');  -- Employés français
CALL popemp('gb');  -- Employés britanniques (défaut)
```

**Données générées** :
- Prénom/nom depuis API
- Numéro employé : séquentiel (count+1 à count+200)
- Département : assignation aléatoire
- Date d'embauche : aléatoire sur 10 ans
- Salaire : 30,000 à 100,000
- Bonus/Commission : aléatoires

---

## 7. Fichiers d'affichage (Display Files)

### 7.1 [`depts.dspf`](qddssrc/depts.dspf)

**Format** : DDS (Data Description Specifications)

**Records** :
- **SFLDTA** : Subfile data (enregistrements de la liste)
  - `XSEL` : Option de sélection (1 caractère)
  - `XID` : ID département (3 caractères)
  - `XNAME` : Nom département (38 caractères)
  
- **SFLCTL** : Subfile control
  - Page size : 14 enregistrements
  - Size : 9999 enregistrements max
  - Indicateurs : 85=Display control, 95=Display, 75=Clear

- **FOOTER_FMT** : Pied de page
  - F3=Exit
  - Options : 5=View, 8=New Employee

**Caractéristiques** :
- `INDARA` : Indicateurs dans structure de données séparée
- `CA03` : Touche F3 active
- Couleurs : BLU (bleu), WHT (blanc)
- Attributs : HI (high intensity), UL (underline)

### 7.2 [`emps.dspf`](qddssrc/emps.dspf)

**Records** :
- **SFLDTA** : Subfile data
  - `XSEL` : Option de sélection
  - `XID` : ID employé (6 caractères)
  - `XNAME` : Nom complet (30 caractères)
  - `XJOB` : Poste (8 caractères)

- **SFLCTL** : Subfile control
  - `XTOT` : Total des salaires (9,2 décimal)
  - Affichage en position (5,61)

- **FOOTER_FMT** : Pied de page
  - F12=Back

**Caractéristiques** :
- `CA12` : Touche F12 active pour retour
- Affichage du total des salaires du département

### 7.3 [`nemp.dspf`](qddssrc/nemp.dspf)

**Records** :
- **DETAIL** : Écran de saisie
  - `XID` : ID employé (output only, auto-généré)
  - `XFIRST` : Prénom (12 caractères, input)
  - `XINIT` : Initiale (1 caractère, input)
  - `XLAST` : Nom (15 caractères, input)
  - `XDEPT` : Département (3 caractères, output only)
  - `XJOB` : Poste (8 caractères, input)
  - `XSAL` : Salaire (10 caractères, input)
  - `XTEL` : Téléphone (4 caractères, input)
  - `XERR` : Message d'erreur (50 caractères, output, rouge)

- **HEADER_FMT** : En-tête
  - F12=Back, Enter=Create

**Caractéristiques** :
- Validation côté programme
- Messages d'erreur en rouge
- ID auto-généré (non modifiable)

---

## 8. Fichiers de configuration et build

### 8.1 Système de build

L'application supporte **trois systèmes de build** :

#### GNU Make ([`makefile`](makefile))
```bash
make all
```

**Règles principales** :
- `%.pgm.sqlrpgle` : Compilation SQLRPG avec `CRTSQLRPGI`
- `%.pgm.rpgle` : Compilation RPG avec `CRTBNDRPG`
- `%.dspf` : Création display file avec `CRTDSPF`
- `%.table` : Exécution SQL avec `RUNSQLSTM`

**Dépendances** :
- `depts.pgm.sqlrpgle` dépend de `depts.dspf`, `department.table`, `newemp.pgm.sqlrpgle`
- `employees.pgm.sqlrpgle` dépend de `emps.dspf`, `employee.table`
- `newemp.pgm.sqlrpgle` dépend de `nemp.dspf`

#### ibmi-bob
```bash
makei build                    # Build complet
makei compile -f {filename}    # Compilation fichier
```

#### ARCAD Builder (Merlin)
```bash
/QOpenSys/pkgs/bin/elias compile {branch}
/QOpenSys/pkgs/bin/elias compile {branch} -f {files}
```

### 8.2 Configuration projet ([`iproj.json`](iproj.json))

```json
{
  "repository": "git@github.com:IBM/ibmi-company_system.git",
  "description": "Company System project",
  "includePath": ["qrpgleref"],
  "curlib": "&CURLIB",
  "objlib": "&CURLIB",
  "preUsrlibl": ["&CURLIB", "RPGUNIT", "QDEVTOOLS"],
  "buildCommand": "PATH=$PATH:/QOpenSys/pkgs/bin; export PATH; /QOpenSys/pkgs/bin/makei build",
  "compileCommand": "PATH=$PATH:/QOpenSys/pkgs/bin; export PATH; /QOpenSys/pkgs/bin/makei compile -f {filename}",
  "buildObjectCommand": "PATH=$PATH:/QOpenSys/pkgs/bin; export PATH; /QOpenSys/pkgs/bin/makei b -t {object}"
}
```

**Éléments clés** :
- **includePath** : Répertoire des fichiers include RPG
- **Library list** : CURLIB, RPGUNIT (tests), QDEVTOOLS
- **Variables** : `&CURLIB` remplacé par variable d'environnement

### 8.3 Binding Directory ([`app.bnddir`](qrpglesrc/app.bnddir))

```
CRTBNDDIR BNDDIR(&O/&N)
ADDBNDDIRE BNDDIR(&O/&N) OBJ((*LIBL/EMPDET *SRVPGM))
```

**Fonction** : Lie le service program `EMPDET` aux programmes qui l'utilisent

### 8.4 Fichiers include

#### [`constants.rpgleinc`](qrpgleref/constants.rpgleinc)
- Définition des constantes pour touches de fonction (F01-F24, ENTER, HELP, PRINT)
- Valeurs hexadécimales pour identification des touches

#### [`empdet.rpgleinc`](qrpgleref/empdet.rpgleinc)
- Structures de données : `employee_detail_t`, `department_detail_t`
- Prototypes de procédures : `getDeptDetail()`, `getEmployeeDetail()`

---

## 9. Tests unitaires

### 9.1 Framework de test

**Framework** : RPGUnit

**Configuration** ([`testing.json`](qtestsrc/testing.json)) :
```json
{
    "rpgunit": {
        "rucrtrpg": {
            "tgtCcsid": 37,
            "dbgView": "*SOURCE",
            "cOption": ["*EVENTF"]
        },
        "prefix": "T_"
    }
}
```

### 9.2 Tests implémentés ([`empdet.test.sqlrpgle`](qtestsrc/empdet.test.sqlrpgle))

#### Test Suite Setup
- **Fonction** : `setUpSuite()`
- **Données de test** :
  - 3 employés : CHRISTINE HAAS, MICHAEL THOMPSON, GREG ORLANDO
  - 2 départements : A00 (SPIFFY COMPUTER SERVICE DIV.), B01 (PLANNING)
- **Gestion d'erreurs** : Ignore erreur -803 (duplicate key) pour réexécutions

#### Test Cases

**1. `test_getEmployeeDetail_found`**
- **Objectif** : Vérifier récupération détails employé existant
- **Input** : EMPNO = '000010'
- **Assertions** :
  - `found = *on`
  - `name = 'CHRISTINE I HAAS'`
  - `netincome = 57970` (52750 + 1000 + 4220)

**2. `test_getDeptDetail_found`**
- **Objectif** : Vérifier récupération détails département existant
- **Input** : DEPTNO = 'A00'
- **Assertions** :
  - `found = *on`
  - `deptname = 'SPIFFY COMPUTER SERVICE DIV.'`
  - `location = 'NEW YORK'`
  - `totalsalaries = 90160` (somme des salaires du département)

**Assertions utilisées** :
- `nEqual()` : Comparaison indicateurs
- `aEqual()` : Comparaison chaînes
- `assert()` : Comparaison numériques

---

## 10. Sécurité et contrôles d'accès

### 10.1 Modèle de sécurité actuel

**Niveau de sécurité** : Basique (application de démonstration)

**Caractéristiques** :
- Pas d'authentification utilisateur implémentée
- Pas de contrôle d'autorisation par rôle
- Pas d'audit des modifications
- Sécurité au niveau objet IBM i standard

### 10.2 Sécurité des données

#### Validation des entrées
- **Champs obligatoires** : Vérification dans [`newemp.pgm.sqlrpgle`](qrpglesrc/newemp.pgm.sqlrpgle:114-164)
  - Prénom, initiale, nom, département, poste, salaire, téléphone
- **Validation de format** :
  - Salaire : Doit être numérique (conversion avec `%DEC`)
  - Téléphone : Doit être numérique (conversion avec `%INT`)
- **Contrainte DB** : Téléphone entre '0000' et '9998'

#### Injection SQL
- **Protection** : Utilisation de variables host (`:variable`) dans toutes les requêtes SQL
- **Pas de SQL dynamique** : Toutes les requêtes sont précompilées
- **Exemple sécurisé** :
```rpgle
EXEC SQL
  SELECT EMPNO, FIRSTNME, LASTNAME, JOB
  FROM EMPLOYEE
  WHERE WORKDEPT = :DEPTNO;  -- Variable host, pas de concaténation
```

### 10.3 Recommandations de sécurité

Pour une mise en production, il faudrait implémenter :

1. **Authentification** :
   - Vérification des profils utilisateurs IBM i
   - Gestion des sessions

2. **Autorisation** :
   - Contrôle d'accès basé sur les rôles (RBAC)
   - Authorization lists pour les objets sensibles
   - Adopted authority pour élévation de privilèges contrôlée

3. **Audit** :
   - Journalisation des modifications (INSERT, UPDATE, DELETE)
   - Triggers de base de données pour audit trail
   - Horodatage et identification utilisateur

4. **Chiffrement** :
   - Données sensibles (salaires) chiffrées au repos
   - Communications sécurisées si interface web ajoutée

5. **Validation renforcée** :
   - Validation côté serveur systématique
   - Limites de longueur strictes
   - Sanitization des entrées

---

## 11. Dette technique et opportunités de modernisation

### 11.1 Dette technique identifiée

#### 1. Références circulaires commentées
**Localisation** : [`department.table`](qsqlsrc/department.table:16-20), [`employee.table`](qsqlsrc/employee.table:20-24)

**Problème** :
```sql
-- ALTER TABLE DEPARTMENT
--      ADD FOREIGN KEY RDE (MGRNO)
--          REFERENCES EMPLOYEE
--          ON DELETE SET NULL;
```

**Impact** : Intégrité référentielle non garantie entre départements et managers

**Solution** :
- Implémenter les FK avec gestion appropriée de l'ordre de création
- Utiliser des triggers pour maintenir l'intégrité
- Ou accepter la contrainte logique sans FK physique

#### 2. Index commentés
**Localisation** : Tous les fichiers `*.table`

**Impact** : Performances dégradées sur grandes volumétries

**Solution** : Activer les index en production
```sql
CREATE UNIQUE INDEX XEMP1 ON EMPLOYEE (EMPNO);
CREATE INDEX XEMP2 ON EMPLOYEE (WORKDEPT);
CREATE UNIQUE INDEX XDEPT1 ON DEPARTMENT (DEPTNO);
```

#### 3. Gestion des erreurs limitée
**Localisation** : Programmes RPG

**Problèmes** :
- Pas de gestion centralisée des erreurs
- Messages d'erreur en dur dans le code
- Pas de logging structuré

**Solution** :
- Créer un module de gestion d'erreurs centralisé
- Utiliser des message files (MSGF)
- Implémenter un système de logging

#### 4. Pas de gestion transactionnelle
**Localisation** : `COMMIT(*NONE)` partout

**Impact** : Risque d'incohérence en cas d'erreur

**Solution** :
- Implémenter `COMMIT(*CHG)` ou `COMMIT(*CS)`
- Ajouter des points de commit/rollback explicites
- Gérer les unités de travail logiques

#### 5. Valeurs codées en dur
**Exemples** :
- Incrémentation de 100 pour nouveaux IDs : [`newemp.pgm.sqlrpgle`](qrpglesrc/newemp.pgm.sqlrpgle:187)
- Noms de départements : [`popdept.sqlprc`](qsqlsrc/popdept.sqlprc:26-32)
- URL API : [`popemp.sqlprc`](qsqlsrc/popemp.sqlprc:49)

**Solution** :
- Externaliser dans fichiers de configuration
- Utiliser des data areas ou tables de paramètres

#### 6. TODO non résolus
**Localisation** : [`newemp.pgm.sqlrpgle`](qrpglesrc/newemp.pgm.sqlrpgle:5)
```rpgle
// TODO: need a way to let the parent program pass in a department id
```
**Note** : En fait, le paramètre est déjà implémenté, le TODO est obsolète

### 11.2 Opportunités de modernisation

#### 1. Interface utilisateur

**État actuel** : 5250 uniquement

**Modernisation possible** :
- **Web UI** : Développer interface web avec :
  - Node.js + Express
  - Angular/React/Vue.js
  - API REST pour accès aux données
- **Mobile** : Application mobile native ou hybride
- **Approche hybride** : Conserver 5250 pour utilisateurs internes, web pour externes

**Avantages** :
- Accessibilité depuis n'importe où
- UX moderne
- Intégration avec autres systèmes web

#### 2. Architecture API

**Proposition** : Créer une couche API REST

```
┌─────────────────────┐
│   Web/Mobile UI     │
└──────────┬──────────┘
           │ REST API
┌──────────▼──────────┐
│   API Layer (Node)  │
│   - Express         │
│   - itoolkit        │
└──────────┬──────────┘
           │ Program calls
┌──────────▼──────────┐
│   RPG Programs      │
│   (logique métier)  │
└──────────┬──────────┘
           │ SQL
┌──────────▼──────────┐
│   DB2 for i         │
└─────────────────────┘
```

**Technologies** :
- **itoolkit** : Appel de programmes RPG depuis Node.js
- **ODBC/JDBC** : Accès direct à DB2 for i
- **REST API** : Endpoints pour CRUD operations

#### 3. Service-Oriented Architecture (SOA)

**État actuel** : Monolithique avec couplage fort

**Modernisation** :
- Découper en microservices :
  - Service Départements
  - Service Employés
  - Service Authentification
  - Service Reporting
- Communication via :
  - REST APIs
  - Message queues (IBM MQ)
  - Data queues

#### 4. Amélioration du service program

**État actuel** : [`empdet.sqlrpgle`](qrpglesrc/empdet.sqlrpgle) - Basique

**Améliorations** :
- Ajouter plus de fonctions métier réutilisables
- Implémenter cache pour performances
- Ajouter gestion d'erreurs robuste
- Créer modules par domaine métier

#### 5. Tests automatisés

**État actuel** : Tests unitaires basiques avec RPGUnit

**Améliorations** :
- **Couverture** : Augmenter à 80%+ de code coverage
- **Tests d'intégration** : Tester flux complets
- **Tests de performance** : Benchmarks automatisés
- **CI/CD** : Intégration continue avec :
  - Jenkins
  - GitLab CI
  - GitHub Actions

#### 6. Observabilité

**Manque actuel** : Pas de monitoring, logging limité

**Implémentation** :
- **Logging structuré** :
  - Niveaux : DEBUG, INFO, WARN, ERROR
  - Format JSON pour parsing
  - Centralisation des logs
- **Monitoring** :
  - Métriques applicatives
  - Alertes sur erreurs
  - Dashboards (Grafana, Kibana)
- **Tracing** :
  - Traçabilité des requêtes
  - Analyse des performances

#### 7. DevOps et automatisation

**État actuel** : Build manuel ou semi-automatique

**Modernisation** :
- **Git workflow** : Feature branches, pull requests
- **CI/CD pipeline** :
  ```
  Commit → Build → Test → Deploy Dev → Test Integration → Deploy Prod
  ```
- **Infrastructure as Code** : Scripts de déploiement automatisés
- **Rollback automatique** : En cas d'échec de déploiement

#### 8. Documentation

**État actuel** : README basique, commentaires dans code

**Améliorations** :
- **Documentation API** : OpenAPI/Swagger
- **Architecture Decision Records (ADR)**
- **Diagrammes** : Architecture, flux, séquence
- **Wiki** : Documentation utilisateur et technique
- **Inline documentation** : JSDoc/RDoc style pour RPG

### 11.3 Patterns legacy à moderniser

#### 1. Subfiles
**Pattern actuel** : Subfiles DDS traditionnels

**Modernisation** :
- Pagination côté serveur
- Lazy loading
- Virtual scrolling pour grandes listes

#### 2. Indicateurs
**Pattern actuel** : Indicateurs positionnels (Pos(21), Pos(85))

**Modernisation** :
- Structures de données nommées
- Constantes symboliques
- Enums pour états

#### 3. Gestion d'état
**Pattern actuel** : Variables globales, pas de gestion d'état

**Modernisation** :
- State management pattern
- Session management
- Stateless API design

---

## 12. Lacunes de documentation

### 12.1 Documentation manquante

#### 1. Logique métier
- **Règles de calcul** : Comment est calculé le revenu net ?
- **Règles de validation** : Pourquoi incrément de 100 pour nouveaux IDs ?
- **Processus métier** : Workflow de création d'employé complet

#### 2. Diagrammes
- **Diagramme de classes** : Relations entre entités
- **Diagrammes de séquence** : Flux d'interactions
- **Diagramme d'architecture** : Vue d'ensemble système

#### 3. Guide d'installation
- **Prérequis** : Versions IBM i, packages requis
- **Configuration** : Variables d'environnement, library list
- **Dépendances** : RPGUNIT, QDEVTOOLS, bob

#### 4. Guide utilisateur
- **Manuel utilisateur** : Comment utiliser l'application
- **Captures d'écran** : Interfaces 5250
- **Cas d'usage** : Scénarios typiques

#### 5. Guide développeur
- **Standards de code** : Conventions de nommage, style
- **Processus de contribution** : Comment contribuer au projet
- **Debugging** : Comment déboguer l'application

### 12.2 Code non documenté

#### Procédures sans documentation
- [`ClearSubfile()`](qrpglesrc/depts.pgm.sqlrpgle:83-92) dans depts.pgm.sqlrpgle
- [`LoadSubfile()`](qrpglesrc/depts.pgm.sqlrpgle:94-131) dans depts.pgm.sqlrpgle
- [`HandleInputs()`](qrpglesrc/depts.pgm.sqlrpgle:133-159) dans depts.pgm.sqlrpgle

**Note** : Certaines procédures dans employees.pgm.sqlrpgle ont une bonne documentation JSDoc-style

#### Structures de données
- `FILEINFO` : Champs non documentés
- `WkStnInd` : Signification des indicateurs

#### Algorithmes complexes
- Génération d'ID dans [`getNewEmpId()`](qrpglesrc/newemp.pgm.sqlrpgle:171-194)
- Logique de parsing JSON dans [`popemp.sqlprc`](qsqlsrc/popemp.sqlprc:60-80)

### 12.3 Dépendances non documentées

#### Dépendances externes
- **randomuser.me API** : Pas de documentation sur :
  - Limites de taux
  - Gestion des erreurs
  - Alternatives en cas d'indisponibilité

#### Dépendances système
- **SYSTOOLS** : Fonctions HTTP_GET/HTTPGETCLOB
  - Versions IBM i supportées
  - Configuration réseau requise

#### Bibliothèques requises
- **RPGUNIT** : Version minimale ?
- **QDEVTOOLS** : Qu'est-ce que c'est ?

### 12.4 Configuration non documentée

#### Variables d'environnement
- `CURLIB` : Comment la définir ?
- `PATH` : Pourquoi modifier le PATH ?

#### Paramètres de compilation
- `TGTCCSID(*JOB)` : Implications ?
- `DBGVIEW(*SOURCE)` : Toujours nécessaire ?

---

## 13. Recommandations et plan d'action

### 13.1 Priorités court terme (0-3 mois)

#### Priorité 1 : Stabilité
1. **Activer les index** en production
2. **Implémenter gestion d'erreurs** robuste
3. **Ajouter logging** structuré
4. **Compléter tests unitaires** (couverture 80%+)

#### Priorité 2 : Documentation
1. **Créer guide d'installation** complet
2. **Documenter API** (procédures exportées)
3. **Ajouter diagrammes** d'architecture
4. **Documenter processus métier**

#### Priorité 3 : Qualité du code
1. **Résoudre TODOs**
2. **Externaliser valeurs codées en dur**
3. **Standardiser gestion d'erreurs**
4. **Ajouter commentaires** aux procédures

### 13.2 Priorités moyen terme (3-6 mois)

#### Modernisation progressive
1. **Créer couche API REST**
   - Endpoints pour CRUD départements
   - Endpoints pour CRUD employés
   - Documentation OpenAPI

2. **Implémenter authentification**
   - Vérification profils IBM i
   - Gestion sessions
   - Contrôle d'accès basique

3. **Améliorer tests**
   - Tests d'intégration
   - Tests de performance
   - CI/CD basique

4. **Monitoring**
   - Logging centralisé
   - Métriques applicatives
   - Alertes sur erreurs

### 13.3 Priorités long terme (6-12 mois)

#### Transformation digitale
1. **Interface web moderne**
   - Frontend React/Angular
   - Backend Node.js
   - API REST complète

2. **Architecture microservices**
   - Découpage en services
   - Communication asynchrone
   - Scalabilité horizontale

3. **DevOps complet**
   - CI/CD automatisé
   - Infrastructure as Code
   - Déploiements automatiques

4. **Observabilité avancée**
   - Distributed tracing
   - Dashboards temps réel
   - Analytics prédictifs

### 13.4 Métriques de succès

#### Qualité
- **Code coverage** : > 80%
- **Bugs en production** : < 5 par mois
- **Temps de résolution** : < 24h pour bugs critiques

#### Performance
- **Temps de réponse** : < 2s pour 95% des requêtes
- **Disponibilité** : > 99.5%
- **Throughput** : > 100 transactions/seconde

#### Modernisation
- **API coverage** : 100% des fonctionnalités
- **Adoption web UI** : > 50% des utilisateurs
- **Satisfaction utilisateur** : > 4/5

---

## 14. Conclusion

### 14.1 Points forts de l'application

1. **Architecture claire** : Séparation couches présentation/logique/données
2. **Code moderne** : ILE RPG free-format, SQL embarqué
3. **Modularité** : Service programs réutilisables
4. **Tests** : Framework RPGUnit en place
5. **Build flexible** : Support de 3 systèmes de build
6. **Bonnes pratiques** : Variables host SQL, validation entrées

### 14.2 Axes d'amélioration prioritaires

1. **Sécurité** : Authentification, autorisation, audit
2. **Robustesse** : Gestion d'erreurs, transactions, logging
3. **Performance** : Index, optimisation requêtes
4. **Documentation** : Guides, diagrammes, API docs
5. **Modernisation** : API REST, interface web

### 14.3 Potentiel de modernisation

L'application est un **excellent candidat pour la modernisation** :
- Base solide avec code propre et structuré
- Logique métier bien encapsulée
- Pas de dépendances legacy complexes
- Architecture modulaire facilitant l'évolution

**Approche recommandée** : Modernisation progressive (strangler pattern)
1. Créer API REST autour du code existant
2. Développer nouvelle UI web en parallèle
3. Migrer progressivement les utilisateurs
4. Maintenir 5250 pour utilisateurs qui le souhaitent

### 14.4 Estimation d'effort

| Phase | Durée | Effort (jours-homme) |
|-------|-------|---------------------|
| Stabilisation + Documentation | 2-3 mois | 30-40 |
| API REST + Auth | 3-4 mois | 50-60 |
| Interface Web | 4-6 mois | 80-100 |
| Microservices + DevOps | 6-8 mois | 100-120 |
| **Total** | **12-18 mois** | **260-320** |

---

## Annexes

### A. Glossaire

| Terme | Définition |
|-------|------------|
| **5250** | Terminal émulation pour IBM i (écran vert) |
| **DDS** | Data Description Specifications - Langage de définition d'écrans et fichiers |
| **ILE** | Integrated Language Environment - Environnement d'exécution moderne IBM i |
| **SQLRPGLE** | RPG avec SQL embarqué |
| **Subfile** | Liste scrollable dans écran 5250 |
| **Service Program** | Bibliothèque de procédures réutilisables (équivalent DLL) |
| **Binding Directory** | Liste de service programs à lier |
| **NOMAIN** | Module sans point d'entrée principal (pour service programs) |

### B. Références

- [IBM i Documentation](https://www.ibm.com/docs/en/i)
- [RPG Café](https://www.rpgpgm.com/)
- [ibmi-bob Documentation](https://ibm.github.io/ibmi-bob/)
- [RPGUnit](https://rpgunit.sourceforge.net/)
- [IBM i OSS](https://ibmi-oss-docs.readthedocs.io/)

### C. Structure des répertoires

```
ibmi-company_system/
├── .github/              # GitHub workflows
├── .vscode/              # Configuration VS Code
├── qddssrc/              # Display files (DDS)
│   ├── depts.dspf
│   ├── emps.dspf
│   ├── nemp.dspf
│   └── Rules.mk
├── qrpgleref/            # Include files RPG
│   ├── constants.rpgleinc
│   └── empdet.rpgleinc
├── qrpglesrc/            # Source RPG
│   ├── app.bnddir
│   ├── depts.pgm.sqlrpgle
│   ├── empdet.bnd
│   ├── empdet.sqlrpgle
│   ├── employees.pgm.sqlrpgle
│   ├── mypgm.clle
│   ├── mypgm.pgm.rpgle
│   ├── newemp.pgm.sqlrpgle
│   └── Rules.mk
├── qsqlsrc/              # Scripts SQL
│   ├── department.table
│   ├── employee.table
│   ├── popdept.sqlprc
│   ├── popemp.sqlprc
│   └── Rules.mk
├── qtestsrc/             # Tests unitaires
│   ├── empdet.test.sqlrpgle
│   └── testing.json
├── .gitignore
├── iproj.json            # Configuration projet
├── makefile              # Build GNU Make
├── readme.md
└── Rules.mk              # Règles Make globales
```

---

**Document généré le** : 2025-12-16  
**Version** : 1.0  
**Auteur** : Analyse technique automatisée  
**Statut** : Complet