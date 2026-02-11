// ============================================
// Données fictives pour l'application
// ============================================

// Générateur de données fictives
const DataGenerator = {
    // Prénoms français
    firstNames: [
        'Jean', 'Marie', 'Pierre', 'Sophie', 'Luc', 'Claire', 'Michel', 'Anne',
        'François', 'Isabelle', 'Philippe', 'Catherine', 'Jacques', 'Nathalie',
        'Alain', 'Sylvie', 'Bernard', 'Martine', 'Christian', 'Monique',
        'Daniel', 'Nicole', 'Laurent', 'Françoise', 'Patrick', 'Brigitte',
        'André', 'Chantal', 'Robert', 'Dominique', 'Thierry', 'Véronique',
        'Olivier', 'Sandrine', 'Nicolas', 'Valérie', 'Christophe', 'Stéphanie',
        'Julien', 'Caroline', 'Sébastien', 'Céline', 'David', 'Laurence',
        'Thomas', 'Patricia', 'Alexandre', 'Corinne', 'Frédéric', 'Hélène'
    ],

    // Noms de famille français
    lastNames: [
        'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit',
        'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel',
        'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier',
        'Morel', 'Girard', 'André', 'Lefevre', 'Mercier', 'Dupont', 'Lambert',
        'Bonnet', 'François', 'Martinez', 'Legrand', 'Garnier', 'Faure',
        'Rousseau', 'Blanc', 'Guerin', 'Muller', 'Henry', 'Roussel', 'Nicolas',
        'Perrin', 'Morin', 'Mathieu', 'Clement', 'Gauthier', 'Dumont', 'Lopez',
        'Fontaine', 'Chevalier', 'Robin'
    ],

    // Postes disponibles
    jobs: [
        'Manager', 'Analyst', 'Clerk', 'Designer', 'Engineer', 'Director',
        'Operator', 'Salesman'
    ],

    // Générer un ID employé unique
    generateEmployeeId: function(existingIds = []) {
        let id;
        do {
            const num = Math.floor(Math.random() * 900000) + 100000;
            id = num.toString().substring(0, 6);
        } while (existingIds.includes(id));
        return id;
    },

    // Générer un prénom aléatoire
    randomFirstName: function() {
        return this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
    },

    // Générer un nom aléatoire
    randomLastName: function() {
        return this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
    },

    // Générer une initiale
    randomInitial: function() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return letters[Math.floor(Math.random() * letters.length)];
    },

    // Générer un poste aléatoire
    randomJob: function() {
        return this.jobs[Math.floor(Math.random() * this.jobs.length)];
    },

    // Générer un salaire aléatoire
    randomSalary: function() {
        return (Math.floor(Math.random() * 70000) + 30000).toFixed(2);
    },

    // Générer un numéro de téléphone (4 chiffres)
    randomPhone: function() {
        return Math.floor(Math.random() * 9000 + 1000).toString();
    }
};

// Données des départements
const departmentsData = [
    {
        id: 'A00',
        name: 'Administration Générale',
        mgrno: '000010',
        admrdept: 'A00',
        location: 'Paris'
    },
    {
        id: 'B01',
        name: 'Technologies de l\'Information',
        mgrno: '000020',
        admrdept: 'A00',
        location: 'Lyon'
    },
    {
        id: 'C01',
        name: 'Finance et Comptabilité',
        mgrno: '000030',
        admrdept: 'A00',
        location: 'Marseille'
    },
    {
        id: 'D11',
        name: 'Direction et Management',
        mgrno: '000050',
        admrdept: 'A00',
        location: 'Paris'
    },
    {
        id: 'E21',
        name: 'Ressources Humaines',
        mgrno: '000090',
        admrdept: 'A00',
        location: 'Toulouse'
    },
    {
        id: 'D21',
        name: 'Développement Logiciel',
        mgrno: '000060',
        admrdept: 'B01',
        location: 'Lyon'
    },
    {
        id: 'E11',
        name: 'Opérations et Support',
        mgrno: '000100',
        admrdept: 'B01',
        location: 'Nantes'
    },
    {
        id: 'F22',
        name: 'Marketing et Communication',
        mgrno: '000110',
        admrdept: 'A00',
        location: 'Bordeaux'
    }
];

