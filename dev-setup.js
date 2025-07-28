#!/usr/bin/env node
// Development setup script untuk load environment variables dari .env
// dan generate config.js untuk development

const fs = require('fs');
const path = require('path');

// Fungsi untuk membaca file .env
function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');
    const envVars = {};
    
    if (!fs.existsSync(envPath)) {
        console.log('⚠️  File .env tidak ditemukan, menggunakan default values');
        return envVars;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, ...valueParts] = trimmedLine.split('=');
            if (key && valueParts.length > 0) {
                envVars[key.trim()] = valueParts.join('=').trim();
            }
        }
    }
    
    return envVars;
}

// Template config.js untuk development
function generateDevConfig(envVars) {
    const supabaseUrl = envVars['VITE_SUPABASE_URL'] || 'YOUR_SUPABASE_URL_HERE';
    const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'] || 'YOUR_SUPABASE_ANON_KEY_HERE';
    const appEnv = envVars['VITE_APP_ENV'] || 'development';
    const appDebug = envVars['VITE_APP_DEBUG'] === 'true' || envVars['VITE_APP_DEBUG'] === undefined;
    
    return `// Configuration file for LaliLink - Development Mode
// Auto-generated from .env file for development

// Helper function to get environment variables across different environments
function getEnvVar(key, defaultValue = null) {
    // Node.js environment (for validation scripts)
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key] || defaultValue;
    }
    
    // Browser environment with Vite (import.meta.env)
    if (typeof window !== 'undefined') {
        try {
            // Check for Vite's import.meta.env
            if (window.import && window.import.meta && window.import.meta.env) {
                return window.import.meta.env[key] || defaultValue;
            }
        } catch (e) {
            // Ignore errors
        }
    }
    
    return defaultValue;
}

const CONFIG = {
    SUPABASE: {
        URL: '${supabaseUrl}',
        ANON_KEY: '${supabaseKey}'
    },
    
    // Application settings
    APP: {
        NAME: 'LaliLink',
        VERSION: '1.0.0',
        DESCRIPTION: 'Client-based credential management application',
        ENV: '${appEnv}',
        DEBUG: ${appDebug}
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
        console.warn('Please check your .env file');
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
        console.log('LaliLink Config loaded (development):', {
            environment: CONFIG.APP.ENV,
            debug: CONFIG.APP.DEBUG,
            supabaseConfigured: CONFIG.validateEnvironment()
        });
    }
}
`;
}

// Fungsi utama
function setupDevelopment() {
    try {
        console.log('🔧 Setting up development environment...');
        
        // Load environment variables dari .env
        const envVars = loadEnvFile();
        
        // Generate config.js untuk development
        const configContent = generateDevConfig(envVars);
        
        // Tulis config.js
        fs.writeFileSync(path.join(__dirname, 'config.js'), configContent);
        
        console.log('✅ Development config.js generated successfully!');
        console.log('   Environment variables loaded from .env:');
        console.log('   VITE_SUPABASE_URL:', envVars['VITE_SUPABASE_URL'] ? '✅ Set' : '❌ Missing');
        console.log('   VITE_SUPABASE_ANON_KEY:', envVars['VITE_SUPABASE_ANON_KEY'] ? '✅ Set' : '❌ Missing');
        console.log('   VITE_APP_ENV:', envVars['VITE_APP_ENV'] || 'development (default)');
        console.log('   VITE_APP_DEBUG:', envVars['VITE_APP_DEBUG'] || 'true (default)');
        
        // Validasi
        const hasRequired = envVars['VITE_SUPABASE_URL'] && envVars['VITE_SUPABASE_ANON_KEY'];
        if (hasRequired) {
            console.log('🚀 Ready for development!');
        } else {
            console.warn('⚠️  Warning: Missing required environment variables in .env file!');
        }
        
    } catch (error) {
        console.error('❌ Error setting up development environment:', error.message);
        process.exit(1);
    }
}

// Jalankan jika dipanggil langsung
if (require.main === module) {
    setupDevelopment();
}

module.exports = { setupDevelopment };