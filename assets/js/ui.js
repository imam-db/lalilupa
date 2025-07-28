/**
 * UIManager - Handles all UI operations and interactions
 * Manages modals, toasts, rendering, and role-based UI updates
 */
class UIManager {
    constructor(config) {
        this.config = config;
        this.currentView = 'clients';
        this.currentClient = null;
        this.currentApplication = null;
        this.breadcrumb = [];
        this.searchTimeout = null;
        this.isLoading = false;
        
        // Initialize UI elements
        this.initializeElements();
        this.bindEvents();
    }

    /**
     * Initialize UI elements references
     */
    initializeElements() {
        // Main containers
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.authContainer = document.getElementById('authContainer');
        this.appContainer = document.getElementById('appContainer');
        this.toastContainer = document.getElementById('toastContainer');
        
        // Navigation
        this.breadcrumbNav = document.getElementById('breadcrumbNav');
        this.userRoleBadge = document.getElementById('userRoleBadge');
        this.userEmailSpan = document.getElementById('userEmail');
        
        // Content areas
        this.clientsContent = document.getElementById('clientsContent');
        this.applicationsContent = document.getElementById('applicationsContent');
        this.credentialsContent = document.getElementById('credentialsContent');
        this.usersContent = document.getElementById('usersContent');
        
        // Lists
        this.clientsList = document.getElementById('clientsList');
        this.applicationsList = document.getElementById('applicationsList');
        this.credentialsList = document.getElementById('credentialsList');
        this.usersList = document.getElementById('usersList');
        
        // Modals
        this.clientModal = document.getElementById('clientModal');
        this.applicationModal = document.getElementById('applicationModal');
        this.credentialModal = document.getElementById('credentialModal');
        this.roleModal = document.getElementById('roleModal');
        this.confirmModal = document.getElementById('confirmModal');
        
        // Forms
        this.clientForm = document.getElementById('clientForm');
        this.applicationForm = document.getElementById('applicationForm');
        this.credentialForm = document.getElementById('credentialForm');
        this.userForm = document.getElementById('userForm');
        
        // Buttons
        this.addClientBtn = document.getElementById('addClientBtn');
        this.addApplicationBtn = document.getElementById('addApplicationBtn');
        this.addCredentialBtn = document.getElementById('addCredentialBtn');
        
        // Search inputs
        this.clientSearch = document.getElementById('clientSearch');
        this.applicationSearch = document.getElementById('applicationSearch');
        this.credentialSearch = document.getElementById('credentialSearch');
        
        // Navigation tabs
        this.navTabs = document.querySelectorAll('[data-tab]');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation tabs
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Search inputs with debounce
        if (this.clientSearch) {
            this.clientSearch.addEventListener('input', (e) => {
                this.debounceSearch(() => this.handleClientSearch(e.target.value));
            });
        }

        if (this.applicationSearch) {
            this.applicationSearch.addEventListener('input', (e) => {
                this.debounceSearch(() => this.handleApplicationSearch(e.target.value));
            });
        }

        if (this.credentialSearch) {
            this.credentialSearch.addEventListener('input', (e) => {
                this.debounceSearch(() => this.handleCredentialSearch(e.target.value));
            });
        }

        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeModal(e.target.closest('.modal'));
            }
        });

        // Close modal buttons
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });
    }

    // ==================== LOADING & AUTH UI ====================

    /**
     * Show loading overlay
     * @param {string} message - Loading message
     */
    showLoading(message = 'Loading...') {
        this.isLoading = true;
        if (this.loadingOverlay) {
            const loadingText = this.loadingOverlay.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = message;
            }
            this.loadingOverlay.classList.remove('hidden');
        } else {
            console.warn('Loading overlay element not found');
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        this.isLoading = false;
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('hidden');
        } else {
            console.warn('Loading overlay element not found');
        }
    }

    /**
     * Show authentication container
     */
    showAuth() {
        if (this.authContainer) {
            this.authContainer.classList.remove('hidden');
        }
        if (this.appContainer) {
            this.appContainer.classList.add('hidden');
        }
    }

    /**
     * Show main application
     */
    showApp() {
        if (this.authContainer) {
            this.authContainer.classList.add('hidden');
        }
        if (this.appContainer) {
            this.appContainer.classList.remove('hidden');
        }
    }

    /**
     * Update user info in header
     * @param {Object} user - User object
     * @param {Object} profile - User profile
     */
    updateUserInfo(user, profile) {
        if (this.userEmailSpan && user?.email) {
            this.userEmailSpan.textContent = user.email;
        }
        
        if (this.userRoleBadge && profile?.role) {
            this.userRoleBadge.textContent = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
            this.userRoleBadge.className = `px-2 py-1 text-xs font-semibold rounded-full ${
                profile.role === 'admin' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
            }`;
        }
    }

    // ==================== NAVIGATION & TABS ====================

    /**
     * Switch between tabs
     * @param {string} tabName - Tab name
     */
    switchTab(tabName) {
        // Update active tab
        this.navTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('border-primary-500', 'text-primary-600');
                tab.classList.remove('border-transparent', 'text-gray-500');
            } else {
                tab.classList.remove('border-primary-500', 'text-primary-600');
                tab.classList.add('border-transparent', 'text-gray-500');
            }
        });

        // Show/hide content
        const contents = [this.clientsContent, this.applicationsContent, this.credentialsContent, this.usersContent];
        contents.forEach(content => {
            if (content) {
                content.classList.add('hidden');
            }
        });

        // Show selected content
        switch (tabName) {
            case 'clients':
                this.currentView = 'clients';
                if (this.clientsContent) this.clientsContent.classList.remove('hidden');
                this.updateBreadcrumb([{ text: 'Clients', action: null }]);
                break;
            case 'users':
                this.currentView = 'users';
                if (this.usersContent) this.usersContent.classList.remove('hidden');
                this.updateBreadcrumb([{ text: 'User Management', action: null }]);
                break;
        }

        // Trigger content load
        this.onTabSwitch(tabName);
    }

    /**
     * Navigate to applications view
     * @param {Object} client - Client object
     */
    navigateToApplications(client) {
        this.currentClient = client;
        this.currentView = 'applications';
        
        // Hide other contents
        if (this.clientsContent) this.clientsContent.classList.add('hidden');
        if (this.credentialsContent) this.credentialsContent.classList.add('hidden');
        if (this.usersContent) this.usersContent.classList.add('hidden');
        
        // Show applications content
        if (this.applicationsContent) this.applicationsContent.classList.remove('hidden');
        
        // Update breadcrumb
        this.updateBreadcrumb([
            { text: 'Clients', action: () => this.switchTab('clients') },
            { text: client.client_name, action: null }
        ]);
        
        // Update applications header
        const appsHeader = document.getElementById('applicationsHeader');
        if (appsHeader) {
            appsHeader.textContent = `Applications for ${client.client_name}`;
        }
        
        // Trigger applications load
        this.onNavigateToApplications(client);
    }

    /**
     * Navigate to credentials view
     * @param {Object} application - Application object
     */
    navigateToCredentials(application) {
        this.currentApplication = application;
        this.currentView = 'credentials';
        
        // Hide other contents
        if (this.clientsContent) this.clientsContent.classList.add('hidden');
        if (this.applicationsContent) this.applicationsContent.classList.add('hidden');
        if (this.usersContent) this.usersContent.classList.add('hidden');
        
        // Show credentials content
        if (this.credentialsContent) this.credentialsContent.classList.remove('hidden');
        
        // Update breadcrumb
        this.updateBreadcrumb([
            { text: 'Clients', action: () => this.switchTab('clients') },
            { text: this.currentClient?.client_name || 'Client', action: () => this.navigateToApplications(this.currentClient) },
            { text: application.app_name, action: null }
        ]);
        
        // Update credentials header
        const credsHeader = document.getElementById('credentialsHeader');
        if (credsHeader) {
            credsHeader.textContent = `Credentials for ${application.app_name}`;
        }
        
        // Trigger credentials load
        this.onNavigateToCredentials(application);
    }

    /**
     * Update breadcrumb navigation
     * @param {Array} items - Breadcrumb items
     */
    updateBreadcrumb(items) {
        this.breadcrumb = items;
        
        if (!this.breadcrumbNav) return;
        
        this.breadcrumbNav.innerHTML = items.map((item, index) => {
            const isLast = index === items.length - 1;
            const classes = isLast 
                ? 'text-gray-500 cursor-default'
                : 'text-primary-600 hover:text-primary-800 cursor-pointer';
            
            const clickHandler = item.action && !isLast ? `onclick="${item.action}"` : '';
            
            return `
                <span class="${classes}" ${clickHandler}>${item.text}</span>
                ${!isLast ? '<span class="text-gray-400 mx-2">/</span>' : ''}
            `;
        }).join('');
    }

    // ==================== MODAL MANAGEMENT ====================

    /**
     * Show modal
     * @param {HTMLElement} modal - Modal element
     */
    showModal(modal) {
        if (!modal) return;
        
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Focus first input
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    /**
     * Close modal
     * @param {HTMLElement} modal - Modal element
     */
    closeModal(modal) {
        if (!modal) return;
        
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
            // Reset form if exists
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
        }, 300);
    }

    /**
     * Show confirmation modal
     * @param {string} title - Modal title
     * @param {string} message - Confirmation message
     * @param {Function} onConfirm - Confirm callback
     * @param {string} confirmText - Confirm button text
     * @param {string} confirmClass - Confirm button class
     */
    showConfirmModal(title, message, onConfirm, confirmText = 'Confirm', confirmClass = 'btn-danger') {
        if (!this.confirmModal) return;
        
        // Update modal content
        const titleEl = this.confirmModal.querySelector('#confirmTitle');
        const messageEl = this.confirmModal.querySelector('#confirmMessage');
        const confirmBtn = this.confirmModal.querySelector('#confirmActionBtn');
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        if (confirmBtn) {
            confirmBtn.textContent = confirmText;
            confirmBtn.className = `btn ${confirmClass}`;
            
            // Remove old listeners and add new one
            const newBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
            
            newBtn.addEventListener('click', () => {
                onConfirm();
                this.closeModal(this.confirmModal);
            });
        }
        
        this.showModal(this.confirmModal);
    }

    // ==================== TOAST NOTIFICATIONS ====================

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds
     */
    showToast(message, type = 'info', duration = null) {
        if (!this.toastContainer) return;
        
        const toastDuration = duration || this.config.UI.TOAST_DURATION;
        const toastId = 'toast_' + Date.now();
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        const colorMap = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast ${colorMap[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 mb-2 transform translate-x-full transition-transform duration-300`;
        
        toast.innerHTML = `
            <i class="${iconMap[type]}"></i>
            <span class="flex-1">${message}</span>
            <button onclick="this.parentElement.remove()" class="text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.toastContainer.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            if (document.getElementById(toastId)) {
                toast.classList.add('translate-x-full');
                setTimeout(() => toast.remove(), 300);
            }
        }, toastDuration);
    }

    // ==================== SEARCH & FILTERING ====================

    /**
     * Debounce search input
     * @param {Function} callback - Search callback
     */
    debounceSearch(callback) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(callback, this.config.ui.debounceDelay);
    }

    /**
     * Handle client search
     * @param {string} query - Search query
     */
    handleClientSearch(query) {
        this.onClientSearch(query);
    }

    /**
     * Handle application search
     * @param {string} query - Search query
     */
    handleApplicationSearch(query) {
        this.onApplicationSearch(query);
    }

    /**
     * Handle credential search
     * @param {string} query - Search query
     */
    handleCredentialSearch(query) {
        this.onCredentialSearch(query);
    }

    // ==================== RENDERING METHODS ====================

    /**
     * Render clients list
     * @param {Array} clients - Clients array
     * @param {Object} permissions - User permissions
     */
    renderClients(clients, permissions) {
        if (!this.clientsList) return;
        
        if (!clients || clients.length === 0) {
            this.clientsList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-users text-4xl mb-4"></i>
                    <p>No clients found</p>
                    ${permissions.canCreate ? '<p class="text-sm">Click "Add Client" to get started</p>' : ''}
                </div>
            `;
            return;
        }
        
        this.clientsList.innerHTML = clients.map(client => `
            <div class="client-card bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                 onclick="window.laliApp.ui.navigateToApplications(${JSON.stringify(client).replace(/"/g, '&quot;')})">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">${this.escapeHtml(client.client_name)}</h3>
                        <p class="text-gray-600">${this.escapeHtml(client.company_name || '')}</p>
                    </div>
                    <div class="flex space-x-2">
                        ${permissions.canUpdate ? `
                            <button onclick="event.stopPropagation(); window.laliApp.editClient(${client.id})" 
                                    class="text-blue-600 hover:text-blue-800">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        ${permissions.canDelete ? `
                            <button onclick="event.stopPropagation(); window.laliApp.deleteClient(${client.id})" 
                                    class="text-red-600 hover:text-red-800">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="text-sm text-gray-500">
                    <p><i class="fas fa-envelope mr-2"></i>${this.escapeHtml(client.email || '')}</p>
                    <p><i class="fas fa-phone mr-2"></i>${this.escapeHtml(client.phone || '')}</p>
                    <p><i class="fas fa-calendar mr-2"></i>Created: ${this.formatDate(client.created_at)}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render applications list
     * @param {Array} applications - Applications array
     * @param {Object} permissions - User permissions
     */
    renderApplications(applications, permissions) {
        if (!this.applicationsList) return;
        
        if (!applications || applications.length === 0) {
            this.applicationsList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-desktop text-4xl mb-4"></i>
                    <p>No applications found</p>
                    ${permissions.canCreate ? '<p class="text-sm">Click "Add Application" to get started</p>' : ''}
                </div>
            `;
            return;
        }
        
        this.applicationsList.innerHTML = applications.map(app => `
            <div class="application-card bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                 onclick="window.laliApp.ui.navigateToCredentials(${JSON.stringify(app).replace(/"/g, '&quot;')})">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">${this.escapeHtml(app.app_name)}</h3>
                        <p class="text-gray-600">${this.escapeHtml(app.app_url || '')}</p>
                    </div>
                    <div class="flex space-x-2">
                        ${permissions.canUpdate ? `
                            <button onclick="event.stopPropagation(); window.laliApp.editApplication(${app.id})" 
                                    class="text-blue-600 hover:text-blue-800">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        ${permissions.canDelete ? `
                            <button onclick="event.stopPropagation(); window.laliApp.deleteApplication(${app.id})" 
                                    class="text-red-600 hover:text-red-800">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="text-sm text-gray-500">
                    <p><i class="fas fa-info-circle mr-2"></i>${this.escapeHtml(app.description || 'No description')}</p>
                    <p><i class="fas fa-calendar mr-2"></i>Created: ${this.formatDate(app.created_at)}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render credentials list
     * @param {Array} credentials - Credentials array
     * @param {Object} permissions - User permissions
     */
    renderCredentials(credentials, permissions) {
        if (!this.credentialsList) return;
        
        if (!credentials || credentials.length === 0) {
            this.credentialsList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-key text-4xl mb-4"></i>
                    <p>No credentials found</p>
                    ${permissions.canCreate ? '<p class="text-sm">Click "Add Credential" to get started</p>' : ''}
                </div>
            `;
            return;
        }
        
        this.credentialsList.innerHTML = credentials.map(cred => `
            <div class="credential-card bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900">${this.escapeHtml(cred.username)}</h3>
                        <p class="text-gray-600">${this.escapeHtml(cred.description || '')}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="window.laliApp.copyUsername('${cred.username}')" 
                                class="text-blue-600 hover:text-blue-800" title="Copy Username">
                            <i class="fas fa-user"></i>
                        </button>
                        <button onclick="window.laliApp.copyPassword(${cred.id})" 
                                class="text-green-600 hover:text-green-800" title="Copy Password">
                            <i class="fas fa-key"></i>
                        </button>
                        ${cred.url ? `
                            <button onclick="window.laliApp.copyUrl('${cred.url}')" 
                                    class="text-purple-600 hover:text-purple-800" title="Copy URL">
                                <i class="fas fa-link"></i>
                            </button>
                        ` : ''}
                        ${permissions.canUpdate ? `
                            <button onclick="window.laliApp.editCredential(${cred.id})" 
                                    class="text-blue-600 hover:text-blue-800" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        ${permissions.canDelete ? `
                            <button onclick="window.laliApp.deleteCredential(${cred.id})" 
                                    class="text-red-600 hover:text-red-800" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="text-sm text-gray-500">
                    ${cred.url ? `<p><i class="fas fa-link mr-2"></i>${this.escapeHtml(cred.url)}</p>` : ''}
                    <p><i class="fas fa-calendar mr-2"></i>Created: ${this.formatDate(cred.created_at)}</p>
                    ${cred.updated_at !== cred.created_at ? `<p><i class="fas fa-edit mr-2"></i>Updated: ${this.formatDate(cred.updated_at)}</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    /**
     * Render users list (Admin only)
     * @param {Array} users - Users array
     * @param {Object} permissions - User permissions
     */
    renderUsers(users, permissions) {
        if (!this.usersList) return;
        
        if (!users || users.length === 0) {
            this.usersList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-users text-4xl mb-4"></i>
                    <p>No users found</p>
                </div>
            `;
            return;
        }
        
        this.usersList.innerHTML = users.map(user => `
            <div class="user-card bg-white rounded-lg shadow-md p-6">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900">${this.escapeHtml(user.full_name || 'Unknown User')}</h3>
                        <p class="text-gray-600">${this.escapeHtml(user.email || user.user_id)}</p>
                        <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                        }">
                            ${user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'Unknown'}
                        </span>
                    </div>
                    <div class="flex space-x-2">
                        ${permissions.canUpdate ? `
                            <button onclick="window.laliApp.editUserRole('${user.user_id}', '${user.role}')" 
                                    class="text-blue-600 hover:text-blue-800" title="Edit Role">
                                <i class="fas fa-user-cog"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="text-sm text-gray-500">
                    <p><i class="fas fa-calendar mr-2"></i>Joined: ${this.formatDate(user.created_at)}</p>
                    ${user.updated_at !== user.created_at ? `<p><i class="fas fa-edit mr-2"></i>Updated: ${this.formatDate(user.updated_at)}</p>` : ''}
                </div>
            </div>
        `).join('');
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    }

    /**
     * Update role-based UI elements
     * @param {string} userRole - User role
     * @param {Object} permissions - User permissions
     */
    updateRoleBasedUI(userRole, permissions) {
        // Show/hide add buttons based on permissions
        if (this.addClientBtn) {
            this.addClientBtn.style.display = permissions.clients?.canCreate ? 'block' : 'none';
        }
        
        if (this.addApplicationBtn) {
            this.addApplicationBtn.style.display = permissions.applications?.canCreate ? 'block' : 'none';
        }
        
        if (this.addCredentialBtn) {
            this.addCredentialBtn.style.display = permissions.credentials?.canCreate ? 'block' : 'none';
        }
        
        // Show/hide User Management tab
        const userTab = document.querySelector('[data-tab="users"]');
        if (userTab) {
            userTab.style.display = permissions.users?.canRead ? 'block' : 'none';
        }
    }

    // ==================== EVENT CALLBACKS ====================
    // These methods should be overridden by the main app

    onTabSwitch(tabName) {
        // Override in main app
    }

    onNavigateToApplications(client) {
        // Override in main app
    }

    onNavigateToCredentials(application) {
        // Override in main app
    }

    onClientSearch(query) {
        // Override in main app
    }

    onApplicationSearch(query) {
        // Override in main app
    }

    onCredentialSearch(query) {
        // Override in main app
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}