// Générer les employés pour chaque département
function generateEmployees() {
    const employees = [];
    const usedIds = [];
    
    // Nombre d'employés par département (variable)
    const employeesPerDept = {
        'A00': 8,
        'B01': 12,
        'C01': 10,
        'D11': 6,
        'E21': 9,
        'D21': 15,
        'E11': 11,
        'F22': 7
    };

    departmentsData.forEach(dept => {
        const count = employeesPerDept[dept.id] || 8;
        
        for (let i = 0; i < count; i++) {
            const empId = DataGenerator.generateEmployeeId(usedIds);
            usedIds.push(empId);
            
            const firstName = DataGenerator.randomFirstName();
            const lastName = DataGenerator.randomLastName();
            const initial = DataGenerator.randomInitial();
            
            employees.push({
                empno: empId,
                firstnme: firstName,
                midinit: initial,
                lastname: lastName,
                workdept: dept.id,
                phoneno: DataGenerator.randomPhone(),
                hiredate: generateRandomDate(2015, 2024),
                job: DataGenerator.randomJob(),
                edlevel: Math.floor(Math.random() * 8) + 12,
                sex: Math.random() > 0.5 ? 'M' : 'F',
                birthdate: generateRandomDate(1960, 1995),
                salary: parseFloat(DataGenerator.randomSalary()),
                bonus: parseFloat((Math.random() * 10000).toFixed(2)),
                comm: parseFloat((Math.random() * 5000).toFixed(2))
            });
        }
    });

    return employees;
}

// Générer une date aléatoire entre deux années
function generateRandomDate(startYear, endYear) {
    const start = new Date(startYear, 0, 1);
    const end = new Date(endYear, 11, 31);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
}

// Initialiser les données
const employeesData = generateEmployees();

// ============================================
// Gestionnaire de stockage local
// ============================================
const StorageManager = {
    STORAGE_KEY_DEPTS: 'company_departments',
    STORAGE_KEY_EMPS: 'company_employees',
    STORAGE_KEY_THEME: 'company_theme',

    // Initialiser le stockage avec les données par défaut
    init: function() {
        if (!this.getDepartments()) {
            this.saveDepartments(departmentsData);
        }
        if (!this.getEmployees()) {
            this.saveEmployees(employeesData);
        }
    },

    // Départements
    getDepartments: function() {
        const data = localStorage.getItem(this.STORAGE_KEY_DEPTS);
        return data ? JSON.parse(data) : null;
    },

    saveDepartments: function(departments) {
        localStorage.setItem(this.STORAGE_KEY_DEPTS, JSON.stringify(departments));
    },

    // Employés
    getEmployees: function() {
        const data = localStorage.getItem(this.STORAGE_KEY_EMPS);
        return data ? JSON.parse(data) : null;
    },

    saveEmployees: function(employees) {
        localStorage.setItem(this.STORAGE_KEY_EMPS, JSON.stringify(employees));
    },

    addEmployee: function(employee) {
        const employees = this.getEmployees() || [];
        employees.push(employee);
        this.saveEmployees(employees);
    },

    updateEmployee: function(empno, updatedData) {
        const employees = this.getEmployees() || [];
        const index = employees.findIndex(emp => emp.empno === empno);
        if (index !== -1) {
            employees[index] = { ...employees[index], ...updatedData };
            this.saveEmployees(employees);
            return true;
        }
        return false;
    },

    deleteEmployee: function(empno) {
        const employees = this.getEmployees() || [];
        const filtered = employees.filter(emp => emp.empno !== empno);
        this.saveEmployees(filtered);
    },

    // Thème
    getTheme: function() {
        return localStorage.getItem(this.STORAGE_KEY_THEME) || 'light';
    },

    saveTheme: function(theme) {
        localStorage.setItem(this.STORAGE_KEY_THEME, theme);
    },

    // Réinitialiser toutes les données
    reset: function() {
        this.saveDepartments(departmentsData);
        this.saveEmployees(generateEmployees());
    }
};

