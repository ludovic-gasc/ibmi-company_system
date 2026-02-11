// ============================================
// Application principale - Système de Gestion d'Entreprise
// ============================================

class CompanyApp {
    constructor() {
        this.currentView = 'departments';
        this.currentDepartment = null;
        this.sortState = {
            field: null,
            ascending: true
        };
        
        this.init();
    }

    // ============================================
    // Initialisation
    // ============================================
    init() {
        this.initTheme();
        this.initEventListeners();
        this.showView('departments');
        this.loadDepartments();
    }

    // ============================================
    // Gestion du thème
    // ============================================
    initTheme() {
        const savedTheme = StorageManager.getTheme();
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        StorageManager.saveTheme(newTheme);
    }

    // ============================================
    // Gestion des événements
    // ============================================
    initEventListeners() {
        // Bouton de changement de thème
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Boutons de navigation
        document.getElementById('backToDepts').addEventListener('click', () => {
            this.showView('departments');
            this.loadDepartments();
        });

        document.getElementById('backFromNewEmp').addEventListener('click', () => {
            if (this.currentDepartment) {
                this.showView('employees');
                this.loadEmployees(this.currentDepartment);
            } else {
                this.showView('departments');
                this.loadDepartments();
            }
        });

        // Bouton d'actualisation
        document.getElementById('refreshDepts').addEventListener('click', () => {
            this.loadDepartments();
            this.showToast('Données actualisées', 'success');
        });

        // Bouton nouvel employé depuis la liste
        document.getElementById('addEmployeeFromList').addEventListener('click', () => {
            this.showNewEmployeeForm(this.currentDepartment);
        });

        // Recherche départements
        document.getElementById('searchDepts').addEventListener('input', (e) => {
            this.searchDepartments(e.target.value);
        });

        // Recherche employés
        document.getElementById('searchEmps').addEventListener('input', (e) => {
            this.searchEmployees(e.target.value);
        });

        // Formulaire nouvel employé
        document.getElementById('newEmployeeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleNewEmployeeSubmit();
        });

        document.getElementById('cancelNewEmp').addEventListener('click', () => {
            if (this.currentDepartment) {
                this.showView('employees');
                this.loadEmployees(this.currentDepartment);
            } else {
                this.showView('departments');
                this.loadDepartments();
            }
        });

