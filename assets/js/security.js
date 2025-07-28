/**
 * SecurityManager - Handles encryption and decryption of sensitive data
 * Uses Web Crypto API with AES-GCM encryption
 */
class SecurityManager {
    constructor() {
        this.key = null;
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
        this.ivLength = 12;
    }

    /**
     * Generate a new encryption key
     * @returns {Promise<CryptoKey>}
     */
    async generateKey() {
        try {
            this.key = await window.crypto.subtle.generateKey(
                {
                    name: this.algorithm,
                    length: this.keyLength
                },
                true, // extractable
                ['encrypt', 'decrypt']
            );
            return this.key;
        } catch (error) {
            console.error('Failed to generate encryption key:', error);
            throw new Error('Gagal membuat kunci enkripsi');
        }
    }

    /**
     * Import a key from raw key data
     * @param {ArrayBuffer} keyData - Raw key data
     * @returns {Promise<CryptoKey>}
     */
    async importKey(keyData) {
        try {
            this.key = await window.crypto.subtle.importKey(
                'raw',
                keyData,
                {
                    name: this.algorithm,
                    length: this.keyLength
                },
                true,
                ['encrypt', 'decrypt']
            );
            return this.key;
        } catch (error) {
            console.error('Failed to import encryption key:', error);
            throw new Error('Gagal mengimpor kunci enkripsi');
        }
    }

    /**
     * Export the current key as raw data
     * @returns {Promise<ArrayBuffer>}
     */
    async exportKey() {
        try {
            if (!this.key) {
                throw new Error('No key available to export');
            }
            return await window.crypto.subtle.exportKey('raw', this.key);
        } catch (error) {
            console.error('Failed to export encryption key:', error);
            throw new Error('Gagal mengekspor kunci enkripsi');
        }
    }

    /**
     * Encrypt a password string
     * @param {string} password - Plain text password
     * @returns {Promise<string>} Base64 encoded encrypted data
     */
    async encryptPassword(password) {
        try {
            if (!this.key) {
                await this.generateKey();
            }

            // Generate a random IV
            const iv = window.crypto.getRandomValues(new Uint8Array(this.ivLength));
            
            // Convert password to ArrayBuffer
            const encoder = new TextEncoder();
            const data = encoder.encode(password);

            // Encrypt the data
            const encrypted = await window.crypto.subtle.encrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                this.key,
                data
            );

            // Combine IV and encrypted data
            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encrypted), iv.length);

            // Convert to base64 for storage
            return this.arrayBufferToBase64(combined.buffer);
        } catch (error) {
            console.error('Failed to encrypt password:', error);
            throw new Error('Gagal mengenkripsi password');
        }
    }

    /**
     * Decrypt an encrypted password
     * @param {string} encryptedPassword - Base64 encoded encrypted data
     * @returns {Promise<string>} Plain text password
     */
    async decryptPassword(encryptedPassword) {
        try {
            if (!this.key) {
                throw new Error('No encryption key available');
            }

            // Convert from base64
            const combined = this.base64ToArrayBuffer(encryptedPassword);
            
            // Extract IV and encrypted data
            const iv = combined.slice(0, this.ivLength);
            const encrypted = combined.slice(this.ivLength);

            // Decrypt the data
            const decrypted = await window.crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                this.key,
                encrypted
            );

            // Convert back to string
            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('Failed to decrypt password:', error);
            throw new Error('Gagal mendekripsi password');
        }
    }

    /**
     * Generate a secure random password
     * @param {number} length - Password length (default: 16)
     * @param {Object} options - Password generation options
     * @returns {string} Generated password
     */
    generateSecurePassword(length = 16, options = {}) {
        const defaults = {
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            excludeSimilar: true // Exclude similar looking characters
        };
        
        const config = { ...defaults, ...options };
        
        let charset = '';
        
        if (config.includeLowercase) {
            charset += config.excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
        }
        
        if (config.includeUppercase) {
            charset += config.excludeSimilar ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        
        if (config.includeNumbers) {
            charset += config.excludeSimilar ? '23456789' : '0123456789';
        }
        
        if (config.includeSymbols) {
            charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        }
        
        if (!charset) {
            throw new Error('At least one character type must be included');
        }
        
        const randomValues = new Uint8Array(length);
        window.crypto.getRandomValues(randomValues);
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset[randomValues[i] % charset.length];
        }
        
        return password;
    }

    /**
     * Hash a string using SHA-256
     * @param {string} text - Text to hash
     * @returns {Promise<string>} Hex encoded hash
     */
    async hashString(text) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.error('Failed to hash string:', error);
            throw new Error('Gagal membuat hash');
        }
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} Validation result with score and feedback
     */
    validatePasswordStrength(password) {
        const result = {
            score: 0,
            strength: 'Sangat Lemah',
            feedback: [],
            isValid: false
        };

        if (!password) {
            result.feedback.push('Password tidak boleh kosong');
            return result;
        }

        // Length check
        if (password.length >= 8) {
            result.score += 1;
        } else {
            result.feedback.push('Password minimal 8 karakter');
        }

        if (password.length >= 12) {
            result.score += 1;
        }

        // Character variety checks
        if (/[a-z]/.test(password)) {
            result.score += 1;
        } else {
            result.feedback.push('Gunakan huruf kecil');
        }

        if (/[A-Z]/.test(password)) {
            result.score += 1;
        } else {
            result.feedback.push('Gunakan huruf besar');
        }

        if (/[0-9]/.test(password)) {
            result.score += 1;
        } else {
            result.feedback.push('Gunakan angka');
        }

        if (/[^a-zA-Z0-9]/.test(password)) {
            result.score += 1;
        } else {
            result.feedback.push('Gunakan simbol khusus');
        }

        // Common patterns check
        const commonPatterns = [
            /123456/,
            /password/i,
            /qwerty/i,
            /admin/i,
            /(.)\1{2,}/ // Repeated characters
        ];

        for (const pattern of commonPatterns) {
            if (pattern.test(password)) {
                result.score -= 1;
                result.feedback.push('Hindari pola umum atau karakter berulang');
                break;
            }
        }

        // Determine strength
        if (result.score >= 5) {
            result.strength = 'Sangat Kuat';
            result.isValid = true;
        } else if (result.score >= 4) {
            result.strength = 'Kuat';
            result.isValid = true;
        } else if (result.score >= 3) {
            result.strength = 'Sedang';
            result.isValid = true;
        } else if (result.score >= 2) {
            result.strength = 'Lemah';
        } else {
            result.strength = 'Sangat Lemah';
        }

        return result;
    }

    /**
     * Convert ArrayBuffer to Base64 string
     * @param {ArrayBuffer} buffer
     * @returns {string}
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Convert Base64 string to ArrayBuffer
     * @param {string} base64
     * @returns {ArrayBuffer}
     */
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Clear the encryption key from memory
     */
    clearKey() {
        this.key = null;
    }

    /**
     * Check if Web Crypto API is supported
     * @returns {boolean}
     */
    static isSupported() {
        return !!(window.crypto && window.crypto.subtle);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
}