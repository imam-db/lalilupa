/**
 * DatabaseManager - Handles all database operations with Supabase
 * Implements CRUD operations for clients, applications, credentials, and user management
 */
class DatabaseManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.cache = {
            clients: null,
            applications: {},
            credentials: {},
            users: null
        };
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.lastCacheUpdate = {};
    }

    /**
     * Check if cache is valid for a given key
     * @param {string} key - Cache key
     * @returns {boolean} Is cache valid
     */
    isCacheValid(key) {
        const lastUpdate = this.lastCacheUpdate[key];
        if (!lastUpdate) return false;
        return (Date.now() - lastUpdate) < this.cacheTimeout;
    }

    /**
     * Update cache for a given key
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     */
    updateCache(key, data) {
        this.cache[key] = data;
        this.lastCacheUpdate[key] = Date.now();
    }

    /**
     * Clear cache for a given key or all cache
     * @param {string} key - Cache key (optional)
     */
    clearCache(key = null) {
        if (key) {
            this.cache[key] = null;
            delete this.lastCacheUpdate[key];
        } else {
            this.cache = {
                clients: null,
                applications: {},
                credentials: {},
                users: null
            };
            this.lastCacheUpdate = {};
        }
    }

    // ==================== USER PROFILE OPERATIONS ====================

    /**
     * Get user profile by user ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Database result
     */
    async getUserProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            return { data, error };
        } catch (error) {
            console.error('Failed to get user profile:', error);
            return { data: null, error };
        }
    }

    /**
     * Update user role (Admin only)
     * @param {string} userId - User ID
     * @param {string} newRole - New role
     * @returns {Promise<Object>} Database result
     */
    async updateUserRole(userId, newRole) {
        try {
            if (!['admin', 'viewer'].includes(newRole)) {
                throw new Error('Invalid role specified');
            }

            const { data, error } = await this.supabase
                .from('user_profiles')
                .update({ 
                    role: newRole, 
                    updated_at: new Date().toISOString() 
                })
                .eq('user_id', userId)
                .select();

            if (!error) {
                this.clearCache('users');
            }

            return { data, error };
        } catch (error) {
            console.error('Failed to update user role:', error);
            return { data: null, error };
        }
    }

    /**
     * Get all users with their profiles (Admin only)
     * @param {boolean} useCache - Whether to use cache
     * @returns {Promise<Object>} Database result
     */
    async getAllUsers(useCache = true) {
        try {
            // Check cache first
            if (useCache && this.isCacheValid('users') && this.cache.users) {
                return { data: this.cache.users, error: null };
            }

            const { data, error } = await this.supabase
                .from('user_profiles')
                .select(`
                    *,
                    user_id
                `)
                .order('created_at', { ascending: false });

            if (!error && data) {
                // Get user emails from auth.users (this might need adjustment based on RLS)
                const enrichedData = await Promise.all(
                    data.map(async (profile) => {
                        try {
                            // Note: Getting user email from auth.users might require admin privileges
                            // For now, we'll use the user_id and try to get email from current session
                            return {
                                ...profile,
                                email: profile.user_id // Placeholder - adjust based on your setup
                            };
                        } catch (err) {
                            return profile;
                        }
                    })
                );

                this.updateCache('users', enrichedData);
                return { data: enrichedData, error: null };
            }

            return { data, error };
        } catch (error) {
            console.error('Failed to get all users:', error);
            return { data: null, error };
        }
    }

    // ==================== CLIENT OPERATIONS ====================

    /**
     * Get all clients for current user
     * @param {boolean} useCache - Whether to use cache
     * @returns {Promise<Object>} Database result
     */
    async getClients(useCache = true) {
        try {
            // Check cache first
            if (useCache && this.isCacheValid('clients') && this.cache.clients) {
                return { data: this.cache.clients, error: null };
            }

            const { data, error } = await this.supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                this.updateCache('clients', data);
            }

            return { data, error };
        } catch (error) {
            console.error('Failed to get clients:', error);
            return { data: null, error };
        }
    }

    /**
     * Get client by ID
     * @param {number} clientId - Client ID
     * @returns {Promise<Object>} Database result
     */
    async getClientById(clientId) {
        try {
            const { data, error } = await this.supabase
                .from('clients')
                .select('*')
                .eq('id', clientId)
                .single();

            return { data, error };
        } catch (error) {
            console.error('Failed to get client by ID:', error);
            return { data: null, error };
        }
    }

    /**
     * Create new client
     * @param {Object} clientData - Client data
     * @returns {Promise<Object>} Database result
     */
    async createClient(clientData) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const newClient = {
                ...clientData,
                user_id: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('clients')
                .insert([newClient])
                .select()
                .single();

            if (!error) {
                this.clearCache('clients');
            }

            return { data, error };
        } catch (error) {
            console.error('Failed to create client:', error);
            return { data: null, error };
        }
    }

    /**
     * Update client
     * @param {number} id - Client ID
     * @param {Object} clientData - Updated client data
     * @returns {Promise<Object>} Database result
     */
    async updateClient(id, clientData) {
        try {
            const { data, error } = await this.supabase
                .from('clients')
                .update({ 
                    ...clientData, 
                    updated_at: new Date().toISOString() 
                })
                .eq('id', id)
                .select()
                .single();

            if (!error) {
                this.clearCache('clients');
                this.clearCache('applications');
            }

            return { data, error };
        } catch (error) {
            console.error('Failed to update client:', error);
            return { data: null, error };
        }
    }

    /**
     * Delete client
     * @param {number} id - Client ID
     * @returns {Promise<Object>} Database result
     */
    async deleteClient(id) {
        try {
            const { data, error } = await this.supabase
                .from('clients')
                .delete()
                .eq('id', id)
                .select();

            if (!error) {
                this.clearCache('clients');
                this.clearCache('applications');
                this.clearCache('credentials');
            }

            return { data, error };
        } catch (error) {
            console.error('Failed to delete client:', error);
            return { data: null, error };
        }
    }

    /**
     * Search clients
     * @param {string} query - Search query
     * @returns {Promise<Object>} Database result
     */
    async searchClients(query) {
        try {
            const { data, error } = await this.supabase
                .from('clients')
                .select('*')
                .or(`client_name.ilike.%${query}%,company_name.ilike.%${query}%`)
                .order('created_at', { ascending: false });

            return { data, error };
        } catch (error) {
            console.error('Failed to search clients:', error);
            return { data: null, error };
        }
    }

    // ==================== APPLICATION OPERATIONS ====================

    /**
     * Get applications for a client
     * @param {number} clientId - Client ID
     * @param {boolean} useCache - Whether to use cache
     * @returns {Promise<Object>} Database result
     */
    async getApplications(clientId, useCache = true) {
        try {
            const cacheKey = `applications_${clientId}`;
            
            // Check cache first
            if (useCache && this.isCacheValid(cacheKey) && this.cache.applications[clientId]) {
                return { data: this.cache.applications[clientId], error: null };
            }

            const { data, error } = await this.supabase
                .from('applications')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                this.cache.applications[clientId] = data;
                this.lastCacheUpdate[cacheKey] = Date.now();
            }

            return { data, error };
        } catch (error) {
            console.error('Failed to get applications:', error);
            return { data: null, error };
        }
    }

    /**
     * Get application by ID
     * @param {number} appId - Application ID
     * @returns {Promise<Object>} Database result
     */
    async getApplicationById(appId) {
        try {
            const { data, error } = await this.supabase
                .from('applications')
                .select('*')
                .eq('id', appId)
                .single();

            return { data, error };
        } catch (error) {
            console.error('Failed to get application by ID:', error);
            return { data: null, error };
        }
    }

    /**
     * Create new application
     * @param {Object} appData - Application data
     * @returns {Promise<Object>} Database result
     */
    async createApplication(appData) {
        try {
            const newApp = {
                ...appData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('applications')
                .insert([newApp])
                .select()
                .single();

            if (!error) {
                // Clear cache for this client's applications
                delete this.cache.applications[appData.client_id];
            }

            return { data, error };
        } catch (error) {
            console.error('Failed to create application:', error);
            return { data: null, error };
        }
    }

    /**
     * Update application
     * @param {number} id - Application ID
     * @param {Object} appData - Updated application data
     * @returns {Promise<Object>} Database result
     */
    async updateApplication(id, appData) {
        try {
            const { data, error } = await this.supabase
                .from('applications')
                .update({ 
                    ...appData, 
                    updated_at: new Date().toISOString() 
                })
                .eq('id', id)
                .select()
                .single();

            if (!error) {
                // Clear applications cache
                this.cache.applications = {};
                this.clearCache('credentials');
            }

            return { data, error };
        } catch (error) {
            console.error('Failed to update application:', error);
            return { data: null, error };
        }
    }

    /**
     * Delete application
     * @param {number} id - Application ID
     * @returns {Promise<Object>} Database result
     */
    async deleteApplication(id) {
        try {
            const { data, error } = await this.supabase
                .from('applications')
                .delete()
                .eq('id', id)
                .select();

            if (!error) {
                // Clear applications and credentials cache
                this.cache.applications = {};
                this.clearCache('credentials');
            }

            return { data, error };
        } catch (error) {
            console.error('Failed to delete application:', error);
            return { data: null, error };
        }
    }

    // ==================== CREDENTIAL OPERATIONS ====================

    /**
     * Get credentials for an application
     * @param {number} appId - Application ID
     * @param {boolean} useCache - Whether to use cache
     * @returns {Promise<Object>} Database result
     */
    async getCredentials(appId, useCache = true) {
        try {
            const cacheKey = `credentials_${appId}`;
            
            // Check cache first
            if (useCache && this.isCacheValid(cacheKey) && this.cache.credentials[appId]) {
                return { data: this.cache.credentials[appId], error: null };
            }

            const { data, error } = await this.supabase
                .from('credentials')
                .select('*')
                .eq('app_id', appId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                this.cache.credentials[appId] = data;
                this.lastCacheUpdate[cacheKey] = Date.now();
            }

            return { data, error };
        } catch (error) {
            console.error('Failed to get credentials:', error);
            return { data: null, error };
        }
    }

    /**
     * Get credential by ID
     * @param {number} credId - Credential ID
     * @returns {Promise<Object>} Database result
     */
    async getCredentialById(credId) {
        try {
            const { data, error } = await this.supabase
                .from('credentials')
                .select('*')
                .eq('id', credId)
                .single();

            return { data, error };
        } catch (error) {
            console.error('Failed to get credential by ID:', error);
            return { data: null, error };
        }
    }

    /**
     * Create new credential
     * @param {Object} credData - Credential data (password should be encrypted)
     * @returns {Promise<Object>} Database result
     */
    async createCredential(credData) {
        try {
            const newCred = {
                ...credData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('credentials')
                .insert([newCred])
                .select()
                .single();

            if (!error) {
                // Clear cache for this app's credentials
                delete this.cache.credentials[credData.app_id];
            }

            return { data, error };
        } catch (error) {
            console.error('Failed to create credential:', error);
            return { data: null, error };
        }
    }

    /**
     * Update credential
     * @param {number} id - Credential ID
     * @param {Object} credData - Updated credential data
     * @returns {Promise<Object>} Database result
     */
    async updateCredential(id, credData) {
        try {
            const { data, error } = await this.supabase
                .from('credentials')
                .update({ 
                    ...credData, 
                    updated_at: new Date().toISOString() 
                })
                .eq('id', id)
                .select()
                .single();

            if (!error) {
                // Clear credentials cache
                this.clearCache('credentials');
            }

            return { data, error };
        } catch (error) {
            console.error('Failed to update credential:', error);
            return { data: null, error };
        }
    }

    /**
     * Delete credential
     * @param {number} id - Credential ID
     * @returns {Promise<Object>} Database result
     */
    async deleteCredential(id) {
        try {
            const { data, error } = await this.supabase
                .from('credentials')
                .delete()
                .eq('id', id)
                .select();

            if (!error) {
                // Clear credentials cache
                this.clearCache('credentials');
            }

            return { data, error };
        } catch (error) {
            console.error('Failed to delete credential:', error);
            return { data: null, error };
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Test database connection
     * @returns {Promise<boolean>} Connection status
     */
    async testConnection() {
        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('count')
                .limit(1);

            return !error;
        } catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }

    /**
     * Get database statistics
     * @returns {Promise<Object>} Statistics
     */
    async getStatistics() {
        try {
            const [clientsResult, appsResult, credsResult] = await Promise.all([
                this.supabase.from('clients').select('id', { count: 'exact', head: true }),
                this.supabase.from('applications').select('id', { count: 'exact', head: true }),
                this.supabase.from('credentials').select('id', { count: 'exact', head: true })
            ]);

            return {
                clients: clientsResult.count || 0,
                applications: appsResult.count || 0,
                credentials: credsResult.count || 0
            };
        } catch (error) {
            console.error('Failed to get statistics:', error);
            return {
                clients: 0,
                applications: 0,
                credentials: 0
            };
        }
    }

    /**
     * Clear all caches
     */
    clearAllCaches() {
        this.clearCache();
    }

    /**
     * Get cache status
     * @returns {Object} Cache status
     */
    getCacheStatus() {
        return {
            clients: this.isCacheValid('clients'),
            applications: Object.keys(this.cache.applications).length,
            credentials: Object.keys(this.cache.credentials).length,
            users: this.isCacheValid('users'),
            lastUpdate: this.lastCacheUpdate
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseManager;
}