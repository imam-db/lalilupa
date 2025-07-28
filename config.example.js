// Configuration file for LaliLink
// Copy this file to config.js and fill in your actual values
const CONFIG = {
    SUPABASE: {
        // Replace with your actual Supabase URL and anon key
        URL: 'YOUR_SUPABASE_URL_HERE',
        ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE'
    },
    
    // Application settings
    APP: {
        NAME: 'LaliLink',
        VERSION: '1.0.0',
        DESCRIPTION: 'Client-based credential management application'
    },
    
    // Security settings
    SECURITY: {
        ENCRYPTION_ALGORITHM: 'AES-GCM',
        KEY_LENGTH: 256,
        IV_LENGTH: 12
    },
    
    // UI settings
    UI: {
        TOAST_DURATION: 3000,
        MODAL_ANIMATION_DURATION: 300,
        DEBOUNCE_DELAY: 300
    },
    
    // Role definitions
    ROLES: {
        ADMIN: 'admin',
        VIEWER: 'viewer'
    },
    
    // Default permissions
    PERMISSIONS: {
        admin: {
            clients: ['create', 'read', 'update', 'delete'],
            applications: ['create', 'read', 'update', 'delete'],
            credentials: ['create', 'read', 'update', 'delete'],
            users: ['read', 'update']
        },
        viewer: {
            clients: ['read'],
            applications: ['read'],
            credentials: ['read'],
            users: []
        }
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
    window.LALI_CONFIG = CONFIG;
}