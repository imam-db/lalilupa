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
        this.loadingStartTime = null;
        this.isNavigating = false;
        this.navigationTimeout = null;
        this.hideLoadingTimeout = null;
        this.breadcrumbClickHandler = null;
        
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
        
        // Add click handler to loading overlay for emergency hide
        this.setupLoadingOverlayClickHandler();
    }
    
    /**
     * Setup loading overlay click handler for emergency hide
     */
    setupLoadingOverlayClickHandler() {
        if (this.loadingOverlay) {
            // Allow user to click on loading overlay to force hide after 3 seconds
            this.loadingOverlay.addEventListener('click', (e) => {
                if (this.isLoading && this.loadingOverlay.dataset.clickable === 'true') {
                    console.log('Loading overlay clicked - force hiding');
                    this.hideLoading();
                    this.showToast('Loading cancelled', 'info', 2000);
                }
            });
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Home button (LaliLink title) click event
        const homeButton = document.querySelector('header h1');
        if (homeButton) {
            homeButton.style.cursor = 'pointer';
            homeButton.addEventListener('click', () => {
                this.showClientsView();
            });
        }

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
<<<<<<< HEAD
        console.log('showLoading called:', message);
        this.isLoading = true;
        
        // Notify main app about loading start
        if (window.laliApp) {
            window.laliApp.loadingStartTime = Date.now();
        }
        
=======
        console.log('🔄 showLoading called:', message);
        // Always show loading, even if already loading (update message)
        this.isLoading = true;
        this.loadingStartTime = Date.now();
>>>>>>> e0255eeb3cb79d585a373277739e69901b0dda79
        if (this.loadingOverlay) {
            const loadingText = this.loadingOverlay.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = message;
            }
<<<<<<< HEAD
            
            // Simple and reliable show
            this.loadingOverlay.classList.remove('hidden', 'fade-out');
            
            // Make overlay clickable after 3 seconds as emergency escape
            this.loadingOverlay.dataset.clickable = 'false';
            setTimeout(() => {
                if (this.isLoading && this.loadingOverlay) {
                    this.loadingOverlay.dataset.clickable = 'true';
                    this.loadingOverlay.style.cursor = 'pointer';
                    
                    // Update loading text to show it's clickable
                    const loadingText = this.loadingOverlay.querySelector('.loading-text');
                    if (loadingText && !loadingText.textContent.includes('(Click to cancel)')) {
                        loadingText.textContent += ' (Click to cancel)';
                    }
                }
            }, 3000);
            
            console.log('Loading overlay shown');
=======
            // Reset all styles and show overlay
            this.loadingOverlay.classList.remove('hidden');
            this.loadingOverlay.style.display = 'flex';
            this.loadingOverlay.style.visibility = 'visible';
            this.loadingOverlay.style.opacity = '1';
            this.loadingOverlay.style.zIndex = '50';
            console.log('✅ Loading overlay displayed with reset styles');
>>>>>>> e0255eeb3cb79d585a373277739e69901b0dda79
        } else {
            console.warn('Loading overlay element not found');
        }
    }

    /**
     * Hide loading overlay
     * @param {boolean} force - Force hide even if loading was started recently
     */
