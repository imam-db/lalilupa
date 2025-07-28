#!/usr/bin/env node
// Build script untuk menggenerate config.js dengan environment variables
// Digunakan untuk deployment di Vercel dan platform hosting lainnya

const fs = require('fs');
const path = require('path');

// Fungsi untuk mendapatkan environment variables
function getEnvVar(key, defaultValue = null) {
    return process.env[key] || defaultValue;
}

// Template config.js dengan environment variables yang sudah diinjeksi
const configTemplate = `// Configuration file for LaliLink - Generated at build time
// DO NOT EDIT - This file is auto-generated from build-config.js

const CONFIG = {
    SUPABASE: {
        URL: '${getEnvVar('VITE_SUPABASE_URL', 'YOUR_SUPABASE_URL_HERE')}',
        ANON_KEY: '${getEnvVar('VITE_SUPABASE_ANON_KEY', 'YOUR_SUPABASE_ANON_KEY_HERE')}'
    },
    
    // Application settings
    APP: {
        NAME: 'LaliLink',
        VERSION: '1.0.0',
        DESCRIPTION: 'Client-based credential management application',
        ENV: '${getEnvVar('VITE_APP_ENV', 'production')}',
        DEBUG: ${getEnvVar('VITE_APP_DEBUG', 'false') === 'true'}
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

// Validation function
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
        console.warn('Please check your deployment environment variables');
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
        console.log('LaliLink Config loaded (build-time):', {
            environment: CONFIG.APP.ENV,
            debug: CONFIG.APP.DEBUG,
            supabaseConfigured: CONFIG.validateEnvironment()
        });
    }
}
`;

// Fungsi utama untuk generate config.js
function generateConfig() {
    try {
        // Tulis config.js yang sudah diinjeksi environment variables
        fs.writeFileSync(path.join(__dirname, 'config.js'), configTemplate);
        
        console.log('✅ config.js generated successfully with environment variables:');
        console.log('   VITE_SUPABASE_URL:', getEnvVar('VITE_SUPABASE_URL') ? '✅ Set' : '❌ Missing');
        console.log('   VITE_SUPABASE_ANON_KEY:', getEnvVar('VITE_SUPABASE_ANON_KEY') ? '✅ Set' : '❌ Missing');
        console.log('   VITE_APP_ENV:', getEnvVar('VITE_APP_ENV', 'production'));
        console.log('   VITE_APP_DEBUG:', getEnvVar('VITE_APP_DEBUG', 'false'));
        
        // Validasi environment variables
        const hasRequired = getEnvVar('VITE_SUPABASE_URL') && getEnvVar('VITE_SUPABASE_ANON_KEY');
        if (!hasRequired) {
            console.warn('⚠️  Warning: Missing required environment variables!');
            console.warn('   Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment platform.');
        }
        
    } catch (error) {
        console.error('❌ Error generating config.js:', error.message);
        process.exit(1);
    }
}

// Jalankan jika dipanggil langsung
if (require.main === module) {
    generateConfig();
}

module.exports = { generateConfig };