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
        
        // Lists
        this.clientsList = document.getElementById('clientsList');
        this.applicationsList = document.getElementById('applicationsList');
        this.credentialsList = document.getElementById('credentialsList');
        
        // Stats elements
        this.totalClientsEl = document.getElementById('totalClients');
        this.totalApplicationsEl = document.getElementById('totalApplications');
        this.totalCredentialsEl = document.getElementById('totalCredentials');
        
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
     * Show clients view (default view)
     */
    showClientsView() {
        this.currentView = 'clients';
        
        // Hide other contents
        if (this.applicationsContent) this.applicationsContent.classList.add('hidden');
        if (this.credentialsContent) this.credentialsContent.classList.add('hidden');
        
        // Show clients content
        if (this.clientsContent) this.clientsContent.classList.remove('hidden');
        
        this.updateBreadcrumb([{ text: 'Clients', action: null }]);
        
        // Trigger content load
        if (this.onShowClients) this.onShowClients();
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
        
        // Show applications content
        if (this.applicationsContent) this.applicationsContent.classList.remove('hidden');
        
        // Update breadcrumb
        this.updateBreadcrumb([
            { text: 'Clients', action: () => this.showClientsView() },
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
        
        // Show credentials content
        if (this.credentialsContent) this.credentialsContent.classList.remove('hidden');
        
        // Update breadcrumb
        this.updateBreadcrumb([
            { text: 'Clients', action: () => this.showClientsView() },
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
            <div class="client-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700" 
                 onclick="window.laliApp.ui.navigateToApplications(${JSON.stringify(client).replace(/"/g, '&quot;')}); window.laliApp.ui.showToast('Loading applications for ${client.client_name}...', 'info', 2000);">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${this.escapeHtml(client.client_name)}</h3>
                        <p class="text-gray-600 dark:text-gray-300">${this.escapeHtml(client.company_name || '')}</p>
                    </div>
                    <div class="flex space-x-3">
                        ${permissions.canUpdate ? `
                            <button onclick="event.stopPropagation(); window.laliApp.editClient(${client.id}); window.laliApp.ui.showToast('Opening client editor...', 'info', 2000);" 
                                    class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit Client">
                                <i class="fas fa-edit text-lg"></i>
                            </button>
                        ` : ''}
                        ${permissions.canDelete ? `
                            <button onclick="event.stopPropagation(); if(confirm('Are you sure you want to delete this client?')) { window.laliApp.deleteClient(${client.id}); window.laliApp.ui.showToast('Client deleted successfully', 'success'); }" 
                                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete Client">
                                <i class="fas fa-trash text-lg"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                    ${client.notes ? `<p><i class="fas fa-sticky-note mr-2"></i>${this.escapeHtml(client.notes)}</p>` : ''}
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
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <i class="fas fa-desktop text-4xl mb-4"></i>
                    <p>No applications found</p>
                    ${permissions.canCreate ? '<p class="text-sm">Click "Add Application" to get started</p>' : ''}
                </div>
            `;
            return;
        }
        
        this.applicationsList.innerHTML = applications.map(app => `
            <div class="application-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700" 
                 onclick="window.laliApp.ui.navigateToCredentials(${JSON.stringify(app).replace(/"/g, '&quot;')}); window.laliApp.ui.showToast('Loading credentials for ${app.app_name}...', 'info', 2000);">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${this.escapeHtml(app.app_name)}</h3>
                        <p class="text-gray-600 dark:text-gray-300">${this.escapeHtml(app.app_url || '')}</p>
                    </div>
                    <div class="flex space-x-3">
                        ${permissions.canUpdate ? `
                            <button onclick="event.stopPropagation(); window.laliApp.editApplication(${app.id}); window.laliApp.ui.showToast('Opening application editor...', 'info', 2000);" 
                                    class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit Application">
                                <i class="fas fa-edit text-lg"></i>
                            </button>
                        ` : ''}
                        ${permissions.canDelete ? `
                            <button onclick="event.stopPropagation(); if(confirm('Are you sure you want to delete this application?')) { window.laliApp.deleteApplication(${app.id}); window.laliApp.ui.showToast('Application deleted successfully', 'success'); }" 
                                    class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete Application">
                                <i class="fas fa-trash text-lg"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
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
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <i class="fas fa-key text-4xl mb-4"></i>
                    <p>No credentials found</p>
                    ${permissions.canCreate ? '<p class="text-sm">Click "Add Credential" to get started</p>' : ''}
                </div>
            `;
            return;
        }
        
        this.credentialsList.innerHTML = credentials.map(cred => `
            <div class="credential-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${this.escapeHtml(cred.username)}</h3>
                        <p class="text-gray-600 dark:text-gray-300">${this.escapeHtml(cred.description || '')}</p>
                    </div>
                    <div class="flex space-x-3 flex-wrap gap-2">
                        <button onclick="window.laliApp.copyUsername('${cred.username}'); window.laliApp.ui.showToast('Username copied to clipboard', 'success', 2000);" 
                                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Copy Username">
                            <i class="fas fa-user text-lg"></i>
                        </button>
                        <button onclick="window.laliApp.copyPassword(${cred.id}); window.laliApp.ui.showToast('Password copied to clipboard', 'success', 2000);" 
                                class="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-2 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Copy Password">
                            <i class="fas fa-key text-lg"></i>
                        </button>
                        ${cred.url ? `
                            <button onclick="window.laliApp.copyUrl('${cred.url}'); window.laliApp.ui.showToast('URL copied to clipboard', 'success', 2000);" 
                                    class="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 p-2 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors" title="Copy URL">
                                <i class="fas fa-link text-lg"></i>
                            </button>
                        ` : ''}
                        ${permissions.canUpdate ? `
                            <button onclick="window.laliApp.editCredential(${cred.id}); window.laliApp.ui.showToast('Opening credential editor...', 'info', 2000);" 
                                    class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit">
                                <i class="fas fa-edit text-lg"></i>
                            </button>
                        ` : ''}
                        ${permissions.canDelete ? `
                            <button onclick="if(confirm('Are you sure you want to delete this credential?')) { window.laliApp.deleteCredential(${cred.id}); window.laliApp.ui.showToast('Credential deleted successfully', 'success'); }" 
                                    class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                                <i class="fas fa-trash text-lg"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
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
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <i class="fas fa-users text-4xl mb-4"></i>
                    <p>No users found</p>
                </div>
            `;
            return;
        }
        
        this.usersList.innerHTML = users.map(user => `
            <div class="user-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${this.escapeHtml(user.full_name || 'Unknown User')}</h3>
                        <p class="text-gray-600 dark:text-gray-300">${this.escapeHtml(user.email || user.user_id)}</p>
                        <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' 
                                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' 
                                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        }">
                            ${user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'Unknown'}
                        </span>
                    </div>
                    <div class="flex space-x-3">
                        ${permissions.canUpdate ? `
                            <button onclick="window.laliApp.editUserRole('${user.user_id}', '${user.role}'); window.laliApp.ui.showToast('Opening role editor...', 'info', 2000);" 
                                    class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit Role">
                                <i class="fas fa-user-cog text-lg"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
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
            this.addClientBtn.style.display = permissions.clients?.canCreate ? 'flex' : 'none';
        }
        
        if (this.addApplicationBtn) {
            this.addApplicationBtn.style.display = permissions.applications?.canCreate ? 'block' : 'none';
        }
        
        if (this.addCredentialBtn) {
            this.addCredentialBtn.style.display = permissions.credentials?.canCreate ? 'block' : 'none';
        }
    }
    
    /**
     * Update stats display
     * @param {Object} stats - Statistics object
     */
    updateStats(stats) {
        if (this.totalClientsEl && stats.clients !== undefined) {
            this.totalClientsEl.textContent = stats.clients;
        }
        
        if (this.totalApplicationsEl && stats.applications !== undefined) {
            this.totalApplicationsEl.textContent = stats.applications;
        }
        
        if (this.totalCredentialsEl && stats.credentials !== undefined) {
            this.totalCredentialsEl.textContent = stats.credentials;
        }
    }

    /**
     * Initialize dark theme toggle
     */
    initializeDarkTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
        }

        // Toggle theme on button click
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            
            // Save theme preference
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // Show toast notification
            this.showToast(`Switched to ${isDark ? 'dark' : 'light'} theme`, 'success');
        });
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, info, warning)
     * @param {number} duration - Duration in milliseconds
     */
    showToast(message, type = 'info', duration = 3000) {
        // Remove existing toast if any
        const existingToast = document.getElementById('toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
        
        // Set toast colors based on type
        const typeClasses = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-black',
            info: 'bg-blue-500 text-white'
        };
        
        toast.className += ` ${typeClasses[type] || typeClasses.info}`;
        
        // Set toast content
        toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' :
                    'fa-info-circle'
                }"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, duration);
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