        // Tri des tableaux
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', (e) => {
                const field = e.currentTarget.dataset.sort;
                this.handleSort(field);
            });
        });
    }

    // ============================================
    // Gestion des vues
    // ============================================
    showView(viewName) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        const viewMap = {
            'departments': 'departmentsView',
            'employees': 'employeesView',
            'newEmployee': 'newEmployeeView'
        };
        
        const viewId = viewMap[viewName];
        if (viewId) {
            document.getElementById(viewId).classList.add('active');
            this.currentView = viewName;
        }
    }

    // ============================================
    // Chargement des départements
    // ============================================
    loadDepartments(departments = null) {
        const data = departments || DataAPI.getDepartments();
        const tbody = document.getElementById('deptsTableBody');
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted" style="padding: 2rem;">
                        Aucun département trouvé
                    </td>
                </tr>
            `;
            document.getElementById('deptsCount').textContent = '0 département';
            return;
        }

        data.forEach(dept => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <select class="action-select" data-dept-id="${dept.id}">
                        <option value="">--</option>
                        <option value="5">5 - Voir</option>
                        <option value="8">8 - Nouvel employé</option>
                    </select>
                </td>
                <td class="font-mono">${this.escapeHtml(dept.id)}</td>
                <td>${this.escapeHtml(dept.name)}</td>
                <td>${this.escapeHtml(dept.location)}</td>
            `;
            tbody.appendChild(row);

            // Ajouter l'événement sur le select
            const select = row.querySelector('.action-select');
            select.addEventListener('change', (e) => {
                this.handleDepartmentAction(e.target.value, dept.id);
                e.target.value = '';
            });
        });

        const count = data.length;
        document.getElementById('deptsCount').textContent = 
            `${count} département${count > 1 ? 's' : ''}`;
    }

    // ============================================
    // Actions sur les départements
    // ============================================
    handleDepartmentAction(action, deptId) {
        switch(action) {
            case '5':
                this.viewDepartmentEmployees(deptId);
                break;
            case '8':
                this.showNewEmployeeForm(deptId);
                break;
        }
    }

    viewDepartmentEmployees(deptId) {
        this.currentDepartment = deptId;
        this.showView('employees');
        this.loadEmployees(deptId);
    }

    // ============================================
    // Chargement des employés
    // ============================================
    loadEmployees(deptId, employees = null) {
        const dept = DataAPI.getDepartment(deptId);
        if (!dept) return;

        document.getElementById('currentDeptName').textContent = dept.name;

        const data = employees || DataAPI.getEmployeesByDepartment(deptId);
        const tbody = document.getElementById('empsTableBody');
        tbody.innerHTML = '';

        // Calculer et afficher le total des salaires
        const totalSalary = DataAPI.getTotalSalary(deptId);
        document.getElementById('totalSalary').textContent = 
            this.formatCurrency(totalSalary);

        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted" style="padding: 2rem;">
                        Aucun employé dans ce département
                    </td>
                </tr>
            `;
            document.getElementById('empsCount').textContent = '0 employé';
            return;
        }

        data.forEach(emp => {
            const fullName = `${emp.lastname}, ${emp.firstnme}`;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <select class="action-select" data-emp-id="${emp.empno}">
                        <option value="">--</option>
                        <option value="5">5 - Détails</option>
                    </select>
                </td>
                <td class="font-mono">${this.escapeHtml(emp.empno)}</td>
                <td>${this.escapeHtml(fullName)}</td>
                <td>${this.escapeHtml(emp.job)}</td>
                <td class="text-right">${this.formatCurrency(emp.salary)}</td>
            `;
            tbody.appendChild(row);

            // Ajouter l'événement sur le select
            const select = row.querySelector('.action-select');
            select.addEventListener('change', (e) => {
                this.handleEmployeeAction(e.target.value, emp.empno);
                e.target.value = '';
            });
        });

        const count = data.length;
        document.getElementById('empsCount').textContent = 
            `${count} employé${count > 1 ? 's' : ''}`;
    }

    // ============================================
    // Actions sur les employés
    // ============================================
    handleEmployeeAction(action, empno) {
        switch(action) {
            case '5':
                this.viewEmployeeDetails(empno);
                break;
        }
    }

    viewEmployeeDetails(empno) {
        const emp = DataAPI.getEmployee(empno);
        if (!emp) return;

        const details = `
            ID: ${emp.empno}
            Nom: ${emp.lastname}, ${emp.firstnme} ${emp.midinit}.
            Département: ${emp.workdept}
            Poste: ${emp.job}
            Salaire: ${this.formatCurrency(emp.salary)}
            Téléphone: ${emp.phoneno}
            Date d'embauche: ${this.formatDate(emp.hiredate)}
        `;

        this.showToast(`Détails de l'employé`, 'info', details);
    }

    // ============================================
    // Formulaire nouvel employé
    // ============================================
    showNewEmployeeForm(deptId) {
        this.currentDepartment = deptId;
        this.showView('newEmployee');

        // Générer un nouvel ID
        const newId = DataAPI.generateNewEmployeeId();
        document.getElementById('empId').value = newId;

        // Définir le département
        const dept = DataAPI.getDepartment(deptId);
        document.getElementById('empDept').value = dept ? `${dept.id} - ${dept.name}` : deptId;

        // Réinitialiser le formulaire
        document.getElementById('empFirstName').value = '';
        document.getElementById('empInitial').value = '';
        document.getElementById('empLastName').value = '';
        document.getElementById('empJob').value = '';
        document.getElementById('empSalary').value = '';
        document.getElementById('empPhone').value = '';

        // Cacher les erreurs
        this.hideFormError();
    }

    handleNewEmployeeSubmit() {
        // Récupérer les valeurs du formulaire
        const formData = {
            empno: document.getElementById('empId').value,
            firstnme: document.getElementById('empFirstName').value.trim(),
            midinit: document.getElementById('empInitial').value.trim().toUpperCase(),
            lastname: document.getElementById('empLastName').value.trim(),
            workdept: this.currentDepartment,
            job: document.getElementById('empJob').value.trim(),
            salary: document.getElementById('empSalary').value,
            phoneno: document.getElementById('empPhone').value.trim()
        };

        // Validation
        const error = this.validateEmployeeForm(formData);
        if (error) {
            this.showFormError(error);
            return;
        }

        // Ajouter l'employé
        try {
            DataAPI.addEmployee(formData);
            this.showToast('Employé créé avec succès', 'success');
            
            // Retourner à la liste des employés
            this.showView('employees');
            this.loadEmployees(this.currentDepartment);
        } catch (err) {
            this.showFormError('Erreur lors de la création de l\'employé');
        }
    }

    validateEmployeeForm(data) {
        if (!data.firstnme) {
            return 'Le prénom ne peut pas être vide';
        }
        if (data.firstnme.length > 12) {
            return 'Le prénom ne peut pas dépasser 12 caractères';
        }
        if (!data.midinit) {
            return 'L\'initiale ne peut pas être vide';
        }
        if (data.midinit.length !== 1) {
            return 'L\'initiale doit être un seul caractère';
        }
        if (!data.lastname) {
            return 'Le nom de famille ne peut pas être vide';
        }
        if (data.lastname.length > 15) {
            return 'Le nom de famille ne peut pas dépasser 15 caractères';
        }
        if (!data.job) {
            return 'Le poste ne peut pas être vide';
        }
        if (data.job.length > 8) {
            return 'Le poste ne peut pas dépasser 8 caractères';
        }
        if (!data.salary || isNaN(data.salary) || parseFloat(data.salary) <= 0) {
            return 'Le salaire doit être un nombre positif';
        }
        if (!data.phoneno) {
            return 'Le téléphone ne peut pas être vide';
        }
        if (!/^\d{4}$/.test(data.phoneno)) {
            return 'Le téléphone doit contenir exactement 4 chiffres';
        }
        return null;
    }

    showFormError(message) {
        const errorDiv = document.getElementById('formError');
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }

    hideFormError() {
        const errorDiv = document.getElementById('formError');
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
    }

    // ============================================
    // Recherche
    // ============================================
    searchDepartments(query) {
        if (!query.trim()) {
            this.loadDepartments();
            return;
        }

        const results = DataAPI.searchDepartments(query);
        this.loadDepartments(results);
    }

    searchEmployees(query) {
        if (!query.trim()) {
            this.loadEmployees(this.currentDepartment);
            return;
        }

        const results = DataAPI.searchEmployees(query, this.currentDepartment);
        this.loadEmployees(this.currentDepartment, results);
    }

    // ============================================
    // Tri
    // ============================================
    handleSort(field) {
        // Déterminer la direction du tri
        if (this.sortState.field === field) {
            this.sortState.ascending = !this.sortState.ascending;
        } else {
            this.sortState.field = field;
            this.sortState.ascending = true;
        }

        // Mettre à jour les indicateurs visuels
        document.querySelectorAll('.sortable').forEach(header => {
            header.classList.remove('sorted-asc', 'sorted-desc');
        });

        const currentHeader = document.querySelector(`[data-sort="${field}"]`);
        if (currentHeader) {
            currentHeader.classList.add(
                this.sortState.ascending ? 'sorted-asc' : 'sorted-desc'
            );
        }

        // Trier et recharger les données
        if (this.currentView === 'departments') {
            const departments = DataAPI.getDepartments();
            const fieldMap = { id: 'id', name: 'name' };
            const sortField = fieldMap[field] || field;
            const sorted = DataAPI.sortData(departments, sortField, this.sortState.ascending);
            this.loadDepartments(sorted);
        } else if (this.currentView === 'employees') {
            const employees = DataAPI.getEmployeesByDepartment(this.currentDepartment);
            const fieldMap = { id: 'empno', name: 'lastname', job: 'job', salary: 'salary' };
            const sortField = fieldMap[field] || field;
            const sorted = DataAPI.sortData(employees, sortField, this.sortState.ascending);
            this.loadEmployees(this.currentDepartment, sorted);
        }
    }

    // ============================================
    // Notifications Toast
    // ============================================
    showToast(message, type = 'info', details = null) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            warning: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };

        const detailsHtml = details ? `<div class="toast-message">${this.escapeHtml(details).replace(/\n/g, '<br>')}</div>` : '';

        toast.innerHTML = `
            ${icons[type] || icons.info}
            <div class="toast-content">
                <div class="toast-title">${this.escapeHtml(message)}</div>
                ${detailsHtml}
            </div>
        `;

        container.appendChild(toast);

        // Supprimer automatiquement après 5 secondes
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    // ============================================
    // Utilitaires
    // ============================================
    formatCurrency(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount || 0);
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR').format(date);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }
}

// ============================================
// Initialisation de l'application
// ============================================
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new CompanyApp();
});

// Enregistrer le Service Worker pour PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker enregistré avec succès:', registration.scope);
            })
            .catch(error => {
                console.log('Échec de l\'enregistrement du Service Worker:', error);
            });
    });
}

// Made with Bob
