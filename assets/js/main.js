/**
 * LaliLink Main Application
 * Orchestrates all modules and handles the main application logic
 */
class LaliLinkApp {
    constructor() {
        this.config = window.LALI_CONFIG || window.CONFIG;
        this.supabase = null;
        this.auth = null;
        this.database = null;
        this.security = null;
        this.clipboard = null;
        this.ui = null;
        
        this.currentUser = null;
        this.userProfile = null;
        this.userPermissions = null;
        
        this.isInitialized = false;
        this.sessionCheckInterval = null;
        
        // Bind methods to preserve context
        this.handleAuthStateChange = this.handleAuthStateChange.bind(this);
        this.checkSession = this.checkSession.bind(this);
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Check if config is available
            if (!this.config) {
                throw new Error('Configuration not found. Please ensure config.js is loaded.');
            }
            
            // Initialize UI Manager first to handle loading states
            this.ui = new UIManager(this.config);
            this.ui.showLoading('Initializing LaliLink...');
            
            // Initialize Supabase
            await this.initializeSupabase();
            
            // Initialize other managers
            await this.initializeManagers();
            
            // Setup UI event handlers
            this.setupUIEventHandlers();
            
            // Check initial auth state
            await this.checkInitialAuthState();
            
            // Start session monitoring
            this.startSessionMonitoring();
            
            this.isInitialized = true;
            this.ui.hideLoading();
            
            console.log('LaliLink initialized successfully');
        } catch (error) {
            console.error('Failed to initialize LaliLink:', error);
            if (this.ui) {
                this.ui.hideLoading();
                this.ui.showToast('Failed to initialize application', 'error');
            } else {
                alert('Failed to initialize application: ' + error.message);
            }
        }
    }

    /**
     * Initialize Supabase client
     */
    async initializeSupabase() {
        if (!this.config.SUPABASE?.URL || !this.config.SUPABASE?.ANON_KEY) {
            throw new Error('Supabase configuration is missing. Please check config.js');
        }
        
        this.supabase = supabase.createClient(
            this.config.SUPABASE.URL,
            this.config.SUPABASE.ANON_KEY
        );
        
        // Test connection
        try {
            const { data, error } = await this.supabase.auth.getSession();
            if (error && error.message.includes('Invalid API key')) {
                throw new Error('Invalid Supabase credentials');
            }
        } catch (error) {
            throw new Error('Failed to connect to Supabase: ' + error.message);
        }
    }

    /**
     * Initialize all managers
     */
    async initializeManagers() {
        // Initialize other managers (UI already initialized in init())
        this.security = new SecurityManager();
        this.clipboard = new ClipboardManager();
        this.auth = new AuthManager(this.supabase, this.config);
        this.database = new DatabaseManager(this.supabase);
        
        // Set up auth state change listener
        this.auth.addAuthStateListener((event, session) => this.handleAuthStateChange(event, session));
        
        // Set up Supabase auth state listener
        this.supabase.auth.onAuthStateChange((event, session) => {
            this.auth.onAuthStateChange(event, session);
        });
    }

    /**
     * Setup UI event handlers
     */
    setupUIEventHandlers() {
        // Override UI callback methods
        this.ui.onShowClients = () => this.loadClients();
        this.ui.onNavigateToApplications = (client) => this.loadApplications(client);
        this.ui.onNavigateToCredentials = (application) => this.loadCredentials(application);
        this.ui.onClientSearch = (query) => this.searchClients(query);
        this.ui.onApplicationSearch = (query) => this.searchApplications(query);
        this.ui.onCredentialSearch = (query) => this.searchCredentials(query);
        
        // Initialize dark theme
        this.ui.initializeDarkTheme();
        
        // Form submissions
        this.setupFormHandlers();
        
        // Button click handlers
        this.setupButtonHandlers();
    }

    /**
     * Setup form handlers
     */
    setupFormHandlers() {
        // Auth forms
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        // Entity forms
        if (this.ui.clientForm) {
            this.ui.clientForm.addEventListener('submit', (e) => this.handleClientSubmit(e));
        }
        
        if (this.ui.applicationForm) {
            this.ui.applicationForm.addEventListener('submit', (e) => this.handleApplicationSubmit(e));
        }
        
        if (this.ui.credentialForm) {
            this.ui.credentialForm.addEventListener('submit', (e) => this.handleCredentialSubmit(e));
        }
        
        if (this.ui.userForm) {
            this.ui.userForm.addEventListener('submit', (e) => this.handleUserSubmit(e));
        }
    }

    /**
     * Setup button handlers
     */
    setupButtonHandlers() {
        // Add buttons
        if (this.ui.addClientBtn) {
            this.ui.addClientBtn.addEventListener('click', () => this.showAddClientModal());
        }
        
        if (this.ui.addApplicationBtn) {
            this.ui.addApplicationBtn.addEventListener('click', () => this.showAddApplicationModal());
        }
        
        if (this.ui.addCredentialBtn) {
            this.ui.addCredentialBtn.addEventListener('click', () => this.showAddCredentialModal());
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        // Auth toggle buttons
        const showRegisterBtn = document.getElementById('showRegister');
        const showLoginBtn = document.getElementById('showLogin');
        
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', () => this.toggleAuthForm('register'));
        }
        
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => this.toggleAuthForm('login'));
        }
    }

    // ==================== AUTHENTICATION ====================

    /**
     * Check initial authentication state
     */
    async checkInitialAuthState() {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                await this.handleAuthStateChange('SIGNED_IN', session);
            } else {
                this.ui.showAuth();
            }
        } catch (error) {
            console.error('Failed to check initial auth state:', error);
            this.ui.showAuth();
        }
    }

    /**
     * Handle authentication state changes
     * @param {string} event - Auth event
     * @param {Object} session - Session object
     */
    async handleAuthStateChange(event, session) {
        try {
            if (event === 'SIGNED_IN' && session) {
                this.currentUser = session.user;
                
                // Load user profile
                await this.loadUserProfile();
                
                // Update UI
                this.ui.updateUserInfo(this.currentUser, this.userProfile);
                this.ui.showApp();
                
                // Load initial data
                await this.loadInitialData();
                
                this.ui.showToast('Welcome to LaliLink!', 'success');
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.userProfile = null;
                this.userPermissions = null;
                
                // Clear sensitive data
                this.database.clearAllCaches();
                
                this.ui.showAuth();
                this.ui.showToast('You have been logged out', 'info');
            }
        } catch (error) {
            console.error('Error handling auth state change:', error);
            this.ui.showToast('Authentication error occurred', 'error');
        }
    }

    /**
     * Handle login form submission
     * @param {Event} e - Form event
     */
    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const email = form.querySelector('#loginEmail').value;
        const password = form.querySelector('#loginPassword').value;
        
        if (!email || !password) {
            this.ui.showToast('Please fill in all fields', 'error');
            return;
        }
        
        this.ui.showLoading('Signing in...');
        
        try {
            const { data, error } = await this.auth.signIn(email, password);
            
            if (error) {
                throw error;
            }
            
            // Success is handled by auth state change
        } catch (error) {
            console.error('Login error:', error);
            this.ui.showToast(error.message || 'Login failed', 'error');
        } finally {
            this.ui.hideLoading();
        }
    }

    /**
     * Handle register form submission
     * @param {Event} e - Form event
     */
    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const email = form.querySelector('#registerEmail').value;
        const password = form.querySelector('#registerPassword').value;
        const confirmPassword = form.querySelector('#confirmPassword').value;
        const fullName = form.querySelector('#fullName').value;
        
        if (!email || !password || !confirmPassword || !fullName) {
            this.ui.showToast('Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.ui.showToast('Passwords do not match', 'error');
            return;
        }
        
        // Validate password strength
        const passwordValidation = this.security.validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            this.ui.showToast(`Password is too weak: ${passwordValidation.feedback.join(', ')}`, 'error');
            return;
        }
        
        this.ui.showLoading('Creating account...');
        
        try {
            const { data, error } = await this.auth.signUp(email, password, { full_name: fullName });
            
            if (error) {
                throw error;
            }
            
            this.ui.showToast('Account created successfully! Please check your email for verification.', 'success');
            this.toggleAuthForm('login');
        } catch (error) {
            console.error('Registration error:', error);
            this.ui.showToast(error.message || 'Registration failed', 'error');
        } finally {
            this.ui.hideLoading();
        }
    }

    /**
     * Handle logout
     */
    async handleLogout() {
        try {
            this.ui.showLoading('Signing out...');
            await this.auth.signOut();
            // Success is handled by auth state change
        } catch (error) {
            console.error('Logout error:', error);
            this.ui.showToast('Logout failed', 'error');
        } finally {
            this.ui.hideLoading();
        }
    }

    /**
     * Toggle between login and register forms
     * @param {string} form - Form type ('login' or 'register')
     */
    toggleAuthForm(form) {
        const loginForm = document.getElementById('loginFormContainer');
        const registerForm = document.getElementById('registerFormContainer');
        
        if (form === 'register') {
            loginForm?.classList.add('hidden');
            registerForm?.classList.remove('hidden');
        } else {
            registerForm?.classList.add('hidden');
            loginForm?.classList.remove('hidden');
        }
    }

    // ==================== USER PROFILE & PERMISSIONS ====================

    /**
     * Load user profile and permissions
     */
    async loadUserProfile() {
        try {
            const { data: profile, error } = await this.database.getUserProfile(this.currentUser.id);
            
            if (error) {
                // Create profile if it doesn't exist
                const { data: newProfile, error: createError } = await this.auth.createUserProfile({
                    user_id: this.currentUser.id,
                    email: this.currentUser.email,
                    full_name: this.currentUser.user_metadata?.full_name || '',
                    role: this.config.roles.defaultRole
                });
                
                if (createError) {
                    throw createError;
                }
                
                this.userProfile = newProfile;
            } else {
                this.userProfile = profile;
            }
            
            // Load permissions
            this.userPermissions = await this.auth.getUserPermissions(this.userProfile.role);
            
            // Update role-based UI
            this.ui.updateRoleBasedUI(this.userProfile.role, this.userPermissions);
            
        } catch (error) {
            console.error('Failed to load user profile:', error);
            throw error;
        }
    }

    /**
     * Load initial data after authentication
     */
    async loadInitialData() {
        try {
            // Load clients by default
            await this.loadClients();
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.ui.showToast('Failed to load data', 'error');
        }
    }

    // ==================== SESSION MONITORING ====================

    /**
     * Start session monitoring
     */
    startSessionMonitoring() {
        // Check session every 5 minutes
        this.sessionCheckInterval = setInterval(this.checkSession, 5 * 60 * 1000);
    }

    /**
     * Check session validity
     */
    async checkSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error || !session) {
                // Session expired
                if (this.currentUser) {
                    this.ui.showToast('Session expired. Please log in again.', 'warning');
                    await this.handleLogout();
                }
            }
        } catch (error) {
            console.error('Session check failed:', error);
        }
    }

    // ==================== TAB SWITCHING ====================

    /**
     * Update statistics display
     */
    async updateStats() {
        try {
            const stats = {
                clients: this.clients.length,
                applications: this.applications.length,
                credentials: this.credentials.length
            };
            
            this.ui.updateStats(stats);
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    // ==================== DATA LOADING ====================

    /**
     * Load clients
     */
    async loadClients() {
        try {
            this.ui.showLoading('Loading clients...');
            
            const { data: clients, error } = await this.database.getClients();
            
            if (error) {
                throw error;
            }
            
            const permissions = this.userPermissions.clients;
            this.ui.renderClients(clients || [], permissions);
            await this.updateStats();
            
        } catch (error) {
            console.error('Failed to load clients:', error);
            this.ui.showToast('Failed to load clients', 'error');
        } finally {
            this.ui.hideLoading();
        }
    }

    /**
     * Load applications for a client
     * @param {Object} client - Client object
     */
    async loadApplications(client) {
        try {
            this.ui.showLoading('Loading applications...');
            
            const { data: applications, error } = await this.database.getApplications(client.id);
            
            if (error) {
                throw error;
            }
            
            const permissions = this.userPermissions.applications;
            this.ui.renderApplications(applications || [], permissions);
            await this.updateStats();
            
        } catch (error) {
            console.error('Failed to load applications:', error);
            this.ui.showToast('Failed to load applications', 'error');
        } finally {
            this.ui.hideLoading();
        }
    }

    /**
     * Load credentials for an application
     * @param {Object} application - Application object
     */
    async loadCredentials(application) {
        try {
            this.ui.showLoading('Loading credentials...');
            
            const { data: credentials, error } = await this.database.getCredentials(application.id);
            
            if (error) {
                throw error;
            }
            
            const permissions = this.userPermissions.credentials;
            this.ui.renderCredentials(credentials || [], permissions);
            await this.updateStats();
            
        } catch (error) {
            console.error('Failed to load credentials:', error);
            this.ui.showToast('Failed to load credentials', 'error');
        } finally {
            this.ui.hideLoading();
        }
    }



    // ==================== SEARCH FUNCTIONALITY ====================

    /**
     * Search clients
     * @param {string} query - Search query
     */
    async searchClients(query) {
        try {
            if (!query.trim()) {
                await this.loadClients();
                return;
            }
            
            const { data: clients, error } = await this.database.searchClients(query);
            
            if (error) {
                throw error;
            }
            
            const permissions = this.userPermissions.clients;
            this.ui.renderClients(clients || [], permissions);
            
        } catch (error) {
            console.error('Failed to search clients:', error);
            this.ui.showToast('Search failed', 'error');
        }
    }

    /**
     * Search applications
     * @param {string} query - Search query
     */
    async searchApplications(query) {
        // Implementation depends on current client context
        if (!this.ui.currentClient) return;
        
        try {
            const { data: applications, error } = await this.database.getApplications(this.ui.currentClient.id);
            
            if (error) {
                throw error;
            }
            
            // Filter applications locally
            const filteredApps = query.trim() 
                ? applications.filter(app => 
                    app.app_name.toLowerCase().includes(query.toLowerCase()) ||
                    (app.description && app.description.toLowerCase().includes(query.toLowerCase()))
                  )
                : applications;
            
            const permissions = this.userPermissions.applications;
            this.ui.renderApplications(filteredApps || [], permissions);
            
        } catch (error) {
            console.error('Failed to search applications:', error);
            this.ui.showToast('Search failed', 'error');
        }
    }

    /**
     * Search credentials
     * @param {string} query - Search query
     */
    async searchCredentials(query) {
        // Implementation depends on current application context
        if (!this.ui.currentApplication) return;
        
        try {
            const { data: credentials, error } = await this.database.getCredentials(this.ui.currentApplication.id);
            
            if (error) {
                throw error;
            }
            
            // Filter credentials locally
            const filteredCreds = query.trim() 
                ? credentials.filter(cred => 
                    cred.username.toLowerCase().includes(query.toLowerCase()) ||
                    (cred.description && cred.description.toLowerCase().includes(query.toLowerCase()))
                  )
                : credentials;
            
            const permissions = this.userPermissions.credentials;
            this.ui.renderCredentials(filteredCreds || [], permissions);
            
        } catch (error) {
            console.error('Failed to search credentials:', error);
            this.ui.showToast('Search failed', 'error');
        }
    }

    // ==================== MODAL HANDLERS ====================

    /**
     * Show add client modal
     */
    showAddClientModal() {
        if (!this.auth.canPerform(this.userProfile.role, 'clients', 'create')) {
            this.ui.showToast('You do not have permission to create clients', 'error');
            return;
        }
        
        // Reset form
        if (this.ui.clientForm) {
            this.ui.clientForm.reset();
            this.ui.clientForm.dataset.mode = 'create';
            delete this.ui.clientForm.dataset.clientId;
        }
        
        // Update modal title
        const modalTitle = this.ui.clientModal?.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Add New Client';
        }
        
        this.ui.showModal(this.ui.clientModal);
    }

    /**
     * Show add application modal
     */
    showAddApplicationModal() {
        if (!this.ui.currentClient) {
            this.ui.showToast('Please select a client first', 'error');
            return;
        }
        
        if (!this.auth.canPerform(this.userProfile.role, 'applications', 'create')) {
            this.ui.showToast('You do not have permission to create applications', 'error');
            return;
        }
        
        // Reset form
        if (this.ui.applicationForm) {
            this.ui.applicationForm.reset();
            this.ui.applicationForm.dataset.mode = 'create';
            delete this.ui.applicationForm.dataset.applicationId;
        }
        
        // Update modal title
        const modalTitle = this.ui.applicationModal?.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Add New Application';
        }
        
        this.ui.showModal(this.ui.applicationModal);
    }

    /**
     * Show add credential modal
     */
    showAddCredentialModal() {
        if (!this.ui.currentApplication) {
            this.ui.showToast('Please select an application first', 'error');
            return;
        }
        
        if (!this.auth.canPerform(this.userProfile.role, 'credentials', 'create')) {
            this.ui.showToast('You do not have permission to create credentials', 'error');
            return;
        }
        
        // Reset form
        if (this.ui.credentialForm) {
            this.ui.credentialForm.reset();
            this.ui.credentialForm.dataset.mode = 'create';
            delete this.ui.credentialForm.dataset.credentialId;
            
            // Generate secure password
            const passwordField = this.ui.credentialForm.querySelector('#credentialPassword');
            if (passwordField) {
                passwordField.value = this.security.generateSecurePassword();
            }
        }
        
        // Update modal title
        const modalTitle = this.ui.credentialModal?.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Add New Credential';
        }
        
        this.ui.showModal(this.ui.credentialModal);
    }

    // ==================== FORM HANDLERS ====================

    /**
     * Handle client form submission
     * @param {Event} e - Form event
     */
    async handleClientSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const clientData = {
            client_name: form.querySelector('#clientName').value,
            company_name: form.querySelector('#companyName').value,
            notes: form.querySelector('#clientNotes').value
        };
        
        const mode = e.target.dataset.mode;
        const clientId = e.target.dataset.clientId;
        
        try {
            this.ui.showLoading(mode === 'create' ? 'Creating client...' : 'Updating client...');
            
            let result;
            if (mode === 'create') {
                result = await this.database.createClient(clientData);
            } else {
                result = await this.database.updateClient(parseInt(clientId), clientData);
            }
            
            if (result.error) {
                throw result.error;
            }
            
            this.ui.showToast(
                mode === 'create' ? 'Client created successfully' : 'Client updated successfully',
                'success'
            );
            
            this.ui.closeModal(this.ui.clientModal);
            await this.loadClients();
            
        } catch (error) {
            console.error('Failed to save client:', error);
            this.ui.showToast('Failed to save client', 'error');
        } finally {
            this.ui.hideLoading();
        }
    }

    /**
     * Handle application form submission
     * @param {Event} e - Form event
     */
    async handleApplicationSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const appData = {
            client_id: this.ui.currentClient.id,
            app_name: form.querySelector('#applicationName').value,
            app_type: form.querySelector('#applicationType').value,
            app_url: form.querySelector('#applicationUrl').value,
            description: form.querySelector('#applicationDescription').value
        };
        
        const mode = e.target.dataset.mode;
        const appId = e.target.dataset.applicationId;
        
        try {
            this.ui.showLoading(mode === 'create' ? 'Creating application...' : 'Updating application...');
            
            let result;
            if (mode === 'create') {
                result = await this.database.createApplication(appData);
            } else {
                result = await this.database.updateApplication(parseInt(appId), appData);
            }
            
            if (result.error) {
                throw result.error;
            }
            
            this.ui.showToast(
                mode === 'create' ? 'Application created successfully' : 'Application updated successfully',
                'success'
            );
            
            this.ui.closeModal(this.ui.applicationModal);
            await this.loadApplications(this.ui.currentClient);
            
        } catch (error) {
            console.error('Failed to save application:', error);
            this.ui.showToast('Failed to save application', 'error');
        } finally {
            this.ui.hideLoading();
        }
    }

    /**
     * Handle credential form submission
     * @param {Event} e - Form event
     */
    async handleCredentialSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const username = form.querySelector('#credentialUsername').value;
        const password = form.querySelector('#credentialPassword').value;
        const url = form.querySelector('#credentialUrl').value;
        const description = form.querySelector('#credentialDescription').value;
        
        try {
            this.ui.showLoading('Encrypting and saving credential...');
            
            // Encrypt password
            const encryptedPassword = await this.security.encryptPassword(password);
            
            const credData = {
                app_id: this.ui.currentApplication.id,
                username: username,
                encrypted_password: encryptedPassword,
                url: url,
                description: description
            };
            
            const mode = e.target.dataset.mode;
            const credId = e.target.dataset.credentialId;
            
            let result;
            if (mode === 'create') {
                result = await this.database.createCredential(credData);
            } else {
                result = await this.database.updateCredential(parseInt(credId), credData);
            }
            
            if (result.error) {
                throw result.error;
            }
            
            this.ui.showToast(
                mode === 'create' ? 'Credential created successfully' : 'Credential updated successfully',
                'success'
            );
            
            this.ui.closeModal(this.ui.credentialModal);
            await this.loadCredentials(this.ui.currentApplication);
            
        } catch (error) {
            console.error('Failed to save credential:', error);
            this.ui.showToast('Failed to save credential', 'error');
        } finally {
            this.ui.hideLoading();
        }
    }

    /**
     * Handle user form submission
     * @param {Event} e - Form event
     */
    async handleUserSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const userId = form.querySelector('#userId').value;
        const newRole = form.querySelector('#userRole').value;
        
        try {
            this.ui.showLoading('Updating user role...');
            
            const { data, error } = await this.database.updateUserRole(userId, newRole);
            
            if (error) {
                throw error;
            }
            
            this.ui.showToast('User role updated successfully', 'success');
            this.ui.closeModal(this.ui.userModal);
            await this.loadUsers();
            
        } catch (error) {
            console.error('Failed to update user role:', error);
            this.ui.showToast('Failed to update user role', 'error');
        } finally {
            this.ui.hideLoading();
        }
    }

    // ==================== EDIT FUNCTIONS ====================

    /**
     * Edit client
     * @param {number} clientId - Client ID
     */
    async editClient(clientId) {
        try {
            const { data: client, error } = await this.database.getClientById(clientId);
            
            if (error || !client) {
                throw new Error('Client not found');
            }
            
            // Populate form
            if (this.ui.clientForm) {
                this.ui.clientForm.querySelector('#clientName').value = client.client_name || '';
                this.ui.clientForm.querySelector('#companyName').value = client.company_name || '';
                this.ui.clientForm.querySelector('#clientNotes').value = client.notes || '';
                
                this.ui.clientForm.dataset.mode = 'edit';
                this.ui.clientForm.dataset.clientId = clientId;
            }
            
            // Update modal title
            const modalTitle = this.ui.clientModal?.querySelector('.modal-title');
            if (modalTitle) {
                modalTitle.textContent = 'Edit Client';
            }
            
            this.ui.showModal(this.ui.clientModal);
            
        } catch (error) {
            console.error('Failed to load client for editing:', error);
            this.ui.showToast('Failed to load client', 'error');
        }
    }

    /**
     * Edit application
     * @param {number} appId - Application ID
     */
    async editApplication(appId) {
        try {
            const { data: app, error } = await this.database.getApplicationById(appId);
            
            if (error || !app) {
                throw new Error('Application not found');
            }
            
            // Populate form
            if (this.ui.applicationForm) {
                this.ui.applicationForm.querySelector('#applicationName').value = app.app_name || '';
                this.ui.applicationForm.querySelector('#applicationType').value = app.app_type || '';
                this.ui.applicationForm.querySelector('#applicationUrl').value = app.app_url || '';
                this.ui.applicationForm.querySelector('#applicationDescription').value = app.description || '';
                
                this.ui.applicationForm.dataset.mode = 'edit';
                this.ui.applicationForm.dataset.applicationId = appId;
            }
            
            // Update modal title
            const modalTitle = this.ui.applicationModal?.querySelector('.modal-title');
            if (modalTitle) {
                modalTitle.textContent = 'Edit Application';
            }
            
            this.ui.showModal(this.ui.applicationModal);
            
        } catch (error) {
            console.error('Failed to load application for editing:', error);
            this.ui.showToast('Failed to load application', 'error');
        }
    }

    /**
     * Edit credential
     * @param {number} credId - Credential ID
     */
    async editCredential(credId) {
        try {
            const { data: cred, error } = await this.database.getCredentialById(credId);
            
            if (error || !cred) {
                throw new Error('Credential not found');
            }
            
            // Decrypt password
            const decryptedPassword = await this.security.decryptPassword(cred.encrypted_password);
            
            // Populate form
            if (this.ui.credentialForm) {
                this.ui.credentialForm.querySelector('#credentialUsername').value = cred.username || '';
                this.ui.credentialForm.querySelector('#credentialPassword').value = decryptedPassword || '';
                this.ui.credentialForm.querySelector('#credentialUrl').value = cred.url || '';
                this.ui.credentialForm.querySelector('#credentialDescription').value = cred.description || '';
                
                this.ui.credentialForm.dataset.mode = 'edit';
                this.ui.credentialForm.dataset.credentialId = credId;
            }
            
            // Update modal title
            const modalTitle = this.ui.credentialModal?.querySelector('.modal-title');
            if (modalTitle) {
                modalTitle.textContent = 'Edit Credential';
            }
            
            this.ui.showModal(this.ui.credentialModal);
            
        } catch (error) {
            console.error('Failed to load credential for editing:', error);
            this.ui.showToast('Failed to load credential', 'error');
        }
    }

    /**
     * Edit user role
     * @param {string} userId - User ID
     * @param {string} currentRole - Current role
     */
    editUserRole(userId, currentRole) {
        if (!this.auth.canPerform(this.userProfile.role, 'users', 'update')) {
            this.ui.showToast('You do not have permission to edit user roles', 'error');
            return;
        }
        
        // Populate form
        if (this.ui.userForm) {
            this.ui.userForm.querySelector('#userId').value = userId;
            this.ui.userForm.querySelector('#userRole').value = currentRole;
        }
        
        this.ui.showModal(this.ui.userModal);
    }

    // ==================== DELETE FUNCTIONS ====================

    /**
     * Delete client
     * @param {number} clientId - Client ID
     */
    deleteClient(clientId) {
        if (!this.auth.canPerform(this.userProfile.role, 'clients', 'delete')) {
            this.ui.showToast('You do not have permission to delete clients', 'error');
            return;
        }
        
        this.ui.showConfirmModal(
            'Delete Client',
            'Are you sure you want to delete this client? This will also delete all associated applications and credentials.',
            async () => {
                try {
                    this.ui.showLoading('Deleting client...');
                    
                    const { error } = await this.database.deleteClient(clientId);
                    
                    if (error) {
                        throw error;
                    }
                    
                    this.ui.showToast('Client deleted successfully', 'success');
                    await this.loadClients();
                    
                } catch (error) {
                    console.error('Failed to delete client:', error);
                    this.ui.showToast('Failed to delete client', 'error');
                } finally {
                    this.ui.hideLoading();
                }
            },
            'Delete',
            'btn-danger'
        );
    }

    /**
     * Delete application
     * @param {number} appId - Application ID
     */
    deleteApplication(appId) {
        if (!this.auth.canPerform(this.userProfile.role, 'applications', 'delete')) {
            this.ui.showToast('You do not have permission to delete applications', 'error');
            return;
        }
        
        this.ui.showConfirmModal(
            'Delete Application',
            'Are you sure you want to delete this application? This will also delete all associated credentials.',
            async () => {
                try {
                    this.ui.showLoading('Deleting application...');
                    
                    const { error } = await this.database.deleteApplication(appId);
                    
                    if (error) {
                        throw error;
                    }
                    
                    this.ui.showToast('Application deleted successfully', 'success');
                    await this.loadApplications(this.ui.currentClient);
                    
                } catch (error) {
                    console.error('Failed to delete application:', error);
                    this.ui.showToast('Failed to delete application', 'error');
                } finally {
                    this.ui.hideLoading();
                }
            },
            'Delete',
            'btn-danger'
        );
    }

    /**
     * Delete credential
     * @param {number} credId - Credential ID
     */
    deleteCredential(credId) {
        if (!this.auth.canPerform(this.userProfile.role, 'credentials', 'delete')) {
            this.ui.showToast('You do not have permission to delete credentials', 'error');
            return;
        }
        
        this.ui.showConfirmModal(
            'Delete Credential',
            'Are you sure you want to delete this credential? This action cannot be undone.',
            async () => {
                try {
                    this.ui.showLoading('Deleting credential...');
                    
                    const { error } = await this.database.deleteCredential(credId);
                    
                    if (error) {
                        throw error;
                    }
                    
                    this.ui.showToast('Credential deleted successfully', 'success');
                    await this.loadCredentials(this.ui.currentApplication);
                    
                } catch (error) {
                    console.error('Failed to delete credential:', error);
                    this.ui.showToast('Failed to delete credential', 'error');
                } finally {
                    this.ui.hideLoading();
                }
            },
            'Delete',
            'btn-danger'
        );
    }

    // ==================== CLIPBOARD FUNCTIONS ====================

    /**
     * Copy username to clipboard
     * @param {string} username - Username to copy
     */
    async copyUsername(username) {
        try {
            await this.clipboard.copyUsername(username);
            this.ui.showToast('Username copied to clipboard', 'success');
        } catch (error) {
            console.error('Failed to copy username:', error);
            this.ui.showToast('Failed to copy username', 'error');
        }
    }

    /**
     * Copy password to clipboard
     * @param {number} credId - Credential ID
     */
    async copyPassword(credId) {
        try {
            this.ui.showLoading('Decrypting password...');
            
            const { data: cred, error } = await this.database.getCredentialById(credId);
            
            if (error || !cred) {
                throw new Error('Credential not found');
            }
            
            const decryptedPassword = await this.security.decryptPassword(cred.encrypted_password);
            await this.clipboard.copyPassword(decryptedPassword);
            
            this.ui.showToast('Password copied to clipboard', 'success');
            
        } catch (error) {
            console.error('Failed to copy password:', error);
            this.ui.showToast('Failed to copy password', 'error');
        } finally {
            this.ui.hideLoading();
        }
    }

    /**
     * Copy URL to clipboard
     * @param {string} url - URL to copy
     */
    async copyUrl(url) {
        try {
            await this.clipboard.copyUrl(url);
            this.ui.showToast('URL copied to clipboard', 'success');
        } catch (error) {
            console.error('Failed to copy URL:', error);
            this.ui.showToast('Failed to copy URL', 'error');
        }
    }

    // ==================== CLEANUP ====================

    /**
     * Cleanup resources
     */
    destroy() {
        // Clear session monitoring
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
        }
        
        // Clear caches
        if (this.database) {
            this.database.clearAllCaches();
        }
        
        // Clear sensitive data
        this.currentUser = null;
        this.userProfile = null;
        this.userPermissions = null;
        
        console.log('LaliLink app destroyed');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.laliApp = new LaliLinkApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LaliLinkApp;
}