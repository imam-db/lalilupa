// Configuration file for LaliLink
// Copy this file to config.js and fill in your actual values
// This file reads from environment variables for sensitive data

// Helper function to get environment variables
function getEnvVar(key, defaultValue = null) {
    // For Node.js environment
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key] || defaultValue;
    }
    
    // For browser environment with injected env vars
    if (typeof window !== 'undefined' && window.ENV) {
        return window.ENV[key] || defaultValue;
    }
    
    // For Vite/build tools (browser context)
    if (typeof window !== 'undefined' && window.import && window.import.meta && window.import.meta.env) {
        return window.import.meta.env[key] || defaultValue;
    }
    
    return defaultValue;
}

const CONFIG = {
    SUPABASE: {
        // Read from environment variables - set these in your .env file
        URL: getEnvVar('VITE_SUPABASE_URL', 'YOUR_SUPABASE_URL_HERE'),
        ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY', 'YOUR_SUPABASE_ANON_KEY_HERE')
    },
    
    // Application settings
    APP: {
        NAME: 'LaliLink',
        VERSION: '1.0.0',
        DESCRIPTION: 'Client-based credential management application',
        ENV: getEnvVar('VITE_APP_ENV', 'development'),
        DEBUG: getEnvVar('VITE_APP_DEBUG', 'true') === 'true'
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

// Validation function to check if required environment variables are set
CONFIG.validateEnvironment = function() {
    const requiredVars = {
        'VITE_SUPABASE_URL': this.SUPABASE.URL,
        'VITE_SUPABASE_ANON_KEY': this.SUPABASE.ANON_KEY
    };
    
    const missing = [];
    const placeholder = [];
    
    for (const [key, value] of Object.entries(requiredVars)) {
        if (!value) {
            missing.push(key);
        } else if (value.includes('YOUR_') || value.includes('_HERE')) {
            placeholder.push(key);
        }
    }
    
    if (missing.length > 0) {
        console.error('Missing required environment variables:', missing);
        return false;
    }
    
    if (placeholder.length > 0) {
        console.warn('Environment variables still contain placeholder values:', placeholder);
        console.warn('Please update your .env file with actual values');
        return false;
    }
    
    return true;
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
    window.LALI_CONFIG = CONFIG;
    
    // Auto-validate in browser environment
    if (CONFIG.APP.DEBUG) {
        console.log('LaliLink Config loaded:', {
            environment: CONFIG.APP.ENV,
            debug: CONFIG.APP.DEBUG,
            supabaseConfigured: CONFIG.validateEnvironment()
        });
    }
}