
# Plan de Modernisation - Company System
## Migration vers Architecture SPA avec API REST/JSON

---

## Table des matières

1. [Vue d'ensemble de la modernisation](#1-vue-densemble-de-la-modernisation)
2. [Architecture cible](#2-architecture-cible)
3. [Stratégie de migration](#3-stratégie-de-migration)
4. [Conception de l'API REST](#4-conception-de-lapi-rest)
5. [Conception du frontend SPA](#5-conception-du-frontend-spa)
6. [Adaptation de la couche RPG](#6-adaptation-de-la-couche-rpg)
7. [Plan d'implémentation](#7-plan-dimplémentation)
8. [Gestion des risques](#8-gestion-des-risques)
9. [Métriques de succès](#9-métriques-de-succès)

---

## 1. Vue d'ensemble de la modernisation

### 1.1 Objectifs

**Objectif principal** : Remplacer les interfaces 5250 (DSPF) par une application web moderne (SPA) tout en conservant la logique métier RPG existante.

**Objectifs spécifiques** :
- ✅ Créer une API REST/JSON pour exposer les fonctionnalités métier
- ✅ Développer une interface utilisateur moderne et responsive
- ✅ Améliorer l'expérience utilisateur (UX)
- ✅ Permettre l'accès depuis n'importe quel appareil (desktop, mobile, tablette)
- ✅ Maintenir la compatibilité avec le code RPG existant
- ✅ Faciliter les évolutions futures

### 1.2 Périmètre

**Dans le périmètre** :
- Remplacement des 3 écrans DSPF par des vues web
- Création d'une API REST complète
- Développement d'une SPA moderne
- Adaptation minimale du code RPG (création de wrappers)
- Tests et validation

**Hors périmètre** :
- Réécriture complète de la logique métier
- Migration de la base de données
- Modification des procédures stockées
- Changements des règles métier

### 1.3 Contraintes

- **Technique** : Conserver le code RPG existant autant que possible
- **Temporelle** : Migration progressive sans interruption de service
- **Budgétaire** : Utiliser des technologies open-source
- **Organisationnelle** : Formation des équipes aux nouvelles technologies

---

## 2. Architecture cible

### 2.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (SPA)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Departments │  │  Employees   │  │  New Employee│     │
│  │     View     │  │     View     │  │     View     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         React/Vue.js + TypeScript + Tailwind CSS           │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/REST/JSON
┌────────────────────────▼────────────────────────────────────┐
│                   API GATEWAY (Node.js)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express.js + Middleware (Auth, CORS, Validation)   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Departments  │  │  Employees   │  │    Auth      │     │
│  │   Routes     │  │   Routes     │  │   Routes     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │ itoolkit / ODBC
┌────────────────────────▼────────────────────────────────────┐
│              RPG WRAPPER LAYER (New)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API-friendly RPG Programs (JSON I/O)               │  │
│  │  - DEPTAPI.SQLRPGLE                                  │  │
│  │  - EMPAPI.SQLRPGLE                                   │  │
│  │  - NEWEMPAPI.SQLRPGLE                                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ Program Calls
┌────────────────────────▼────────────────────────────────────┐
│           EXISTING RPG BUSINESS LOGIC                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ depts.pgm    │  │employees.pgm │  │ newemp.pgm   │     │
│  │ .sqlrpgle    │  │ .sqlrpgle    │  │ .sqlrpgle    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  empdet.sqlrpgle (Service Program)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL
┌────────────────────────▼────────────────────────────────────┐
│                    DB2 for i                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  DEPARTMENT  │  │   EMPLOYEE   │  │  Procedures  │     │
│  │    Table     │  │    Table     │  │   (popdept,  │     │
│  │              │  │              │  │    popemp)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Stack technologique

#### Frontend (SPA)

**Framework** : React 18+ avec TypeScript
- **Justification** :
  - Large communauté et écosystème mature
  - Excellent support TypeScript
  - Performance optimale avec Virtual DOM
  - Composants réutilisables

**Alternatives considérées** :
- Vue.js 3 : Plus simple mais écosystème moins mature
- Angular : Plus lourd, courbe d'apprentissage plus raide

**Bibliothèques complémentaires** :
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.0",
  "react-query": "^5.0.0",
  "zustand": "^4.4.0",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "tailwindcss": "^3.3.0",
  "shadcn/ui": "latest"
}
```

**Outils de développement** :
- **Vite** : Build tool rapide
- **ESLint + Prettier** : Qualité du code
- **Vitest** : Tests unitaires
- **Playwright** : Tests E2E

#### Backend (API Gateway)

**Runtime** : Node.js 20 LTS
- **Justification** :
  - Excellente intégration avec IBM i via itoolkit
  - Performance élevée pour I/O
  - Écosystème npm riche

**Framework** : Express.js 4.x
```javascript
{
  "express": "^4.18.0",
  "itoolkit": "^1.0.0",
  "odbc": "^2.4.0",
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "express-validator": "^7.0.0",
  "winston": "^3.11.0"
}
```

**Alternatives considérées** :
- FastAPI (Python) : Moins d'intégration avec IBM i
- Spring Boot (Java) : Plus lourd, démarrage plus lent

#### RPG Wrapper Layer

**Nouveaux programmes RPG** :
- Format : ILE RPG Free-format
- I/O : JSON via DATA-INTO et DATA-GEN
- Communication : Data queues ou program calls

**Bibliothèques** :
- **YAJL** : JSON parsing/generation pour RPG
- **ILEastic** : Framework web REST natif pour ILE (alternative)

### 2.3 Patterns architecturaux

#### Frontend

**Architecture** : Feature-based structure
```
src/
├── features/
│   ├── departments/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── employees/
│   └── auth/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── api/
└── store/
```

**State Management** : Zustand + React Query
- Zustand : État global de l'application
- React Query : Cache et synchronisation des données serveur

**Routing** : React Router v6
- Routes protégées avec authentification
- Lazy loading des composants

#### Backend

**Architecture** : Layered Architecture
```
src/
├── routes/          # Définition des endpoints
├── controllers/     # Logique de contrôle
├── services/        # Logique métier
├── models/          # Modèles de données
├── middleware/      # Middleware Express
├── utils/           # Utilitaires
├── config/          # Configuration
└── validators/      # Validation des données
```

**Patterns** :
- **Repository Pattern** : Abstraction de l'accès aux données
- **Service Layer** : Logique métier réutilisable
- **Dependency Injection** : Testabilité et découplage

---

## 3. Stratégie de migration

### 3.1 Approche : Strangler Fig Pattern

**Principe** : Remplacer progressivement l'ancien système par le nouveau sans interruption de service.

```
Phase 1: Coexistence
┌─────────────┐
│  5250 UI    │ ←─── Utilisateurs existants
└─────────────┘
       │
       ▼
┌─────────────┐
│  RPG Logic  │
└─────────────┘

Phase 2: Migration progressive
┌─────────────┐     ┌─────────────┐
│  5250 UI    │ ←─┤ │   Web UI    │ ←─── Nouveaux utilisateurs
└─────────────┘   │ └─────────────┘
       │          │        │
       ▼          │        ▼
┌─────────────┐   │ ┌─────────────┐
│  RPG Logic  │ ←─┴─│  API Layer  │
└─────────────┘     └─────────────┘

Phase 3: Remplacement complet
┌─────────────┐
│   Web UI    │ ←─── Tous les utilisateurs
└─────────────┘
       │
       ▼
┌─────────────┐
│  API Layer  │
└─────────────┘
       │
       ▼
┌─────────────┐
│  RPG Logic  │
└─────────────┘
```

### 3.2 Phases de migration

#### Phase 1 : Fondations (Mois 1-2)

**Objectifs** :
- Mettre en place l'infrastructure
- Créer les premiers endpoints API
- Développer le premier écran web

**Livrables** :
1. **Infrastructure** :
   - Serveur Node.js configuré
   - Pipeline CI/CD
   - Environnements (dev, test, prod)

2. **API** :
   - Endpoint GET /api/departments
   - Endpoint GET /api/departments/:id/employees
   - Documentation OpenAPI

3. **Frontend** :
   - Application React initialisée
   - Écran de liste des départements
   - Composants UI de base

4. **RPG** :
   - Programme wrapper DEPTAPI.SQLRPGLE
   - Tests unitaires

**Critères de succès** :
- API fonctionnelle et documentée
- Premier écran web opérationnel
- Tests automatisés en place

#### Phase 2 : Fonctionnalités principales (Mois 3-4)

**Objectifs** :
- Compléter les fonctionnalités CRUD
- Implémenter l'authentification
- Développer tous les écrans

**Livrables** :
1. **API** :
   - Endpoints employés (GET, POST, PUT, DELETE)
   - Authentification JWT
   - Validation des données

2. **Frontend** :
   - Écran liste des employés
   - Écran création d'employé
   - Formulaires avec validation
   - Gestion d'erreurs

3. **RPG** :
   - Wrappers EMPAPI et NEWEMPAPI
   - Gestion des erreurs améliorée

**Critères de succès** :
- Toutes les fonctionnalités 5250 disponibles en web
- Authentification fonctionnelle
- UX validée par les utilisateurs

#### Phase 3 : Optimisation et migration (Mois 5-6)

**Objectifs** :
- Optimiser les performances
- Migrer les utilisateurs
- Décommissionner les écrans 5250

**Livrables** :
1. **Performance** :
   - Cache Redis
   - Optimisation des requêtes
   - Lazy loading

2. **Migration** :
   - Formation des utilisateurs
   - Migration progressive par groupe
   - Support et assistance

3. **Décommissionnement** :
   - Désactivation des écrans 5250
   - Nettoyage du code
   - Documentation finale

**Critères de succès** :
- 100% des utilisateurs migrés
- Performance satisfaisante (< 2s)
- Satisfaction utilisateur > 80%

### 3.3 Stratégie de rollback

**Principe** : Possibilité de revenir en arrière à tout moment

**Mécanismes** :
1. **Feature flags** : Activation/désactivation des fonctionnalités
2. **Routing conditionnel** : Redirection vers 5250 si nécessaire
3. **Versioning API** : Support de plusieurs versions simultanées
4. **Backup automatique** : Sauvegarde avant chaque déploiement

**Procédure de rollback** :
```bash
# 1. Désactiver le feature flag
curl -X POST /api/admin/features/web-ui -d '{"enabled": false}'

# 2. Rediriger vers 5250
# Configuration dans le load balancer

# 3. Rollback de la version API si nécessaire
kubectl rollout undo deployment/api-gateway

# 4. Notification aux utilisateurs
```

---

## 4. Conception de l'API REST

### 4.1 Principes de conception

**Standards** :
- REST Level 2 (Richardson Maturity Model)
- JSON comme format d'échange
- HTTP status codes appropriés
- Versioning dans l'URL (/api/v1/)

**Conventions** :
- Noms de ressources au pluriel
- Kebab-case pour les URLs
- camelCase pour les propriétés JSON
- Pagination pour les listes
- HATEOAS pour la navigation (optionnel)

### 4.2 Endpoints API

#### Départements

```yaml
# Liste des départements
GET /api/v1/departments
Response: 200 OK
{
  "data": [
    {
      "id": "A00",
      "name": "SPIFFY COMPUTER SERVICE DIV.",
      "managerId": "000010",
      "adminDept": "A00",
      "location": "NEW YORK",
      "employeeCount": 3,
      "totalSalaries": 90160.00,
      "_links": {
        "self": "/api/v1/departments/A00",
        "employees": "/api/v1/departments/A00/employees"
      }
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "pageSize": 20
  }
}

# Détails d'un département
GET /api/v1/departments/:id
Response: 200 OK
{
  "data": {
    "id": "A00",
    "name": "SPIFFY COMPUTER SERVICE DIV.",
    "managerId": "000010",
    "adminDept": "A00",
    "location": "NEW YORK",
    "employeeCount": 3,
    "totalSalaries": 90160.00,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}

# Créer un département
POST /api/v1/departments
Request:
{
  "id": "D01",
  "name": "Marketing",
  "managerId": "000020",
  "adminDept": "A00",
  "location": "Chicago"
}
Response: 201 Created
Location: /api/v1/departments/D01

# Modifier un département
PUT /api/v1/departments/:id
Request:
{
  "name": "Marketing & Sales",
  "location": "Chicago"
}
Response: 200 OK

# Supprimer un département
DELETE /api/v1/departments/:id
Response: 204 No Content
```

#### Employés

```yaml
# Liste des employés d'un département
GET /api/v1/departments/:deptId/employees
Query params: ?page=1&pageSize=20&sort=lastName&order=asc
Response: 200 OK
{
  "data": [
    {
      "id": "000010",
      "firstName": "CHRISTINE",
      "middleInitial": "I",
      "lastName": "HAAS",
      "fullName": "HAAS, CHRISTINE",
      "workDept": "A00",
      "phoneNo": "3978",
      "hireDate": "1965-01-01",
      "job": "PRES",
      "edLevel": 18,
      "sex": "F",
      "birthDate": null,
      "salary": 52750.00,
      "bonus": 1000.00,
      "commission": 4220.00,
      "netIncome": 57970.00,
      "_links": {
        "self": "/api/v1/employees/000010",
        "department": "/api/v1/departments/A00"
      }
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "pageSize": 20,
    "departmentName": "SPIFFY COMPUTER SERVICE DIV.",
    "totalSalaries": 90160.00
  }
}

# Tous les employés (avec filtres)
GET /api/v1/employees
Query params: ?search=christine&department=A00&minSalary=50000
Response: 200 OK

# Détails d'un employé
GET /api/v1/employees/:id
Response: 200 OK
{
  "data": {
    "id": "000010",
    "firstName": "CHRISTINE",
    "middleInitial": "I",
    "lastName": "HAAS",
    "workDept": "A00",
    "phoneNo": "3978",
    "hireDate": "1965-01-01",
    "job": "PRES",
    "edLevel": 18,
    "sex": "F",
    "birthDate": null,
    "salary": 52750.00,
    "bonus": 1000.00,
    "commission": 4220.00,
    "department": {
      "id": "A00",
      "name": "SPIFFY COMPUTER SERVICE DIV."
    }
  }
}

# Créer un employé
POST /api/v1/employees
Request:
{
  "firstName": "John",
  "middleInitial": "D",
  "lastName": "Doe",
  "workDept": "A00",
  "phoneNo": "1234",
  "job": "ANALYST",
  "salary": 45000.00
}
Response: 201 Created
Location: /api/v1/employees/000300

# Modifier un employé
PUT /api/v1/employees/:id
PATCH /api/v1/employees/:id  # Modification partielle
Response: 200 OK

# Supprimer un employé
DELETE /api/v1/employees/:id
Response: 204 No Content
```

#### Authentification

```yaml
# Login
POST /api/v1/auth/login
Request:
{
  "username": "user1",
  "password": "password123"
}
Response: 200 OK
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "expiresIn": 3600,
    "user": {
      "id": "user1",
      "name": "John Doe",
      "roles": ["user", "admin"]
    }
  }
}

# Refresh token
POST /api/v1/auth/refresh
Request:
{
  "refreshToken": "..."
}
Response: 200 OK

# Logout
POST /api/v1/auth/logout
Response: 204 No Content

# Profil utilisateur
GET /api/v1/auth/me
Response: 200 OK
```

#### Utilitaires

```yaml
# Générer des données de test
POST /api/v1/admin/seed/departments
Response: 201 Created

POST /api/v1/admin/seed/employees
Request:
{
  "count": 200,
  "nationality": "fr"
}
Response: 201 Created

# Statistiques
GET /api/v1/stats/summary
Response: 200 OK
{
  "data": {
    "totalDepartments": 5,
    "totalEmployees": 203,
    "averageSalary": 45230.50,
    "totalPayroll": 9181691.50
  }
}
```

### 4.3 Gestion des erreurs

**Format standard** :
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "salary",
        "message": "Salary must be a positive number"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/v1/employees",
    "requestId": "req-123456"
  }
}
```

**Codes d'erreur** :
- `400 Bad Request` : Données invalides
- `401 Unauthorized` : Non authentifié
- `403 Forbidden` : Non autorisé
- `404 Not Found` : Ressource introuvable
- `409 Conflict` : Conflit (ex: ID déjà existant)
- `422 Unprocessable Entity` : Validation métier échouée
- `500 Internal Server Error` : Erreur serveur
- `503 Service Unavailable` : Service temporairement indisponible

### 4.4 Sécurité

**Authentification** : JWT (JSON Web Tokens)
```javascript
// Token structure
{
  "sub": "user1",
  "name": "John Doe",
  "roles": ["user", "admin"],
  "iat": 1516239022,
  "exp": 1516242622
}
```

**Autorisation** : RBAC (Role-Based Access Control)
```javascript
// Rôles
const roles = {
  ADMIN: ['read', 'write', 'delete', 'admin'],
  MANAGER: ['read', 'write'],
  USER: ['read']
};

// Middleware
const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user.roles.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
```

**Protection** :
- **CORS** : Configuration stricte des origines autorisées
- **Rate limiting** : 100 requêtes/minute par IP
- **Helmet** : Headers de sécurité HTTP
- **Input validation** : Validation stricte avec express-validator
- **SQL injection** : Paramètres préparés (déjà en place dans RPG)
- **XSS** : Sanitization des entrées

### 4.5 Documentation API

**OpenAPI 3.0** (Swagger)
```yaml
openapi: 3.0.0
info:
  title: Company System API
  version: 1.0.0
  description: API REST pour la gestion des employés et départements
servers:
  - url: https://api.company.com/v1
    description: Production
  - url: https://api-dev.company.com/v1
    description: Development
paths:
  /departments:
    get:
      summary: Liste des départements
      tags: [Departments]
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DepartmentList'
```

**Outils** :
- **Swagger UI** : Interface interactive
- **Redoc** : Documentation élégante
- **Postman Collection** : Tests et exemples

---

## 5. Conception du frontend SPA

### 5.1 Architecture des composants

#### Structure des pages

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── UserMenu
│   ├── Sidebar (optionnel)
│   └── Footer
├── Routes
│   ├── DepartmentsPage
│   │   ├── DepartmentList
│   │   │   ├── DepartmentCard
│   │   │   └── DepartmentActions
│   │   └── DepartmentFilters
│   ├── EmployeesPage
│   │   ├── EmployeeList
│   │   │   ├── EmployeeCard
│   │   │   └── EmployeeActions
│   │   ├── EmployeeFilters
│   │   └── EmployeeStats
│   ├── NewEmployeePage
│   │   ├── EmployeeForm
│   │   │   ├── PersonalInfoSection
│   │   │   ├── JobInfoSection
│   │   │   └── SalaryInfoSection
│   │   └── FormActions
│   └── LoginPage
│       └── LoginForm
└── Shared Components
    ├── Button
    ├── Input
    ├── Select
    ├── Table
    ├── Modal
    ├── Toast
    └── Loading
```

### 5.2 Maquettes des écrans

#### Écran 1 : Liste des départements

```
┌─────────────────────────────────────────────────────────────┐
│ Company System                    [Search] 🔍  [User] ▼     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Departments                                [+ New Dept]     │
│  ─────────────────────────────────────────────────────────  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ID    Name                    Location    Employees   │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ A00   SPIFFY COMPUTER...      NEW YORK    3    [View]│  │
│  │       Total Salaries: $90,160.00                      │  │
│  │                                                [+Emp] │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ B01   PLANNING                ATLANTA     2    [View]│  │
│  │       Total Salaries: $65,500.00                      │  │
│  │                                                [+Emp] │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ ...                                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Showing 1-5 of 5                    [< Prev] [Next >]       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Fonctionnalités** :
- ✅ Liste paginée des départements
- ✅ Recherche en temps réel
- ✅ Affichage du total des salaires par département
- ✅ Actions : Voir employés, Ajouter employé
- ✅ Responsive design (mobile-friendly)

**Composants React** :
```tsx
// DepartmentsPage.tsx
export const DepartmentsPage: React.FC = () => {
  const { data, isLoading, error } = useDepartments();
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <PageLayout>
      <PageHeader
        title="Departments"
        action={<Button onClick={handleNewDept}>+ New Department</Button>}
      />
      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      <DepartmentList departments={data} />
      <Pagination {...paginationProps} />
    </PageLayout>
  );
};

// DepartmentCard.tsx
export const DepartmentCard: React.FC<{ dept: Department }> = ({ dept }) => {
  return (
    <Card>
      <CardHeader>
        <Badge>{dept.id}</Badge>
        <h3>{dept.name}</h3>
      </CardHeader>
      <CardBody>
        <InfoRow label="Location" value={dept.location} />
        <InfoRow label="Employees" value={dept.employeeCount} />
        <InfoRow 
          label="Total Salaries" 
          value={formatCurrency(dept.totalSalaries)} 
        />
      </CardBody>
      <CardActions>
        <Button variant="secondary" onClick={() => viewEmployees(dept.id)}>
          View Employees
        </Button>
        <Button variant="primary" onClick={() => addEmployee(dept.id)}>
          + Add Employee
        </Button>
      </CardActions>
    </Card>
  );
};
```

#### Écran 2 : Liste des employés

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Departments                        [User] ▼       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Employees - SPIFFY COMPUTER SERVICE DIV.                    │
│  Location: NEW YORK                                          │
│  Total Salaries: $90,160.00                                  │
│  ─────────────────────────────────────────────────────────  │
│                                                               │
│  [Search] 🔍  [Filter by Job ▼]  [Sort by ▼]  [+ New Emp]  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ID      Name              Job        Salary    Actions│  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 000010  HAAS, CHRISTINE   PRES       $52,750  [Edit] │  │
│  │         Phone: 3978                           [Delete]│  │
│  │         Hired: 1965-01-01                             │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 000020  THOMPSON, MICHAEL MANAGER    $41,250  [Edit] │  │
│  │         Phone: 3476                           [Delete]│  │
│  │         Hired: 1973-10-10                             │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ ...                                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Showing 1-3 of 3                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Fonctionnalités** :
- ✅ Liste des employés d'un département
- ✅ Informations du département en en-tête
- ✅ Recherche et filtres
- ✅ Tri par colonne
- ✅ Actions : Éditer, Supprimer
- ✅ Navigation retour vers départements

**Composants React** :
```tsx
// EmployeesPage.tsx
export const EmployeesPage: React.FC = () => {
  const { deptId } = useParams();
  const { data: dept } = useDepartment(deptId);
  const { data: employees, isLoading } = useEmployees(deptId);
  const [filters, setFilters] = useState<EmployeeFilters>({});

  return (
    <PageLayout>
      <BackButton to="/departments" />
      <DepartmentHeader department={dept} />
      <EmployeeFilters filters={filters} onChange={setFilters} />
      <EmployeeTable 
        employees={employees} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </PageLayout>
  );
};

// EmployeeTable.tsx
export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onEdit,
  onDelete
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead sortable>ID</TableHead>
          <TableHead sortable>Name</TableHead>
          <TableHead sortable>Job</TableHead>
          <TableHead sortable>Salary</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map(emp => (
          <EmployeeRow 
            key={emp.id}
            employee={emp}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
};
```

#### Écran 3 : Nouvel employé

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Employees                          [User] ▼       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  New Employee - Department A00                               │
│  ─────────────────────────────────────────────────────────  │
│                                                               │
│  Personal Information                                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Employee ID: 000300 (auto-generated)                  │  │
│  │                                                        │  │
│  │ First Name *                                          │  │
│  │ [_____________________]                               │  │
│  │                                                        │  │
│  │ Middle Initial *                                      │  │
│  │ [_]                                                   │  │
│  │                                                        │  │
│  │ Last Name *                                           │  │
│  │ [_____________________]                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Job Information                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Department: A00 - SPIFFY COMPUTER SERVICE DIV.        │  │
│  │                                                        │  │
│  │ Job Title *                                           │  │
│  │ [_____________________]                               │  │
│  │                                                        │  │
│  │ Phone Number *                                        │  │
│  │ [____]                                                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Compensation                                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Salary * ($)                                          │  │
│  │ [_____________________]                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  [Cancel]                                    [Create Employee]│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Fonctionnalités** :
- ✅ Formulaire structuré en sections
- ✅ Validation en temps réel
- ✅ Messages d'erreur clairs
- ✅ ID auto-généré
- ✅ Département pré-rempli
- ✅ Boutons d'action clairs

**Composants React** :
```tsx
// NewEmployeePage.tsx
export const NewEmployeePage: React.FC = () => {
  const { deptId } = useParams();
  const { data: dept } = useDepartment(deptId);
  const createEmployee = useCreateEmployee();
  
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      workDept: deptId,
    }
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      await createEmployee.mutateAsync(data);
      toast.success('Employee created successfully');
      navigate(`/departments/${deptId}/employees`);
    } catch (error) {
      toast.error('Failed to create employee');
    }
  };

  return (
    <PageLayout>
      <BackButton to={`/departments/${deptId}/employees`} />
      <PageHeader title={`New Employee - Department ${deptId}`} />
      
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <FormSection title="Personal Information">
          <FormField
            label="Employee ID"
            value={autoGeneratedId}
            disabled
            hint="Auto-generated"
          />
          <FormField
            label="First Name"
            {...form.register('firstName')}
            error={form.formState.errors.firstName}
            required
          />
          <FormField
            label="Middle Initial"
            {...form.register('middleInitial')}
            maxLength={1}
            required
          />
          <FormField
            label="Last Name"
            {...form.register('lastName')}
            error={form.formState.errors.lastName}
            required
          />
        </FormSection>

        <FormSection title="Job Information">
          <FormField
            label="Department"
            value={`${dept.id} - ${dept.name}`}
            disabled
          />
          <FormField
            label="Job Title"
            {...form.register('job')}
            error={form.formState.errors.job}
            required
          />
          <FormField
            label="Phone Number"
            {...form.register('phoneNo')}
            type="tel"
            maxLength={4}
            error={form.formState.errors.phoneNo}
            required
          />
        </FormSection>

        <FormSection title="Compensation">
          <FormField
            label="Salary"
            {...form.register('salary')}
            type="number"
            prefix="$"
            error={form.formState.errors.salary}
            required
          />
        </FormSection>

        <FormActions>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            loading={createEmployee.isLoading}
          >
            Create Employee
          </Button>
        </FormActions>
      </Form>
    </PageLayout>
  );
};
```

### 5.3 Design system

**Palette de couleurs** :
```css
:root {
  /* Primary */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-700: #1d4ed8;
  
  /* Neutral */
  --color-gray-50: #f9fafb;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;
  
  /* Semantic */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}
```

**Typographie** :
```css
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
}
```

**Espacement** :
```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
}
```

**Composants de base** :
- Utilisation de **shadcn/ui** pour les composants
- Personnalisation avec Tailwind CSS
- Accessibilité (WCAG 2.1 AA)

### 5.4 Gestion d'état

**Architecture** :
```
┌─────────────────────────────────────────┐
│         React Components                │
└────────────┬────────────────────────────┘
             │
    ┌────────▼────────┐
    │  React Query    │  ← Cache serveur
    │  (Server State) │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │    Zustand      │  ← État global
    │  (Client State) │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │   Local State   │  ← État composant
    │   (useState)    │
    └─────────────────┘
```

**React Query** : Gestion des données serveur
```tsx
// hooks/useDepartments.ts
export const useDepartments = (params?: DepartmentParams) => {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => api.departments.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateEmployeeDto) => api.employees.create(data),
    onSuccess: (_, variables) => {
      // Invalider le cache
      queryClient.invalidateQueries(['employees', variables.workDept]);
      queryClient.invalidateQueries(['departments', variables.workDept]);
    },
  });
};
```

**Zustand** : État global de l'application
```tsx
// store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: async (credentials) => {
    const { token, user } = await api.auth.login(credentials);
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
```

### 5.5 Responsive design

**Breakpoints** :
```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

**Adaptations** :
- **Mobile** : Navigation hamburger, cartes empilées
- **Tablet** : Grille 2 colonnes, sidebar collapsible
- **Desktop** : Grille 3+ colonnes, sidebar fixe

---

## 6. Adaptation de la couche RPG

### 6.1 Programmes wrapper

**Objectif** : Créer des programmes RPG qui acceptent et retournent du JSON pour faciliter l'intégration avec l'API Node.js.

#### DEPTAPI.SQLRPGLE

```rpgle
**free

ctl-opt nomain;

/include 'qrpgleref/yajl.rpgleinc'

// Get all departments
dcl-proc getDepartments export;
  dcl-pi *n varchar(32000);
    filters varchar(1000) const options(*nopass);
  end-pi;
  
  dcl-s jsonResponse varchar(32000);
  dcl-s yajl pointer;
  
  // Initialize YAJL
  yajl = yajl_genOpen();
  yajl_beginObj(yajl);
  yajl_addChar(yajl: 'data');
  yajl_beginArray(yajl);
  
  // Query departments
  exec sql declare deptCur cursor for
    select deptno, deptname, mgrno, admrdept, location,
           (select count(*) from employee where workdept = d.deptno) as empcount,
           (select coalesce(sum(salary + bonus + comm), 0) 
            from employee where workdept = d.deptno) as totalsalaries
    from department d
    order by deptno;
    
  exec sql open deptCur;
  
  dou (sqlstate <> '00000');
    exec sql fetch next from deptCur into
      :deptno, :deptname, :mgrno, :admrdept, :location,
      :empcount, :totalsalaries;
      
    if (sqlstate = '00000');
      yajl_beginObj(yajl);
      yajl_addChar(yajl: 'id': %trim(deptno));
      yajl_addChar(yajl: 'name': %trim(deptname));
      yajl_addChar(yajl: 'managerId': %trim(mgrno));
      yajl_addChar(yajl: 'adminDept': %trim(admrdept));
      yajl_addChar(yajl: 'location': %trim(location));
      yajl_addNum(yajl: 'employeeCount': empcount);
      yajl_addNum(yajl: 'totalSalaries': totalsalaries);
      yajl_endObj(yajl);
    endif;
  enddo;
  
  exec sql close deptCur;
  
  yajl_endArray(yajl);
  yajl_endObj(yajl);
  
  jsonResponse = yajl_getString(yajl);
  yajl_genClose(yajl);
  
  return jsonResponse;
end-proc;

// Get department by ID
dcl-proc getDepartmentById export;
  dcl-pi *n varchar(32000);
    deptId char(3) const;
  end-pi;
  
  dcl-s jsonResponse varchar(32000);
  dcl-s yajl pointer;
  dcl-ds dept likeds(department_t);
  
  exec sql
    select deptno, deptname, mgrno, admrdept, location,
           (select count(*) from employee where workdept = :deptId),
           (select coalesce(sum(salary + bonus + comm), 0) 
            from employee where workdept = :deptId)
    into :dept.id, :dept.name, :dept.managerId, :dept.adminDept,
         :dept.location, :dept.employeeCount, :dept.totalSalaries
    from department
    where deptno = :deptId;
    
  if (sqlstate <> '00000');
    return buildErrorJson('NOT_FOUND': 'Department not found');
  endif;
  
  yajl = yajl_genOpen();
  yajl_beginObj(yajl);
  yajl_addChar(yajl: 'data');
  yajl_beginObj(yajl);
  yajl_addChar(yajl: 'id': %trim(dept.id));
  yajl_addChar(yajl: 'name': %trim(dept.name));
  yajl_addChar(yajl: 'managerId': %trim(dept.managerId));
  yajl_addChar(yajl: 'adminDept': %trim(dept.adminDept));
  yajl_addChar(yajl: 'location': %trim(dept.location));
  yajl_addNum(yajl: 'employeeCount': dept.employeeCount);
  yajl_addNum(yajl: 'totalSalaries': dept.totalSalaries);
  yajl_endObj(yajl);
  yajl_endObj(yajl);
  
  jsonResponse = yajl_getString(yajl);
  yajl_genClose(yajl);
  
  return jsonResponse;
end-proc;

// Create department
dcl-proc createDepartment export;
  dcl-pi *n varchar(32000);
    jsonInput varchar(32000) const;
  end-pi;
  
  dcl-s jsonResponse varchar(32000);
  dcl-ds dept likeds(department_t);
  
  // Parse JSON input
  parseJsonToDept(jsonInput: dept);
  
  // Validate
  if (dept.id = '' or dept.name = '');
    return buildErrorJson('VALIDATION_ERROR': 'Required fields missing');
  endif;
  
  // Insert
  exec sql
    insert into department (deptno, deptname, mgrno, admrdept, location)
    values (:dept.id, :dept.name, :dept.managerId, 
            :dept.adminDept, :dept.location);
            
  if (sqlstate <> '00000');
    if (sqlcode = -803);
      return buildErrorJson('CONFLICT': 'Department already exists');
    else;
      return buildErrorJson('DATABASE_ERROR': 'Failed to create department');
    endif;
  endif;
  
  return buildSuccessJson('Department created successfully');
end-proc;
```

#### EMPAPI.SQLRPGLE

```rpgle
**free

ctl-opt nomain;

/include 'qrpgleref/yajl.rpgleinc'

// Get employees by department
dcl-proc getEmployeesByDept export;
  dcl-pi *n varchar(32000);
    deptId char(3) const;
    page int(10) const options(*nopass);
    pageSize int(10) const options(*nopass);
  end-pi;
  
  dcl-s jsonResponse varchar(32000);
  dcl-s yajl pointer;
  dcl-s currentPage int(10);
  dcl-s currentPageSize int(10);
  dcl-s offset int(10);
  dcl-s totalCount int(10);
  
  // Default pagination
  if (%parms() >= 2);
    currentPage = page;
  else;
    currentPage = 1;
  endif;
  
  if (%parms() >= 3);
    currentPageSize = pageSize;
  else;
    currentPageSize = 20;
  endif;
  
  offset = (currentPage - 1) * currentPageSize;
  
  // Get total count
  exec sql
    select count(*)
    into :totalCount
    from employee
    where workdept = :deptId;
  
  // Initialize JSON
  yajl = yajl_genOpen();
  yajl_beginObj(yajl);
  yajl_addChar(yajl: 'data');
  yajl_beginArray(yajl);
  
  // Query employees with pagination
  exec sql declare empCur cursor for
    select empno, firstnme, midinit, lastname, workdept,
           phoneno, hiredate, job, edlevel, sex, birthdate,
           salary, bonus, comm,
           (salary + coalesce(bonus, 0) + coalesce(comm, 0)) as netincome
    from employee
    where workdept = :deptId
    order by lastname, firstnme
    offset :offset rows
    fetch first :currentPageSize rows only;
    
  exec sql open empCur;
  
  dou (sqlstate <> '00000');
    exec sql fetch next from empCur into
      :empno, :firstnme, :midinit, :lastname, :workdept,
      :phoneno, :hiredate, :job, :edlevel, :sex, :birthdate,
      :salary, :bonus, :comm, :netincome;
      
    if (sqlstate = '00000');
      yajl_beginObj(yajl);
      yajl_addChar(yajl: 'id': %trim(empno));
      yajl_addChar(yajl: 'firstName': %trim(firstnme));
      yajl_addChar(yajl: 'middleInitial': midinit);
      yajl_addChar(yajl: 'lastName': %trim(lastname));
      yajl_addChar(yajl: 'fullName': 
        %trim(lastname) + ', ' + %trim(firstnme));
      yajl_addChar(yajl: 'workDept': %trim(workdept));
      yajl_addChar(yajl: 'phoneNo': %trim(phoneno));
      yajl_addChar(yajl: 'hireDate': %char(hiredate: *iso));
      yajl_addChar(yajl: 'job': %trim(job));
      yajl_addNum(yajl: 'edLevel': edlevel);
      yajl_addChar(yajl: 'sex': sex);
      if (birthdate <> *loval);
        yajl_addChar(yajl: 'birthDate': %char(birthdate: *iso));
      else;
        yajl_addNull(yajl: 'birthDate');
      endif;
      yajl_addNum(yajl: 'salary': salary);
      yajl_addNum(yajl: 'bonus': bonus);
      yajl_addNum(yajl: 'commission': comm);
      yajl_addNum(yajl: 'netIncome': netincome);
      yajl_endObj(yajl);
    endif;
  enddo;
  
  exec sql close empCur;
  
  yajl_endArray(yajl);
  
  // Add metadata
  yajl_addChar(yajl: 'meta');
  yajl_beginObj(yajl);
  yajl_addNum(yajl: 'total': totalCount);
  yajl_addNum(yajl: 'page': currentPage);
  yajl_addNum(yajl: 'pageSize': currentPageSize);
  yajl_endObj(yajl);
  
  yajl_endObj(yajl);
  
  jsonResponse = yajl_getString(yajl);
  yajl_genClose(yajl);
  
  return jsonResponse;
end-proc;

// Create employee
dcl-proc createEmployee export;
  dcl-pi *n varchar(32000);
    jsonInput varchar(32000) const;
  end-pi;
  
  dcl-s jsonResponse varchar(32000);
  dcl-ds emp likeds(employee_t);
  dcl-s newEmpId char(6);
  
  // Parse JSON input
  parseJsonToEmployee(jsonInput: emp);
  
  // Validate
  if (emp.firstName = '' or emp.lastName = '' or emp.workDept = '');
    return buildErrorJson('VALIDATION_ERROR': 'Required fields missing');
  endif;
  
  // Validate salary is positive
  if (emp.salary <= 0);
    return buildErrorJson('VALIDATION_ERROR': 'Salary must be positive');
  endif;
  
  // Validate phone number
  monitor;
    if (%int(emp.phoneNo) < 0 or %int(emp.phoneNo) > 9998);
      return buildErrorJson('VALIDATION_ERROR': 
        'Phone number must be between 0000 and 9998');
    endif;
  on-error;
    return buildErrorJson('VALIDATION_ERROR': 
      'Phone number must be numeric');
  endmon;
  
  // Generate new employee ID
  exec sql
    select max(int(empno)) + 100
    into :newEmpId
    from employee;
    
  if (sqlstate <> '00000');
    return buildErrorJson('DATABASE_ERROR': 
      'Failed to generate employee ID');
  endif;
  
  emp.id = %editc(newEmpId: 'X');
  emp.hireDate = %date();
  emp.birthDate = %date(); // Default
  emp.edLevel = 0;
  emp.bonus = 0;
  emp.commission = 0;
  
  // Insert
  exec sql
    insert into employee (
      empno, firstnme, midinit, lastname, workdept,
      phoneno, hiredate, job, edlevel, sex, birthdate,
      salary, bonus, comm
    ) values (
      :emp.id, :emp.firstName, :emp.middleInitial, :emp.lastName,
      :emp.workDept, :emp.phoneNo, :emp.hireDate, :emp.job,
      :emp.edLevel, :emp.sex, :emp.birthDate, :emp.salary,
      :emp.bonus, :emp.commission
    );
    
  if (sqlstate <> '00000');
    return buildErrorJson('DATABASE_ERROR': 'Failed to create employee');
  endif;
  
  // Return created employee
  return getEmployeeById(emp.id);
end-proc;
```

### 6.2 Intégration avec Node.js

**Utilisation d'itoolkit** :

```javascript
// services/rpgService.js
const { Connection, ProgramCall } = require('itoolkit');

class RPGService {
  constructor() {
    this.connection = new Connection({
      transport: 'ssh',
      transportOptions: {
        host: process.env.IBM_I_HOST,
        username: process.env.IBM_I_USER,
        password: process.env.IBM_I_PASSWORD,
      }
    });
  }

  async callProgram(library, program, params) {
    const pgm = new ProgramCall(program, { lib: library });
    
    params.forEach(param => {
      pgm.addParam(param);
    });

    return new Promise((resolve, reject) => {
      this.connection.add(pgm);
      this.connection.run((error, xmlOutput) => {
        if (error) {
          reject(error);
        } else {
          resolve(xmlOutput);
        }
      });
    });
  }

  async getDepartments() {
    const result = await this.callProgram('CMPSYS', 'DEPTAPI', [
      { type: 'varchar', name: 'result', io: 'out', size: 32000 }
    ]);
    
    return JSON.parse(result.result);
  }

  async getDepartmentById(deptId) {
    const result = await this.callProgram('CMPSYS', 'DEPTAPI', [
      { type: 'char', name: 'deptId', io: 'in', value: deptId, size: 3 },
      { type: 'varchar', name: 'result', io: 'out', size: 32000 }
    ]);
    
    return JSON.parse(result.result);
  }

  async getEmployeesByDept(deptId, page = 1, pageSize = 20) {
    const result = await this.callProgram('CMPSYS', 'EMPAPI', [
      { type: 'char', name: 'deptId', io: 'in', value: deptId, size: 3 },
      { type: 'int', name: 'page', io: 'in', value: page },
      { type: 'int', name: 'pageSize', io: 'in', value: pageSize },
      { type: 'varchar', name: 'result', io: 'out', size: 32000 }
    ]);
    
    return JSON.parse(result.result);
  }

  async createEmployee(employeeData) {
    const jsonInput = JSON.stringify(employeeData);
    
    const result = await this.callProgram('CMPSYS', 'EMPAPI', [
      { type: 'varchar', name: 'jsonInput', io: 'in', value: jsonInput, size: 32000 },
      { type: 'varchar', name: 'result', io: 'out', size: 32000 }
    ]);
    
    return JSON.parse(result.result);
  }
}

module.exports = new RPGService();
```

**Alternative : Utilisation d'ODBC direct** :

```javascript
// services/dbService.js
const odbc = require('odbc');

class DBService {
  constructor() {
    this.connectionString = `DRIVER={IBM i Access ODBC Driver};` +
      `SYSTEM=${process.env.IBM_I_HOST};` +
      `UID=${process.env.IBM_I_USER};` +
      `PWD=${process.env.IBM_I_PASSWORD};` +
      `DBQ=CMPSYS`;
  }

  async query(sql, params = []) {
    const connection = await odbc.connect(this.connectionString);
    try {
      const result = await connection.query(sql, params);
      return result;
    } finally {
      await connection.close();
    }
  }

  async getDepartments() {
    const sql = `
      SELECT 
        d.DEPTNO as id,
        d.DEPTNAME as name,
        d.MGRNO as managerId,
        d.ADMRDEPT as adminDept,
        d.LOCATION as location,
        COUNT(e.EMPNO) as employeeCount,
        COALESCE(SUM(e.SALARY + e.BONUS + e.COMM), 0) as totalSalaries
      FROM DEPARTMENT d
      LEFT JOIN EMPLOYEE e ON e.WORKDEPT = d.DEPTNO
      GROUP BY d.DEPTNO, d.DEPTNAME, d.MGRNO, d.ADMRDEPT, d.LOCATION
      ORDER BY d.DEPTNO
    `;
    
    return await this.query(sql);
  }

  async getEmployeesByDept(deptId, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    
    const sql = `
      SELECT 
        EMPNO as id,
        FIRSTNME as firstName,
        MIDINIT as middleInitial,
        LASTNAME as lastName,
        TRIM(LASTNAME) || ', ' || TRIM(FIRSTNME) as fullName,
        WORKDEPT as workDept,
        PHONENO as phoneNo,
        HIREDATE as hireDate,
        JOB as job,
        EDLEVEL as edLevel,
        SEX as sex,
        BIRTHDATE as birthDate,
        SALARY as salary,
        BONUS as bonus,
        COMM as commission,
        (SALARY + COALESCE(BONUS, 0) + COALESCE(COMM, 0)) as netIncome
      FROM EMPLOYEE
      WHERE WORKDEPT = ?
      ORDER BY LASTNAME, FIRSTNME
      OFFSET ? ROWS
      FETCH FIRST ? ROWS ONLY
    `;
    
    const employees = await this.query(sql, [deptId, offset, pageSize]);
    
    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM EMPLOYEE WHERE WORKDEPT = ?`;
    const [{ total }] = await this.query(countSql, [deptId]);
    
    return {
      data: employees,
      meta: {
        total,
        page,
        pageSize
      }
    };
  }
}

module.exports = new DBService();
```

### 6.3 Choix de l'approche

**Recommandation** : Approche hybride

| Approche | Avantages | Inconvénients | Usage recommandé |
|----------|-----------|---------------|------------------|
| **RPG Wrappers + itoolkit** | - Réutilise la logique RPG existante<br>- Validation métier centralisée<br>- Cohérence avec l'existant | - Performance légèrement inférieure<br>- Complexité supplémentaire<br>- Dépendance à itoolkit | - Opérations complexes<br>- Logique métier importante<br>- Réutilisation de code existant |
| **ODBC Direct** | - Performance optimale<br>- Simplicité<br>- Pas de dépendance RPG | - Duplication de la logique<br>- Validation en Node.js<br>- Maintenance double | - Lectures simples<br>- Requêtes de reporting<br>- Opérations en masse |

**Stratégie recommandée** :
1. **Lectures** : ODBC direct pour performance
2. **Écritures** : RPG wrappers pour validation et logique métier
3. **Opérations complexes** : RPG wrappers

---

## 7. Plan d'implémentation

### 7.1 Roadmap détaillée

#### Sprint 0 : Préparation (2 semaines)

**Objectifs** :
- Setup de l'environnement de développement
- Configuration des outils
- Formation de l'équipe

**Tâches** :
- [ ] Installer Node.js, npm, Git sur les postes de développement
- [ ] Configurer les accès IBM i (SSH, ODBC)
- [ ] Créer les repositories Git (frontend, backend)
- [ ] Setup CI/CD pipeline (GitHub Actions ou GitLab CI)
- [ ] Créer les environnements (dev, test, prod)
- [ ] Former l'équipe aux technologies (React, Node.js, TypeScript)
- [ ] Définir les standards de code (ESLint, Prettier)
- [ ] Créer la documentation de développement

**Livrables** :
- Environnements configurés
- Repositories Git créés
- Pipeline CI/CD fonctionnel
- Documentation de setup

#### Sprint 1-2 : API Foundation (4 semaines)

**Objectifs** :
- Créer l'infrastructure API
- Implémenter les endpoints de base
- Mettre en place l'authentification

**Tâches Backend** :
- [ ] Initialiser le projet Node.js/Express
- [ ] Configurer TypeScript
- [ ] Setup de la structure de projet
- [ ] Implémenter la connexion ODBC/itoolkit
- [ ] Créer les modèles de données (TypeScript interfaces)
- [ ] Implémenter GET /api/v1/departments
- [ ] Implémenter GET /api/v1/departments/:id
- [ ] Implémenter GET /api/v1/departments/:id/employees
- [ ] Implémenter l'authentification JWT
- [ ] Créer les middleware (auth, error handling, logging)
- [ ] Setup de la documentation OpenAPI
- [ ] Écrire les tests unitaires (Jest)
- [ ] Écrire les tests d'intégration

**Tâches RPG** :
- [ ] Installer YAJL (JSON library pour RPG)
- [ ] Créer DEPTAPI.SQLRPGLE (wrapper départements)
- [ ] Créer EMPAPI.SQLRPGLE (wrapper employés - lecture)
- [ ] Écrire les tests RPGUnit

**Livrables** :
- API fonctionnelle avec endpoints de lecture
- Documentation OpenAPI
- Tests automatisés (couverture > 80%)
- Authentification JWT opérationnelle

#### Sprint 3-4 : Frontend Foundation (4 semaines)

**Objectifs** :
- Créer l'application React
- Implémenter les premiers écrans
- Intégrer avec l'API

**Tâches Frontend** :
- [ ] Initialiser le projet React avec Vite
- [ ] Configurer TypeScript
- [ ] Setup Tailwind CSS et shadcn/ui
- [ ] Créer la structure de projet (features-based)
- [ ] Implémenter le routing (React Router)
- [ ] Créer les composants de base (Button, Input, Card, etc.)
- [ ] Implémenter le layout (Header, Footer, Navigation)
- [ ] Créer la page de login
- [ ] Implémenter l'authentification (JWT storage, refresh)
- [ ] Créer la page liste des départements
- [ ] Intégrer React Query pour le data fetching
- [ ] Implémenter le state management (Zustand)
- [ ] Créer les tests unitaires (Vitest)
- [ ] Créer les tests E2E (Playwright)

**Livrables** :
- Application React fonctionnelle
- Page de login opérationnelle
- Page liste des départements avec données réelles
- Tests automatisés

#### Sprint 5-6 : CRUD Complet (4 semaines)

**Objectifs** :
- Implémenter toutes les opérations CRUD
- Compléter tous les écrans
- Finaliser l'intégration

**Tâches Backend** :
- [ ] Implémenter POST /api/v1/departments
- [ ] Implémenter PUT /api/v1/departments/:id
- [ ] Implémenter DELETE /api/v1/departments/:id
- [ ] Implémenter POST /api/v1/employees
- [ ] Implémenter PUT /api/v1/employees/:id
- [ ] Implémenter DELETE /api/v1/employees/:id
- [ ] Implémenter la pagination
- [ ] Implémenter les filtres et la recherche
- [ ] Implémenter le tri
- [ ] Ajouter la validation des données (express-validator)
- [ ] Améliorer la gestion d'erreurs
- [ ] Optimiser les performances (cache Redis)

**Tâches RPG** :
- [ ] Compléter DEPTAPI avec create/update/delete
- [ ] Compléter EMPAPI avec create/update/delete
- [ ] Créer NEWEMPAPI.SQLRPGLE (création employé)
- [ ] Améliorer la validation
- [ ] Améliorer la gestion d'erreurs

**Tâches Frontend** :
- [ ] Créer la page liste des employés
- [ ] Créer la page création d'employé
- [ ] Créer les modals d'édition
- [ ] Créer les modals de confirmation de suppression
- [ ] Implémenter la recherche en temps réel
- [ ] Implémenter les filtres
- [ ] Implémenter le tri des colonnes
- [ ] Implémenter la pagination
- [ ] Améliorer l'UX (loading states, error states)
- [ ] Ajouter les toasts de notification
- [ ] Optimiser les performances (lazy loading, memoization)

**Livrables** :
- API REST complète avec tous les endpoints
- Application web complète avec toutes les fonctionnalités
- Parité fonctionnelle avec les écrans 5250
- Tests complets

#### Sprint 7 : Optimisation & Polish (2 semaines)

**Objectifs** :
- Optimiser les performances
- Améliorer l'UX
- Corriger les bugs

**Tâches** :
- [ ] Optimisation des requêtes SQL
- [ ] Mise en place du cache (Redis)
- [ ] Optimisation du bundle frontend (code splitting)
- [ ] Amélioration de l'accessibilité (WCAG 2.1 AA)
- [ ] Amélioration du responsive design
- [ ] Ajout d'animations et transitions
- [ ] Correction des bugs identifiés
- [ ] Amélioration de la documentation
- [ ] Tests de charge et de performance
- [ ] Optimisation des images et assets

**Livrables** :
- Application optimisée (< 2s de temps de réponse)
- Score Lighthouse > 90
- Accessibilité WCAG 2.1 AA
- Documentation complète

#### Sprint 8 : Migration & Déploiement (2 semaines)

**Objectifs** :
- Déployer en production
- Former les utilisateurs
- Migrer progressivement

**Tâches** :
- [ ] Déploiement en environnement de test
- [ ] Tests d'acceptation utilisateur (UAT)
- [ ] Formation des utilisateurs
- [ ] Création de la documentation utilisateur
- [ ] Déploiement en production
- [ ] Migration progressive par groupe d'utilisateurs
- [ ] Monitoring et support
- [ ] Collecte de feedback
- [ ] Ajustements basés sur le feedback
- [ ] Décommissionnement des écrans 5250

**Livrables** :
- Application en production
- Utilisateurs formés
- Documentation utilisateur
- Support opérationnel en place

### 7.2 Équipe et rôles

**Équipe recommandée** :

| Rôle | Nombre | Responsabilités |
|------|--------|-----------------|
| **Tech Lead** | 1 | Architecture, décisions techniques, revue de code |
| **Développeur Backend** | 2 | API Node.js, intégration IBM i, tests |
| **Développeur Frontend** | 2 | Application React, UX/UI, tests |
| **Développeur RPG** | 1 | Wrappers RPG, adaptation code existant |
| **DevOps** | 1 | CI/CD, déploiement, monitoring |
| **QA** | 1 | Tests, validation, qualité |
| **UX Designer** | 0.5 | Design, maquettes, prototypes |
| **Product Owner** | 1 | Priorisation, validation, coordination |

**Total** : 9.5 personnes

### 7.3 Estimation budgétaire

**Coûts de développement** :

| Poste | Durée | Coût unitaire | Total |
|-------|-------|---------------|-------|
| Tech Lead | 5 mois | 10 000€/mois | 50 000€ |
| Développeurs (5) | 5 mois | 7 000€/mois | 175 000€ |
| DevOps | 5 mois | 8 000€/mois | 40 000€ |
| QA | 5 mois | 6 000€/mois | 30 000€ |
| UX Designer | 2.5 mois | 7 000€/mois | 17 500€ |
| Product Owner | 5 mois | 8 000€/mois | 40 000€ |
| **Sous-total développement** | | | **352 500€** |

**Coûts d'infrastructure** :

| Élément | Coût mensuel | Durée | Total |
|---------|--------------|-------|-------|
| Serveurs (dev, test, prod) | 500€ | 12 mois | 6 000€ |
| Licences et outils | 200€ | 12 mois | 2 400€ |
| Formation | - | - | 10 000€ |
| **Sous-total infrastructure** | | | **18 400€** |

**Coûts de migration** :

| Élément | Coût |
|---------|------|
| Support utilisateurs | 15 000€ |
| Documentation | 10 000€ |
| Contingence (10%) | 39 590€ |
| **Sous-total migration** | **64 590€** |

**Total estimé** : **435 490€**

### 7.4 Planning Gantt

```
Mois 1-2: Préparation & API Foundation
├─ Sprint 0: Préparation (2 sem)
└─ Sprint 1-2: API Foundation (4 sem)

Mois 3-4: Frontend Foundation & CRUD
├─ Sprint 3-4: Frontend Foundation (4 sem)
└─ Sprint 5-6: CRUD Complet (début)

Mois 5: CRUD Complet & Optimisation
├─ Sprint 5-6: CRUD Complet (fin)
└─ Sprint 7: Optimisation (2 sem)

Mois 6: Migration & Déploiement
└─ Sprint 8: Migration & Déploiement (2 sem)
```

---

## 8. Gestion des risques

### 8.1 Identification des risques

| ID | Risque | Probabilité | Impact | Criticité |
|----|--------|-------------|--------|-----------|
| R1 | Problèmes de performance de l'API | Moyenne | Élevé | **Élevée** |
| R2 | Résistance au changement des utilisateurs | Élevée | Moyen | **Élevée** |
| R3 | Bugs dans la migration des données | Faible | Élevé | **Moyenne** |
| R4 | Dépassement du budget | Moyenne | Élevé | **Élevée** |
| R5 | Retard dans le planning | Moyenne | Moyen | **Moyenne** |
| R6 | Problèmes de compatibilité navigateurs | Faible | Faible | **Faible** |
| R7 | Perte de fonctionnalités | Faible | Élevé | **Moyenne** |
| R8 | Problèmes de sécurité | Faible | Très élevé | **Élevée** |
| R9 | Manque de compétences techniques | Moyenne | Élevé | **Élevée** |
| R10 | Indisponibilité du système IBM i | Faible | Très élevé | **Moyenne** |

### 8.2 Plans de mitigation

#### R1 : Problèmes de performance de l'API

**Mitigation** :
- Implémenter un cache Redis dès le début
- Optimiser les requêtes SQL (index, requêtes préparées)
- Utiliser la pagination systématiquement
- Mettre en place du monitoring (New Relic, Datadog)
- Tests de charge réguliers (Apache JMeter)

**Plan de contingence** :
- Augmenter les ressources serveur
- Implémenter un load balancer
- Optimiser le code critique

#### R2 : Résistance au changement des utilisateurs

**Mitigation** :
- Impliquer les utilisateurs dès le début (UAT)
- Formation progressive et accompagnement
- Communication régulière sur les bénéfices
- Interface similaire aux écrans 5250 (transition douce)
- Support dédié pendant la migration

**Plan de contingence** :
- Maintenir les écrans 5250 en parallèle temporairement
- Créer des guides vidéo et tutoriels
- Support one-on-one pour les utilisateurs réticents

#### R3 : Bugs dans la migration des données

**Mitigation** :
- Tests exhaustifs en environnement de test
- Migration progressive par groupe
- Validation des données avant/après migration
- Backup automatique avant chaque migration

**Plan de contingence** :
- Procédure de rollback documentée et testée
- Scripts de correction de données
- Support technique disponible 24/7 pendant la migration

#### R4 : Dépassement du budget

**Mitigation** :
- Suivi hebdomadaire du budget
- Priorisation stricte des fonctionnalités (MoSCoW)
- Revues de sprint régulières
- Contingence de 10% incluse

**Plan de contingence** :
- Réduire le périmètre (fonctionnalités nice-to-have)
- Étaler le déploiement
- Négocier des ressources supplémentaires

#### R5 : Retard dans le planning

**Mitigation** :
- Planning réaliste avec buffers
- Suivi quotidien (daily standups)
- Identification précoce des blocages
- Priorisation agile

**Plan de contingence** :
- Augmenter temporairement l'équipe
- Réduire le périmètre
- Overtime ciblé sur les tâches critiques

#### R8 : Problèmes de sécurité

**Mitigation** :
- Audit de sécurité dès le début
- Tests de pénétration réguliers
- Revue de code axée sécurité
- Formation sécurité de l'équipe
- Utilisation de bibliothèques sécurisées et à jour

**Plan de contingence** :
- Équipe de réponse aux incidents
- Procédure de patch d'urgence
- Communication de crise préparée

#### R9 : Manque de compétences techniques

**Mitigation** :
- Formation de l'équipe avant le projet
- Pair programming
- Revues de code systématiques
- Documentation technique détaillée
- Mentoring par le Tech Lead

**Plan de contingence** :
- Recrutement de consultants externes
- Formation intensive
- Réaffectation des ressources

### 8.3 Monitoring des risques

**Indicateurs de suivi** :
- Vélocité des sprints
- Taux de bugs en production
- Temps de réponse de l'API
- Satisfaction utilisateurs (NPS)
- Couverture de tests
- Dette technique

**Revues** :
- Hebdomadaire : Revue des risques actifs
- Mensuelle : Revue complète de tous les risques
- Ad-hoc : En cas de nouveau risque identifié

---

## 9. Métriques de succès

### 9.1 KPIs techniques

| Métrique | Cible | Mesure |
|----------|-------|--------|
| **Performance** | | |
| Temps de réponse API (p95) | < 500ms | New Relic |
| Temps de chargement page (p95) | < 2s | Lighthouse |
| Disponibilité | > 99.5% | Uptime monitoring |
| **Qualité** | | |
| Couverture de tests | > 80% | Jest/Vitest |
| Score Lighthouse | > 90 | Lighthouse CI |
| Bugs critiques en production | < 5/mois | Jira |
| Temps de résolution bugs critiques | < 24h | Jira |
| **Sécurité** | | |
| Vulnérabilités critiques | 0 | Snyk/OWASP |
| Temps de patch vulnérabilités | < 48h | Process |

### 9.2 KPIs métier

| Métrique | Cible | Mesure |
|----------|-------|--------|
| **Adoption** | | |
| Taux d'adoption | > 90% en 3 mois | Analytics |
| Utilisateurs actifs quotidiens | 100% des utilisateurs | Analytics |
| Taux d'abandon 5250 | 100% en 6 mois | Monitoring |
| **Satisfaction** | | |
| NPS (Net Promoter Score) | > 50 | Enquête |
| Satisfaction utilisateur | > 4/5 | Enquête |
| Taux de tickets support | < 10/mois | Support |
| **Productivité** | | |
| Temps de création employé | -30% vs 5250 | Mesure |
| Temps de recherche | -50% vs 5250 | Mesure |
| Erreurs de saisie | -40% vs 5250 | Logs |

### 9.3 Critères de succès par phase

#### Phase 1 : API Foundation (Sprints 1-2)

✅ **Succès si** :
- API fonctionnelle avec endpoints de lecture
- Documentation OpenAPI complète
- Tests automatisés > 80% de couverture
- Temps de réponse < 500ms
- Authentification JWT opérationnelle

#### Phase 2 : Frontend Foundation (Sprints 3-4)

✅ **Succès si** :
- Application React déployée
- Page de login fonctionnelle
- Page liste départements avec données réelles
- Score Lighthouse > 80
- Tests E2E passants

#### Phase 3 : CRUD Complet (Sprints 5-6)

✅ **Succès si** :
- Toutes les fonctionnalités 5250 disponibles en web
- Parité fonctionnelle complète
- Validation utilisateur positive (UAT)
- Performance satisfaisante
- Bugs critiques = 0

#### Phase 4 : Production (Sprints 7-8)

✅ **Succès si** :
- 90% des utilisateurs migrés
- Satisfaction > 4/5
- Disponibilité > 99.5%
- Temps de réponse < 2s
- Support < 10 tickets/mois

### 9.4 Tableau de bord

**Dashboard temps réel** :

```
┌─────────────────────────────────────────────────────────┐
│  Company System - Modernization Dashboard              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Performance                                            │
│  ├─ API Response Time (p95): 320ms ✅                  │
│  ├─ Page Load Time (p95): 1.8s ✅                      │
│  └─ Uptime: 99.8% ✅                                    │
│                                                         │
│  Quality                                                │
│  ├─ Test Coverage: 85% ✅                              │
│  ├─ Lighthouse Score: 92 ✅                            │
│  └─ Critical Bugs: 2 ⚠️                                │
│                                                         │
│  Adoption                                               │
│  ├─ Users Migrated: 75/100 (75%) 🔄                   │
│  ├─ Daily Active Users: 68 (91%) ✅                    │
│  └─ NPS: 55 ✅                                          │
│                                                         │
│  Sprint Progress                                        │
│  ├─ Current Sprint: 7/8                                │
│  ├─ Velocity: 42 points ✅                             │
│  └─ On Track: Yes ✅                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Conclusion et recommandations

### 10.1 Synthèse

Ce plan de modernisation propose une approche **progressive et pragmatique** pour transformer l'application Company System d'une interface 5250 traditionnelle vers une architecture moderne SPA avec API REST/JSON.

**Points clés** :
- ✅ **Conservation de la logique métier RPG** : Pas de réécriture complète
- ✅ **Migration progressive** : Strangler Fig Pattern pour minimiser les risques
- ✅ **Technologies modernes** : React, Node.js, TypeScript
- ✅ **Approche hybride** : RPG wrappers + ODBC selon les besoins
- ✅ **Focus sur l'UX** : Interface moderne et intuitive
- ✅ **Qualité** : Tests automatisés, CI/CD, monitoring

### 10.2 Recommandations stratégiques

#### 1. Commencer petit, penser grand

**Recommandation** : Démarrer avec un MVP (Minimum Viable Product) sur un seul écran, puis étendre progressivement.

**Approche** :
- Phase 1 : Liste des départements uniquement
- Phase 2 : Ajouter liste des employés
- Phase 3 : Ajouter création d'employé
- Phase 4 : Fonctionnalités avancées

**Avantages** :
- Feedback utilisateur précoce
- Ajustements rapides
- Risques réduits
- ROI plus rapide

#### 2. Investir dans la formation

**Recommandation** : Former l'équipe avant et pendant le projet.

**Plan de formation** :
- **Semaine 1-2** : React, TypeScript, Node.js
- **Semaine 3-4** : Architecture API REST, sécurité
- **Continu** : Pair programming, revues de code

**Budget** : 10 000€ (inclus dans l'estimation)

#### 3. Automatiser dès le début

**Recommandation** : Mettre en place CI/CD et tests automatisés dès le Sprint 1.

**Outils** :
- **CI/CD** : GitHub Actions ou GitLab CI
- **Tests** : Jest, Vitest, Playwright
- **Qualité** : SonarQube, ESLint
- **Monitoring** : New Relic, Datadog

#### 4. Impliquer les utilisateurs

**Recommandation** : Créer un groupe d'utilisateurs pilotes pour feedback continu.

**Activités** :
- Démonstrations bi-hebdomadaires
- Sessions de feedback
- Tests d'acceptation utilisateur (UAT)
- Beta testing

#### 5. Documenter tout

**Recommandation** : Maintenir une documentation à jour tout au long du projet.

**Documentation** :
- Architecture (ADR - Architecture Decision Records)
- API (OpenAPI/Swagger)
- Code (JSDoc, commentaires)
- Utilisateur (guides, tutoriels)
- Opérationnelle (runbooks)

### 10.3 Prochaines étapes

**Immédiat (Semaine 1-2)** :
1. ✅ Valider ce plan avec les stakeholders
2. ✅ Obtenir l'approbation budgétaire
3. ✅ Constituer l'équipe
4. ✅ Préparer les environnements

**Court terme (Mois 1)** :
1. ✅ Lancer le Sprint 0 (Préparation)
2. ✅ Former l'équipe
3. ✅ Configurer les outils
4. ✅ Démarrer le Sprint 1 (API Foundation)

**Moyen terme (Mois 2-5)** :
1. ✅ Développer l'API et le frontend
2. ✅ Tests et validation continue
3. ✅ Ajustements basés sur le feedback

**Long terme (Mois 6+)** :
1. ✅ Déploiement en production
2. ✅ Migration des utilisateurs
3. ✅ Support et maintenance
4. ✅ Évolutions futures

### 10.4 Facteurs de succès

**Critiques** :
- 🎯 **Sponsorship exécutif** : Support de la direction
- 👥 **Équipe compétente** : Développeurs expérimentés
- 📊 **Suivi rigoureux** : Métriques et KPIs
- 🔄 **Agilité** : Adaptation rapide aux changements
- 💬 **Communication** : Transparence et collaboration

**Importants** :
- 🛠️ **Outils adaptés** : Technologies modernes et éprouvées
- 📚 **Documentation** : Complète et à jour
- 🧪 **Tests** : Automatisés et exhaustifs
- 🔒 **Sécurité** : Intégrée dès le début
- 📈 **Monitoring** : Visibilité en temps réel

### 10.5 Vision à long terme

**Au-delà de la modernisation** :

Une fois la migration réussie, l'application sera positionnée pour :

1. **Évolutions fonctionnelles** :
   - Reporting avancé et analytics
   - Intégration avec d'autres systèmes
   - Workflows automatisés
   - Notifications en temps réel

2. **Évolutions techniques** :
   - Architecture microservices
   - Scalabilité horizontale
   - Multi-tenant
   - API publique pour partenaires

3. **Évolutions UX** :
   - Application mobile native
   - Progressive Web App (PWA)
   - Personnalisation avancée
   - Accessibilité améliorée

4. **Innovation** :
   - Intelligence artificielle (suggestions, prédictions)
   - Automatisation (RPA)
   - Analytics prédictifs
   - Chatbot d'assistance

---

## Annexes

### A. Glossaire technique

| Terme | Définition |
|-------|------------|
| **SPA** | Single Page Application - Application web qui charge une seule page HTML et met à jour dynamiquement le contenu |
| **REST** | Representational State Transfer - Style d'architecture pour les API web |
| **JWT** | JSON Web Token - Standard pour créer des tokens d'accès |
| **CORS** | Cross-Origin Resource Sharing - Mécanisme de sécurité pour les requêtes cross-domain |
| **ODBC** | Open Database Connectivity - Standard d'accès aux bases de données |
| **itoolkit** | Bibliothèque Node.js pour appeler des programmes IBM i |
| **YAJL** | Yet Another JSON Library - Bibliothèque JSON pour RPG |
| **CI/CD** | Continuous Integration/Continuous Deployment - Automatisation du build et déploiement |
| **UAT** | User Acceptance Testing - Tests d'acceptation utilisateur |
| **NPS** | Net Promoter Score - Métrique de satisfaction client |

### B. Ressources et références

**Documentation** :
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [itoolkit Documentation](https://github.com/IBM/nodejs-itoolkit)

**Outils** :
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Query](https://tanstack.com/query/)
- [Zustand](https://github.com/pmndrs/zustand)

**Communautés** :
- [IBM i OSS Community](https://ibmi-oss-docs.readthedocs.io/)
- [RPG Café](https://www.rpgpgm.com/)
- [React Community](https://react.dev/community)

### C. Templates et exemples

**Structure de projet Backend** :
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── auth.ts
│   │   └── env.ts
│   ├── routes/
│   │   ├── departments.ts
│   │   ├── employees.ts
│   │   └── auth.ts
│   ├── controllers/
│   │   ├── departmentController.ts
│   │   ├── employeeController.ts
│   │   └── authController.ts
│   ├── services/
│   │   ├── rpgService.ts
│   │   ├── dbService.ts
│   │   └── authService.ts
│   ├── models/
│   │   ├── Department.ts
│   │   └── Employee.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validator.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── helpers.ts
│   └── app.ts
├── tests/
├── package.json
└── tsconfig.json
```

**Structure de projet Frontend** :
```
frontend/
├── src/
│   ├── features/
│   │   ├── departments/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── employees/
│   │   └── auth/
│   ├── shared/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   ├── api/
│   ├── store/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── tests/
├── package.json
└── tsconfig.json
```

---

**Document créé le** : 2025-12-16  
**Version** : 1.0  
**Auteur** : Plan de modernisation technique  
**Statut** : Complet et prêt pour validation