// ============================================
// API de données pour l'application
// ============================================
const DataAPI = {
    // Obtenir tous les départements
    getDepartments: function() {
        return StorageManager.getDepartments() || [];
    },

    // Obtenir un département par ID
    getDepartment: function(deptId) {
        const departments = this.getDepartments();
        return departments.find(dept => dept.id === deptId);
    },

    // Obtenir tous les employés
    getEmployees: function() {
        return StorageManager.getEmployees() || [];
    },

    // Obtenir les employés d'un département
    getEmployeesByDepartment: function(deptId) {
        const employees = this.getEmployees();
        return employees.filter(emp => emp.workdept === deptId);
    },

    // Obtenir un employé par ID
    getEmployee: function(empno) {
        const employees = this.getEmployees();
        return employees.find(emp => emp.empno === empno);
    },

    // Calculer le total des salaires d'un département
    getTotalSalary: function(deptId) {
        const employees = this.getEmployeesByDepartment(deptId);
        return employees.reduce((total, emp) => total + (emp.salary || 0), 0);
    },

    // Générer un nouvel ID employé
    generateNewEmployeeId: function() {
        const employees = this.getEmployees();
        const existingIds = employees.map(emp => emp.empno);
        return DataGenerator.generateEmployeeId(existingIds);
    },

    // Ajouter un nouvel employé
    addEmployee: function(employeeData) {
        const newEmployee = {
            empno: employeeData.empno || this.generateNewEmployeeId(),
            firstnme: employeeData.firstnme,
            midinit: employeeData.midinit,
            lastname: employeeData.lastname,
            workdept: employeeData.workdept,
            phoneno: employeeData.phoneno,
            hiredate: new Date().toISOString().split('T')[0],
            job: employeeData.job,
            edlevel: 16,
            sex: 'M',
            birthdate: '1990-01-01',
            salary: parseFloat(employeeData.salary),
            bonus: 0,
            comm: 0
        };

        StorageManager.addEmployee(newEmployee);
        return newEmployee;
    },

    // Mettre à jour un employé
    updateEmployee: function(empno, updatedData) {
        return StorageManager.updateEmployee(empno, updatedData);
    },

    // Supprimer un employé
    deleteEmployee: function(empno) {
        StorageManager.deleteEmployee(empno);
    },

    // Rechercher des départements
    searchDepartments: function(query) {
        const departments = this.getDepartments();
        const lowerQuery = query.toLowerCase();
        return departments.filter(dept => 
            dept.id.toLowerCase().includes(lowerQuery) ||
            dept.name.toLowerCase().includes(lowerQuery) ||
            dept.location.toLowerCase().includes(lowerQuery)
        );
    },

    // Rechercher des employés
    searchEmployees: function(query, deptId = null) {
        let employees = deptId 
            ? this.getEmployeesByDepartment(deptId)
            : this.getEmployees();
        
        const lowerQuery = query.toLowerCase();
        return employees.filter(emp => 
            emp.empno.toLowerCase().includes(lowerQuery) ||
            emp.firstnme.toLowerCase().includes(lowerQuery) ||
            emp.lastname.toLowerCase().includes(lowerQuery) ||
            emp.job.toLowerCase().includes(lowerQuery)
        );
    },

    // Trier les données
    sortData: function(data, field, ascending = true) {
        return [...data].sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];

            // Gestion des valeurs numériques
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return ascending ? aVal - bVal : bVal - aVal;
            }

            // Gestion des chaînes
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();

            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
    },

    // Réinitialiser les données
    resetData: function() {
        StorageManager.reset();
    }
};

// Initialiser le stockage au chargement
StorageManager.init();

// Exporter pour utilisation dans l'application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataAPI, StorageManager, DataGenerator };
}

// Made with Bob
