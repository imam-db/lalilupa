/**
 * AuthManager - Handles authentication and user profile management
 * Integrates with Supabase Auth and implements Role-Based Access Control
 */
class AuthManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.user = null;
        this.userProfile = null;
        this.authStateListeners = [];
        this.sessionCheckInterval = null;
        
        // Bind methods to preserve context
        this.onAuthStateChange = this.onAuthStateChange.bind(this);
    }

    /**
     * Initialize authentication manager
     */
    async init() {
        try {
            // Check current session
            await this.getCurrentUser();
            
            // Set up auth state listener
            this.supabase.auth.onAuthStateChange(this.onAuthStateChange);
            
            // Set up periodic session check
            this.startSessionCheck();
            
            console.log('AuthManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize AuthManager:', error);
            throw error;
        }
    }

    /**
     * Sign in with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Auth result
     */
    async signIn(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email dan password harus diisi');
            }

            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password: password
            });

            if (error) {
                throw error;
            }

            // Load user profile after successful login
            if (data.user) {
                this.user = data.user;
                await this.loadUserProfile();
            }

            return { data, error: null };
        } catch (error) {
            console.error('Sign in failed:', error);
            return { 
                data: null, 
                error: {
                    message: this.getLocalizedErrorMessage(error.message)
                }
            };
        }
    }

    /**
     * Sign up with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Auth result
     */
    async signUp(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email dan password harus diisi');
            }

            // Validate password strength
            if (window.app && window.app.security) {
                const validation = window.app.security.validatePasswordStrength(password);
                if (!validation.isValid) {
                    throw new Error(`Password tidak cukup kuat: ${validation.feedback.join(', ')}`);
                }
            }

            const { data, error } = await this.supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password: password
            });

            if (error) {
                throw error;
            }

            return { data, error: null };
        } catch (error) {
            console.error('Sign up failed:', error);
            return { 
                data: null, 
                error: {
                    message: this.getLocalizedErrorMessage(error.message)
                }
            };
        }
    }

    /**
     * Sign out current user
     * @returns {Promise<Object>} Sign out result
     */
    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            
            if (!error) {
                this.user = null;
                this.userProfile = null;
                this.stopSessionCheck();
                
                // Clear any cached data
                this.clearUserData();
            }

            return { error };
        } catch (error) {
            console.error('Sign out failed:', error);
            return { error };
        }
    }

    /**
     * Get current authenticated user
     * @returns {Promise<Object|null>} Current user
     */
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();
            
            if (error) {
                throw error;
            }

            this.user = user;
            
            if (user) {
                await this.loadUserProfile();
            }

            return user;
        } catch (error) {
            console.error('Failed to get current user:', error);
            this.user = null;
            this.userProfile = null;
            return null;
        }
    }

    /**
     * Load user profile with role information
     * @returns {Promise<Object|null>} User profile
     */
    async loadUserProfile() {
        if (!this.user) {
            return null;
        }

        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', this.user.id)
                .single();

            if (error) {
                // If profile doesn't exist, create it
                if (error.code === 'PGRST116') {
                    return await this.createUserProfile();
                }
                throw error;
            }

            this.userProfile = data;
            return data;
        } catch (error) {
            console.error('Failed to load user profile:', error);
            return null;
        }
    }

    /**
     * Create user profile for new user
     * @returns {Promise<Object|null>} Created profile
     */
    async createUserProfile() {
        if (!this.user) {
            throw new Error('No authenticated user');
        }

        try {
            const profileData = {
                user_id: this.user.id,
                role: 'viewer', // Default role
                permissions: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('user_profiles')
                .insert([profileData])
                .select()
                .single();

            if (error) {
                throw error;
            }

            this.userProfile = data;
            return data;
        } catch (error) {
            console.error('Failed to create user profile:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {Object} updates - Profile updates
     * @returns {Promise<Object>} Update result
     */
    async updateUserProfile(updates) {
        if (!this.user || !this.userProfile) {
            throw new Error('No authenticated user or profile');
        }

        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', this.user.id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            this.userProfile = data;
            return { data, error: null };
        } catch (error) {
            console.error('Failed to update user profile:', error);
            return { data: null, error };
        }
    }

    /**
     * Get user role
     * @returns {string} User role
     */
    getUserRole() {
        return this.userProfile?.role || 'viewer';
    }

    /**
     * Get user email
     * @returns {string} User email
     */
    getUserEmail() {
        return this.user?.email || '';
    }

    /**
     * Get user ID
     * @returns {string} User ID
     */
    getUserId() {
        return this.user?.id || null;
    }

    /**
     * Check if user is admin
     * @returns {boolean} Is admin
     */
    isAdmin() {
        return this.getUserRole() === 'admin';
    }

    /**
     * Check if user is viewer
     * @returns {boolean} Is viewer
     */
    isViewer() {
        return this.getUserRole() === 'viewer';
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Is authenticated
     */
    isAuthenticated() {
        return !!(this.user && this.userProfile);
    }

    /**
     * Check if user can perform action
     * @param {string} resource - Resource type (clients, applications, credentials, users)
     * @param {string} action - Action type (create, read, update, delete)
     * @returns {boolean} Can perform action
     */
    canPerform(resource, action) {
        if (!this.isAuthenticated()) {
            return false;
        }

        const role = this.getUserRole();
        const permissions = CONFIG.PERMISSIONS[role];
        
        if (!permissions || !permissions[resource]) {
            return false;
        }

        return permissions[resource].includes(action);
    }

    /**
     * Check create permission
     * @param {string} resource - Resource type
     * @returns {boolean} Can create
     */
    canCreate(resource = 'clients') {
        return this.canPerform(resource, 'create');
    }

    /**
     * Check read permission
     * @param {string} resource - Resource type
     * @returns {boolean} Can read
     */
    canRead(resource = 'clients') {
        return this.canPerform(resource, 'read');
    }

    /**
     * Check update permission
     * @param {string} resource - Resource type
     * @returns {boolean} Can update
     */
    canUpdate(resource = 'clients') {
        return this.canPerform(resource, 'update');
    }

    /**
     * Check delete permission
     * @param {string} resource - Resource type
     * @returns {boolean} Can delete
     */
    canDelete(resource = 'clients') {
        return this.canPerform(resource, 'delete');
    }

    /**
     * Get user permissions based on role
     * @returns {Object} User permissions object
     */
    getUserPermissions() {
        if (!this.isAuthenticated()) {
            return {
                clients: { canCreate: false, canRead: false, canUpdate: false, canDelete: false },
                applications: { canCreate: false, canRead: false, canUpdate: false, canDelete: false },
                credentials: { canCreate: false, canRead: false, canUpdate: false, canDelete: false },
                users: { canCreate: false, canRead: false, canUpdate: false, canDelete: false }
            };
        }

        const role = this.getUserRole();
        const permissions = CONFIG.PERMISSIONS[role] || {};
        
        return {
            clients: {
                canCreate: this.canCreate('clients'),
                canRead: this.canRead('clients'),
                canUpdate: this.canUpdate('clients'),
                canDelete: this.canDelete('clients')
            },
            applications: {
                canCreate: this.canCreate('applications'),
                canRead: this.canRead('applications'),
                canUpdate: this.canUpdate('applications'),
                canDelete: this.canDelete('applications')
            },
            credentials: {
                canCreate: this.canCreate('credentials'),
                canRead: this.canRead('credentials'),
                canUpdate: this.canUpdate('credentials'),
                canDelete: this.canDelete('credentials')
            },
            users: {
                canCreate: this.canCreate('users'),
                canRead: this.canRead('users'),
                canUpdate: this.canUpdate('users'),
                canDelete: this.canDelete('users')
            }
        };
    }

    /**
     * Handle auth state changes
     * @param {string} event - Auth event
     * @param {Object} session - Session data
     */
    async onAuthStateChange(event, session) {
        console.log('Auth state changed:', event);
        
        try {
            if (event === 'SIGNED_IN' && session?.user) {
                this.user = session.user;
                await this.loadUserProfile();
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
                this.userProfile = null;
                this.clearUserData();
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                this.user = session.user;
                // Profile should still be valid, but refresh if needed
                if (!this.userProfile) {
                    await this.loadUserProfile();
                }
            }

            // Notify listeners
            this.notifyAuthStateListeners(event, session);
        } catch (error) {
            console.error('Error handling auth state change:', error);
        }
    }

    /**
     * Add auth state change listener
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    addAuthStateListener(callback) {
        this.authStateListeners.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.authStateListeners.indexOf(callback);
            if (index > -1) {
                this.authStateListeners.splice(index, 1);
            }
        };
    }

    /**
     * Notify auth state listeners
     * @param {string} event - Auth event
     * @param {Object} session - Session data
     */
    notifyAuthStateListeners(event, session) {
        this.authStateListeners.forEach(callback => {
            try {
                callback(event, session);
            } catch (error) {
                console.error('Error in auth state listener:', error);
            }
        });
    }

    /**
     * Start periodic session check
     */
    startSessionCheck() {
        // Check session every 5 minutes
        this.sessionCheckInterval = setInterval(async () => {
            try {
                await this.getCurrentUser();
            } catch (error) {
                console.error('Session check failed:', error);
            }
        }, 5 * 60 * 1000);
    }

    /**
     * Stop periodic session check
     */
    stopSessionCheck() {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
        }
    }

    /**
     * Clear user data from memory and storage
     */
    clearUserData() {
        // Clear session storage
        try {
            sessionStorage.removeItem('clipboard_audit');
            // Add other session data cleanup here
        } catch (error) {
            console.error('Failed to clear session data:', error);
        }
    }

    /**
     * Get localized error message
     * @param {string} errorMessage - Original error message
     * @returns {string} Localized message
     */
    getLocalizedErrorMessage(errorMessage) {
        const errorMap = {
            'Invalid login credentials': 'Email atau password salah',
            'Email not confirmed': 'Email belum dikonfirmasi',
            'User already registered': 'Email sudah terdaftar',
            'Password should be at least 6 characters': 'Password minimal 6 karakter',
            'Invalid email': 'Format email tidak valid',
            'Network error': 'Koneksi bermasalah, coba lagi',
            'Too many requests': 'Terlalu banyak percobaan, coba lagi nanti'
        };

        return errorMap[errorMessage] || errorMessage || 'Terjadi kesalahan';
    }

    /**
     * Reset password
     * @param {string} email - User email
     * @returns {Promise<Object>} Reset result
     */
    async resetPassword(email) {
        try {
            const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            return { data, error };
        } catch (error) {
            console.error('Password reset failed:', error);
            return { data: null, error };
        }
    }

    /**
     * Update password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Update result
     */
    async updatePassword(newPassword) {
        try {
            // Validate password strength
            if (window.app && window.app.security) {
                const validation = window.app.security.validatePasswordStrength(newPassword);
                if (!validation.isValid) {
                    throw new Error(`Password tidak cukup kuat: ${validation.feedback.join(', ')}`);
                }
            }

            const { data, error } = await this.supabase.auth.updateUser({
                password: newPassword
            });

            return { data, error };
        } catch (error) {
            console.error('Password update failed:', error);
            return { data: null, error };
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.stopSessionCheck();
        this.authStateListeners = [];
        this.user = null;
        this.userProfile = null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}