<<<<<<< HEAD
    hideLoading() {
        console.log('hideLoading called');
        this.isLoading = false;
        
        // Reset loading start time in main app
        if (window.laliApp) {
            window.laliApp.loadingStartTime = null;
        }
        
=======
    hideLoading(force = false) {
        console.log('🔄 hideLoading called, force:', force);
        // Clear any pending hide timeout
        if (this.hideLoadingTimeout) {
            clearTimeout(this.hideLoadingTimeout);
            this.hideLoadingTimeout = null;
        }
        
        this.isLoading = false;
        this.loadingStartTime = null;
>>>>>>> e0255eeb3cb79d585a373277739e69901b0dda79
        if (this.loadingOverlay) {
            // Simple and reliable hide - immediately add hidden class
            this.loadingOverlay.classList.add('hidden');
<<<<<<< HEAD
            this.loadingOverlay.classList.remove('fade-out');
            this.loadingOverlay.dataset.clickable = 'false';
            this.loadingOverlay.style.cursor = 'default';
            console.log('Loading overlay hidden');
=======
            this.loadingOverlay.style.display = 'none';
            this.loadingOverlay.style.visibility = 'hidden';
            this.loadingOverlay.style.opacity = '0';
            this.loadingOverlay.style.zIndex = '-1';
            console.log('✅ Loading overlay hidden with multiple methods');
>>>>>>> e0255eeb3cb79d585a373277739e69901b0dda79
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
        
        // Navigation is handled by handleAuthStateChange in main.js
        // Don't force clients view here to maintain current view state
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
        
        // Save current view state
        localStorage.setItem('lastView', 'clients');
        localStorage.removeItem('lastClient');
        localStorage.removeItem('lastApplication');
        
        // Hide other contents
        if (this.applicationsContent) this.applicationsContent.classList.add('hidden');
        if (this.credentialsContent) this.credentialsContent.classList.add('hidden');
        
        // Show clients content
        if (this.clientsContent) this.clientsContent.classList.remove('hidden');
        
        // Show Add Client button when in clients view
        if (this.addClientBtn && window.laliApp && window.laliApp.userPermissions?.clients?.canCreate) {
            this.addClientBtn.style.display = 'flex';
        }
        
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
        
        // Save current view state
        localStorage.setItem('lastView', 'applications');
        localStorage.setItem('lastClient', JSON.stringify(client));
        localStorage.removeItem('lastApplication');
        
        // Hide other contents
        if (this.clientsContent) this.clientsContent.classList.add('hidden');
        if (this.credentialsContent) this.credentialsContent.classList.add('hidden');
        
        // Show applications content
        if (this.applicationsContent) this.applicationsContent.classList.remove('hidden');
        
        // Hide Add Client button when not in clients view
        if (this.addClientBtn) {
            this.addClientBtn.style.display = 'none';
        }
        
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
        
        // Save current view state
        localStorage.setItem('lastView', 'credentials');
        localStorage.setItem('lastApplication', JSON.stringify(application));
        if (this.currentClient) {
            localStorage.setItem('lastClient', JSON.stringify(this.currentClient));
        }
        
        // Hide other contents
        if (this.clientsContent) this.clientsContent.classList.add('hidden');
        if (this.applicationsContent) this.applicationsContent.classList.add('hidden');
        
        // Show credentials content
        if (this.credentialsContent) this.credentialsContent.classList.remove('hidden');
        
        // Hide Add Client button when not in clients view
        if (this.addClientBtn) {
            this.addClientBtn.style.display = 'none';
        }
        
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
        
        // Remove existing event listener if any
        if (this.breadcrumbClickHandler) {
            this.breadcrumbNav.removeEventListener('click', this.breadcrumbClickHandler);
        }
        
        // Clear existing content
        this.breadcrumbNav.innerHTML = '';
        
        this.breadcrumbNav.innerHTML = items.map((item, index) => {
            const isLast = index === items.length - 1;
            const classes = isLast 
                ? 'text-gray-500 cursor-default'
                : 'text-blue-600 hover:text-blue-800 cursor-pointer';
            
            return `
                <span class="${classes}" data-breadcrumb-index="${index}">${item.text}</span>
                ${!isLast ? '<span class="text-gray-400 mx-2">/</span>' : ''}
            `;
        }).join('');
        
        // Use event delegation with single event listener
        this.breadcrumbClickHandler = (e) => {
            const target = e.target.closest('[data-breadcrumb-index]');
            if (!target) return;
            
            const index = parseInt(target.getAttribute('data-breadcrumb-index'));
            const item = items[index];
            
            // Only handle clickable items (not the last one)
            if (index < items.length - 1 && item && item.action) {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    item.action();
                } catch (error) {
                    console.error('Breadcrumb navigation error:', error);
                }
            }
        };
        
        // Add single event listener using delegation
        this.breadcrumbNav.addEventListener('click', this.breadcrumbClickHandler);
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
                 onclick="window.laliApp.ui.navigateToApplications(${JSON.stringify(client).replace(/"/g, '&quot;')});">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${this.escapeHtml(client.client_name)}</h3>
                        <p class="text-gray-600 dark:text-gray-300">${this.escapeHtml(client.company_name || '')}</p>
                    </div>
                    <div class="flex space-x-3">
                        ${permissions.canUpdate ? `
                            <button onclick="event.stopPropagation(); window.laliApp.editClient(${client.id});" 
                                    class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit Client">
                                <i class="fas fa-edit text-lg"></i>
                            </button>
                        ` : ''}
                        ${permissions.canDelete ? `
                            <button onclick="event.stopPropagation(); if(confirm('Are you sure you want to delete this client?')) { window.laliApp.deleteClient(${client.id}); }" 
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
     * Render applications list with embedded credentials
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
            <div class="application-card bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${this.escapeHtml(app.app_name)}</h3>
                            <p class="text-gray-600 dark:text-gray-300">${this.escapeHtml(app.app_url || '')}</p>
                        </div>
                        <div class="flex space-x-2">
                            ${app.app_url ? `
                                <button onclick="window.laliApp.copyUrl('${app.app_url}'); window.laliApp.ui.showToast('URL copied to clipboard', 'success', 2000);" 
                                        class="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 p-2 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors" title="Copy URL">
                                    <i class="fas fa-link text-lg"></i>
                                </button>
                            ` : ''}
                            ${permissions.canUpdate ? `
                                <button onclick="window.laliApp.editApplication(${app.id}); window.laliApp.ui.showToast('Opening application editor...', 'info', 2000);" 
                                        class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit Application">
                                    <i class="fas fa-edit text-lg"></i>
                                </button>
                            ` : ''}
                            ${permissions.canDelete ? `
                                <button onclick="if(confirm('Are you sure you want to delete this application?')) { window.laliApp.deleteApplication(${app.id}); window.laliApp.ui.showToast('Application deleted successfully', 'success'); }" 
                                        class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete Application">
                                    <i class="fas fa-trash text-lg"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <p><i class="fas fa-info-circle mr-2"></i>${this.escapeHtml(app.description || 'No description')}</p>
                        <p><i class="fas fa-calendar mr-2"></i>Created: ${this.formatDate(app.created_at)}</p>
                    </div>
                    
                    <!-- Credentials Section -->
                    <div class="border-t dark:border-gray-700 pt-4">
                        <div class="flex justify-between items-center mb-3">
                            <h4 class="text-md font-medium text-gray-900 dark:text-white flex items-center">
                                <i class="fas fa-key mr-2"></i>Credentials
                                <span class="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full" id="credCount-${app.id}">0</span>
                            </h4>
                            <div class="flex space-x-2">
                                ${permissions.canCreate ? `
                                    <button onclick="window.laliApp.showAddCredentialModal(${app.id}); window.laliApp.ui.showToast('Opening credential form...', 'info', 2000);" 
                                            class="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-sm" title="Add Credential">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                ` : ''}
                                <button onclick="window.laliApp.ui.toggleCredentials(${app.id}); window.laliApp.ui.loadCredentialsForApp(${app.id});" 
                                        class="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors text-sm" title="Toggle Credentials">
                                     <i class="fas fa-chevron-down" id="chevron-${app.id}"></i>
                                 </button>
                            </div>
                        </div>
                        <div class="credentials-container hidden" id="credentials-${app.id}">
                            <div class="space-y-3" id="credentialsList-${app.id}">
                                <!-- Credentials will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Load credentials for each application
        applications.forEach(app => {
            this.loadCredentialsForApp(app.id);
        });
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

    /**
     * Toggle credentials visibility for an application
     * @param {number} appId - Application ID
     */
    toggleCredentials(appId) {
        const container = document.getElementById(`credentials-${appId}`);
        const chevron = document.getElementById(`chevron-${appId}`);
        
        if (container && chevron) {
            if (container.classList.contains('hidden')) {
                container.classList.remove('hidden');
                chevron.classList.remove('fa-chevron-down');
                chevron.classList.add('fa-chevron-up');
            } else {
                container.classList.add('hidden');
                chevron.classList.remove('fa-chevron-up');
                chevron.classList.add('fa-chevron-down');
            }
        }
    }

    /**
     * Toggle password visibility for a credential
     * @param {string} credId - Credential ID
     */
    togglePasswordVisibility(credId) {
        const passwordSpan = document.getElementById(`password-${credId}`);
        const eyeIcon = document.getElementById(`eye-${credId}`);
        const button = eyeIcon?.parentElement;
        
        if (passwordSpan && eyeIcon && button) {
            const isCurrentlyHidden = passwordSpan.textContent === '••••••••••••';
            
            if (isCurrentlyHidden) {
                // Show password
                passwordSpan.textContent = passwordSpan.dataset.password;
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
                button.querySelector('span').textContent = 'Hide';
            } else {
                // Hide password
                passwordSpan.textContent = '••••••••••••';
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
                button.querySelector('span').textContent = 'Show';
            }
        }
    }

    /**
     * Load credentials for a specific application
     * @param {number} appId - Application ID
     */
    async loadCredentialsForApp(appId) {
        try {
            const { data: credentials, error } = await window.laliApp.database.getCredentials(appId);
            
            if (error) {
                console.error('Failed to load credentials:', error);
                return;
            }
            
            this.renderCredentialsForApp(appId, credentials || []);
            
            // Update credential count
            const countEl = document.getElementById(`credCount-${appId}`);
            if (countEl) {
                countEl.textContent = (credentials || []).length;
            }
        } catch (error) {
            console.error('Error loading credentials:', error);
        }
    }

    /**
     * Render credentials for a specific application
     * @param {number} appId - Application ID
     * @param {Array} credentials - Credentials array
     */
    renderCredentialsForApp(appId, credentials) {
        const container = document.getElementById(`credentialsList-${appId}`);
        if (!container) return;
        
        if (!credentials || credentials.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    <i class="fas fa-key text-2xl mb-2"></i>
                    <p>No credentials found</p>
                </div>
            `;
            return;
        }
        
        const permissions = window.laliApp.userPermissions.credentials;
        
        container.innerHTML = credentials.map(cred => `
            <div class="credential-item bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div class="mb-4">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1">
                            <h5 class="font-medium text-gray-900 dark:text-white mb-1">${this.escapeHtml(cred.name || 'Unnamed Credential')}</h5>
                            <p class="text-sm text-gray-600 dark:text-gray-300">${this.escapeHtml(cred.description || 'No description')}</p>
                            ${cred.url ? `<p class="text-xs text-blue-600 dark:text-blue-400 mt-1"><i class="fas fa-link mr-1"></i>${this.escapeHtml(cred.url)}</p>` : ''}
                        </div>
                        <div class="flex space-x-2">
                            ${permissions.canUpdate ? `
                                <button onclick="window.laliApp.editCredential(${cred.id}); window.laliApp.ui.showToast('Opening editor...', 'info', 2000);" 
                                        class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit">
                                    <i class="fas fa-edit text-base"></i>
                                </button>
                            ` : ''}
                            ${permissions.canDelete ? `
                                <button onclick="if(confirm('Delete this credential?')) { window.laliApp.deleteCredential(${cred.id}); window.laliApp.ui.showToast('Credential deleted', 'success'); }" 
                                        class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                                    <i class="fas fa-trash text-base"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Username Section -->
                    <div class="mb-3">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Username:</span>
                            <button onclick="window.laliApp.copyUsername('${cred.username}'); window.laliApp.ui.showToast('Username copied', 'success', 2000);" 
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 min-w-[80px]" title="Copy Username">
                                <i class="fas fa-copy"></i>
                                <span>Copy</span>
                            </button>
                        </div>
                        <div class="font-mono bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-lg text-gray-900 dark:text-white break-all">
                            ${this.escapeHtml(cred.username)}
                        </div>
                    </div>
                    
                    <!-- Password Section -->
                    <div class="mb-3">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Password:</span>
                            <div class="flex space-x-2">
                                <button onclick="window.laliApp.ui.togglePasswordVisibility('${cred.id}')" 
                                         class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 min-w-[80px]" title="Show/Hide Password">
                                     <i id="eye-${cred.id}" class="fas fa-eye"></i>
                                     <span>Show</span>
                                 </button>
                                <button onclick="window.laliApp.copyPassword(${cred.id}); window.laliApp.ui.showToast('Password copied', 'success', 2000);" 
                                        class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 min-w-[80px]" title="Copy Password">
                                    <i class="fas fa-copy"></i>
                                    <span>Copy</span>
                                </button>
                            </div>
                        </div>
                        <div class="font-mono bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-lg text-gray-900 dark:text-white break-all">
                            <span id="password-${cred.id}" data-password="${this.escapeHtml(cred.pwd || '')}">••••••••••••</span>
                        </div>
                    </div>
                    
                    ${cred.url ? `
                        <!-- URL Section -->
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">URL:</span>
                                <button onclick="window.laliApp.copyUrl('${cred.url}'); window.laliApp.ui.showToast('URL copied', 'success', 2000);" 
                                        class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 min-w-[80px]" title="Copy URL">
                                    <i class="fas fa-copy"></i>
                                    <span>Copy</span>
                                </button>
                            </div>
                            <div class="font-mono bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-lg text-blue-600 dark:text-blue-400 break-all">
                                <a href="${cred.url}" target="_blank" class="hover:underline">${this.escapeHtml(cred.url)}</a>
                            </div>
                        </div>
                    ` : ''}
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
        // Wait for DOM to be ready
        const initTheme = () => {
            const themeToggle = document.getElementById('themeToggle');
            if (!themeToggle) {
                console.warn('Theme toggle button not found - retrying...');
                // Retry after a delay
                setTimeout(initTheme, 500);
                return;
            }

            console.log('Theme toggle button found, initializing...');

            // Check for saved theme preference or default to light mode
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            console.log('Saved theme:', savedTheme, 'Prefers dark:', prefersDark);
            
            // Apply initial theme
            if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                document.documentElement.classList.add('dark');
                console.log('Applied dark theme on init');
            } else {
                document.documentElement.classList.remove('dark');
                console.log('Applied light theme on init');
            }

            // Remove any existing event listeners by cloning
            const newThemeToggle = themeToggle.cloneNode(true);
            themeToggle.parentNode.replaceChild(newThemeToggle, themeToggle);

            // Toggle theme on button click
            newThemeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Theme toggle button clicked!');
                
                const htmlElement = document.documentElement;
                const currentlyDark = htmlElement.classList.contains('dark');
                console.log('Currently dark mode:', currentlyDark);
                
                // Force remove all theme classes first
                htmlElement.classList.remove('dark');
                
                if (currentlyDark) {
                    // Switch to light theme
                    localStorage.setItem('theme', 'light');
                    this.showToast('Switched to light theme', 'success', 2000);
                    console.log('Switched to light theme');
                } else {
                    // Switch to dark theme
                    htmlElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                    this.showToast('Switched to dark theme', 'success', 2000);
                    console.log('Switched to dark theme');
                }
                
                // Update theme toggle icons
                const moonIcon = newThemeToggle.querySelector('.fa-moon');
                const sunIcon = newThemeToggle.querySelector('.fa-sun');
                
                if (moonIcon && sunIcon) {
                    if (htmlElement.classList.contains('dark')) {
                        moonIcon.classList.add('hidden');
                        sunIcon.classList.remove('hidden');
                    } else {
                        moonIcon.classList.remove('hidden');
                        sunIcon.classList.add('hidden');
                    }
                }
                
                // Force repaint with requestAnimationFrame
                requestAnimationFrame(() => {
                    document.body.style.transform = 'translateZ(0)';
                    requestAnimationFrame(() => {
                        document.body.style.transform = '';
                        console.log('Theme repaint completed');
                    });
                });
            });
            
            console.log('Theme toggle initialized successfully');
        };
        
        // Try to initialize immediately, then retry if needed
        setTimeout(initTheme, 100);
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

    // ==================== STATE MANAGEMENT ====================
    
    /**
     * Reset UI state after tab visibility change
     */
    resetNavigationState() {
        this.isNavigating = false;
        
        // Clear any pending navigation timeouts
        if (this.navigationTimeout) {
            clearTimeout(this.navigationTimeout);
            this.navigationTimeout = null;
        }
        
        // Clear any pending hide loading timeouts
        if (this.hideLoadingTimeout) {
            clearTimeout(this.hideLoadingTimeout);
            this.hideLoadingTimeout = null;
        }
        
        // Force hide any lingering loading overlay
        this.hideLoading(true);
        
        // Remove breadcrumb event listener to prevent conflicts
        if (this.breadcrumbClickHandler && this.breadcrumbNav) {
            this.breadcrumbNav.removeEventListener('click', this.breadcrumbClickHandler);
            this.breadcrumbClickHandler = null;
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