/**
 * ClipboardManager - Handles clipboard operations with fallback support
 * Provides secure copy-to-clipboard functionality with user feedback
 */
class ClipboardManager {
    /**
     * Copy text to clipboard using modern Clipboard API with fallback
     * @param {string} text - Text to copy
     * @param {string} type - Type of data being copied (for user feedback)
     * @returns {Promise<boolean>} Success status
     */
    static async copyToClipboard(text, type = 'text') {
        if (!text) {
            console.warn('No text provided to copy');
            return false;
        }

        try {
            // Try modern Clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                this.showCopyFeedback(type, true);
                return true;
            } else {
                // Fallback to legacy method
                return this.fallbackCopyToClipboard(text, type);
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            // Try fallback method
            return this.fallbackCopyToClipboard(text, type);
        }
    }

    /**
     * Fallback copy method using document.execCommand
     * @param {string} text - Text to copy
     * @param {string} type - Type of data being copied
     * @returns {boolean} Success status
     */
    static fallbackCopyToClipboard(text, type = 'text') {
        try {
            // Create a temporary textarea element
            const textArea = document.createElement('textarea');
            textArea.value = text;
            
            // Make it invisible and non-interactive
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            textArea.style.opacity = '0';
            textArea.setAttribute('readonly', '');
            textArea.setAttribute('aria-hidden', 'true');
            
            // Add to DOM, select, copy, and remove
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            textArea.setSelectionRange(0, 99999); // For mobile devices
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                this.showCopyFeedback(type, true);
                return true;
            } else {
                this.showCopyFeedback(type, false);
                return false;
            }
        } catch (error) {
            console.error('Fallback copy failed:', error);
            this.showCopyFeedback(type, false);
            return false;
        }
    }

    /**
     * Copy username with security considerations
     * @param {string} username - Username to copy
     * @returns {Promise<boolean>} Success status
     */
    static async copyUsername(username) {
        if (!username || username.trim() === '') {
            this.showErrorMessage('Username kosong');
            return false;
        }

        const success = await this.copyToClipboard(username.trim(), 'username');
        
        if (success) {
            // Log the action for security audit
            this.logCopyAction('username');
        }
        
        return success;
    }

    /**
     * Copy password with enhanced security measures
     * @param {string} password - Password to copy
     * @param {number} clearAfter - Time in milliseconds to clear clipboard (default: 30000)
     * @returns {Promise<boolean>} Success status
     */
    static async copyPassword(password, clearAfter = 30000) {
        if (!password || password.trim() === '') {
            this.showErrorMessage('Password kosong');
            return false;
        }

        const success = await this.copyToClipboard(password, 'password');
        
        if (success) {
            // Log the action for security audit
            this.logCopyAction('password');
            
            // Auto-clear clipboard after specified time for security
            if (clearAfter > 0) {
                this.scheduleClipboardClear(clearAfter);
            }
            
            // Show security warning
            this.showSecurityWarning(clearAfter);
        }
        
        return success;
    }

    /**
     * Copy URL with validation
     * @param {string} url - URL to copy
     * @returns {Promise<boolean>} Success status
     */
    static async copyUrl(url) {
        if (!url || url.trim() === '') {
            this.showErrorMessage('URL kosong');
            return false;
        }

        // Basic URL validation
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        const cleanUrl = url.trim();
        
        if (!urlPattern.test(cleanUrl)) {
            this.showErrorMessage('Format URL tidak valid');
            return false;
        }

        const success = await this.copyToClipboard(cleanUrl, 'URL');
        
        if (success) {
            this.logCopyAction('url');
        }
        
        return success;
    }

    /**
     * Schedule clipboard clearing for security
     * @param {number} delay - Delay in milliseconds
     */
    static scheduleClipboardClear(delay) {
        // Clear any existing timeout
        if (this.clearTimeout) {
            clearTimeout(this.clearTimeout);
        }

        this.clearTimeout = setTimeout(async () => {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText('');
                } else {
                    // Fallback method
                    this.fallbackCopyToClipboard('', 'clear');
                }
                
                // Show notification that clipboard was cleared
                if (window.app && window.app.ui) {
                    window.app.ui.showToast('Clipboard telah dibersihkan untuk keamanan', 'info');
                }
            } catch (error) {
                console.error('Failed to clear clipboard:', error);
            }
        }, delay);
    }

    /**
     * Show copy feedback to user
     * @param {string} type - Type of data copied
     * @param {boolean} success - Whether copy was successful
     */
    static showCopyFeedback(type, success) {
        if (!window.app || !window.app.ui) {
            // Fallback to console if UI manager not available
            console.log(`Copy ${success ? 'successful' : 'failed'}: ${type}`);
            return;
        }

        const messages = {
            username: success ? 'Username berhasil disalin' : 'Gagal menyalin username',
            password: success ? 'Password berhasil disalin' : 'Gagal menyalin password',
            url: success ? 'URL berhasil disalin' : 'Gagal menyalin URL',
            text: success ? 'Teks berhasil disalin' : 'Gagal menyalin teks'
        };

        const message = messages[type] || (success ? 'Berhasil disalin' : 'Gagal menyalin');
        const toastType = success ? 'success' : 'error';
        
        window.app.ui.showToast(message, toastType);
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    static showErrorMessage(message) {
        if (window.app && window.app.ui) {
            window.app.ui.showToast(message, 'error');
        } else {
            console.error(message);
        }
    }

    /**
     * Show security warning for password copy
     * @param {number} clearAfter - Time until clipboard is cleared
     */
    static showSecurityWarning(clearAfter) {
        if (!window.app || !window.app.ui) return;

        const seconds = Math.floor(clearAfter / 1000);
        const message = `Password disalin. Clipboard akan dibersihkan dalam ${seconds} detik untuk keamanan.`;
        
        window.app.ui.showToast(message, 'warning', clearAfter - 1000);
    }

    /**
     * Log copy action for security audit
     * @param {string} type - Type of data copied
     */
    static logCopyAction(type) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            action: 'copy_to_clipboard',
            type: type,
            timestamp: timestamp,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Store in session storage for current session audit
        try {
            const existingLogs = JSON.parse(sessionStorage.getItem('clipboard_audit') || '[]');
            existingLogs.push(logEntry);
            
            // Keep only last 100 entries
            if (existingLogs.length > 100) {
                existingLogs.splice(0, existingLogs.length - 100);
            }
            
            sessionStorage.setItem('clipboard_audit', JSON.stringify(existingLogs));
        } catch (error) {
            console.error('Failed to log clipboard action:', error);
        }

        // Also log to console in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Clipboard action logged:', logEntry);
        }
    }

    /**
     * Get clipboard audit logs
     * @returns {Array} Array of log entries
     */
    static getAuditLogs() {
        try {
            return JSON.parse(sessionStorage.getItem('clipboard_audit') || '[]');
        } catch (error) {
            console.error('Failed to retrieve audit logs:', error);
            return [];
        }
    }

    /**
     * Clear audit logs
     */
    static clearAuditLogs() {
        try {
            sessionStorage.removeItem('clipboard_audit');
        } catch (error) {
            console.error('Failed to clear audit logs:', error);
        }
    }

    /**
     * Check if clipboard API is supported
     * @returns {boolean} Support status
     */
    static isSupported() {
        return !!(navigator.clipboard || document.execCommand);
    }

    /**
     * Check if secure clipboard API is available
     * @returns {boolean} Secure API availability
     */
    static isSecureApiAvailable() {
        return !!(navigator.clipboard && window.isSecureContext);
    }

    /**
     * Get clipboard permissions status
     * @returns {Promise<string>} Permission status
     */
    static async getPermissionStatus() {
        if (!navigator.permissions || !navigator.clipboard) {
            return 'not-supported';
        }

        try {
            const permission = await navigator.permissions.query({ name: 'clipboard-write' });
            return permission.state; // 'granted', 'denied', or 'prompt'
        } catch (error) {
            console.error('Failed to check clipboard permissions:', error);
            return 'unknown';
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClipboardManager;
}