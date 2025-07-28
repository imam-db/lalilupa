# Product Requirements Document (PRD) - LaliLink

## 📋 Overview

LaliLink adalah aplikasi manajemen kredensial yang memungkinkan pengguna untuk menyimpan, mengorganisir, dan mengelola kredensial login untuk berbagai aplikasi/layanan berdasarkan klien.

## 🎯 Core Features

### 1. **Client Management**
- Menambah, mengedit, dan menghapus klien
- Setiap klien memiliki: nama klien, nama perusahaan, kontak
- Tampilan daftar klien dengan kemampuan pencarian

### 2. **Application Management**
- Mengelola aplikasi/layanan untuk setiap klien
- Setiap aplikasi memiliki: nama aplikasi, tipe aplikasi, URL, deskripsi
- Navigasi hierarkis: Client → Applications

### 3. **Credential Management**
- Menyimpan kredensial untuk setiap aplikasi
- Setiap kredensial memiliki: username, password, role, catatan
- Fitur copy-to-clipboard untuk username dan password
- Password visibility toggle

### 4. **Security Features**
- Enkripsi password menggunakan AES-256
- Autentikasi pengguna dengan Supabase Auth
- Row Level Security (RLS) untuk isolasi data
- Role-Based Access Control (RBAC) dengan 2 role:
  - **Admin**: Full access (SELECT, INSERT, UPDATE, DELETE)
  - **Viewer**: Read-only access (SELECT only)

### 6. **Role-Based Access Control (RBAC)**
- **Admin Role**: 
  - Dapat mengelola semua data (clients, applications, credentials)
  - Dapat membuat, mengedit, dan menghapus semua entitas
  - Akses penuh ke semua fitur aplikasi
- **Viewer Role**:
  - Hanya dapat melihat data (read-only)
  - Tidak dapat membuat, mengedit, atau menghapus data
  - UI akan menyembunyikan tombol create/edit/delete
- **Permission Management**:
  - Role disimpan dalam tabel `user_profiles`
  - Validasi permission di frontend dan backend
  - RLS policies berdasarkan role user

### 5. **User Interface**
- Responsive design dengan Tailwind CSS
- Breadcrumb navigation
- Modal dialogs untuk CRUD operations
- Toast notifications untuk feedback

## 🏗️ Technical Architecture

### **Frontend Stack**
- **HTML5** - Struktur aplikasi
- **Tailwind CSS** - Styling dan responsive design
- **Vanilla JavaScript** - Logic aplikasi (modular architecture)
- **Supabase JS Client** - Database dan autentikasi

### **Backend Stack**
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security
  - Built-in authentication

### **Database Schema**

```sql
-- User Profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    client_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    contact_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE,
    app_name VARCHAR(255) NOT NULL,
    app_type VARCHAR(100),
    app_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credentials table
CREATE TABLE credentials (
    id BIGSERIAL PRIMARY KEY,
    app_id BIGINT REFERENCES applications(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    encrypted_password TEXT NOT NULL,
    role VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);```

## 📁 File Structure

```
lalilink/
├── index.html                 # Main application file
├── config.js                  # Configuration (Supabase keys)
├── assets/
│   └── js/
│       ├── main.js           # Main application class
│       ├── ui.js             # UI management
│       ├── auth.js           # Authentication logic
│       ├── database.js       # Database operations
│       ├── security.js       # Encryption/decryption
│       └── clipboard.js      # Clipboard operations
├── package.json              # Dependencies
└── README.md                 # Documentation
```

## 🔧 Implementation Guide

### **Step 1: Setup Project Structure**

1. **Create main HTML file** (`index.html`):
   - Include Tailwind CSS CDN
   - Include Supabase JS CDN
   - Create modal structures for CRUD operations
   - Add main layout with sidebar and content area

2. **Create configuration** (`config.js`):
   ```javascript
   const CONFIG = {
       SUPABASE: {
           URL: 'your-supabase-url',
           ANON_KEY: 'your-anon-key'
       }
   };
   ```

### **Step 2: Core JavaScript Modules**

#### **1. Security Manager** (`assets/js/security.js`)
```javascript
class SecurityManager {
    constructor() {
        this.key = null;
    }
    
    async generateKey() {
        // Generate AES-256 key
    }
    
    async encryptPassword(password) {
        // Encrypt password using AES-256
    }
    
    async decryptPassword(encryptedPassword) {
        // Decrypt password
    }
}
```

#### **2. Database Manager** (`assets/js/database.js`)
```javascript
class DatabaseManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
    }
    
    // User Profile operations
    async getUserProfile(userId) {
        const { data, error } = await this.supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        return { data, error };
    }
    
    async updateUserRole(userId, newRole) {
        const { data, error } = await this.supabase
            .from('user_profiles')
            .update({ role: newRole, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .select();
        return { data, error };
    }
    
    async getAllUsers() {
        const { data, error } = await this.supabase
            .from('user_profiles')
            .select(`
                *,
                auth.users!inner(email)
            `);
        return { data, error };
    }
    
    // Client operations
    async getClients() {
        const { data, error } = await this.supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });
        return { data, error };
    }
    
    async createClient(clientData) {
        const { data, error } = await this.supabase
            .from('clients')
            .insert([{
                ...clientData,
                user_id: (await this.supabase.auth.getUser()).data.user?.id
            }])
            .select();
        return { data, error };
    }
    
    async updateClient(id, clientData) {
        const { data, error } = await this.supabase
            .from('clients')
            .update({ ...clientData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        return { data, error };
    }
    
    async deleteClient(id) {
        const { data, error } = await this.supabase
            .from('clients')
            .delete()
            .eq('id', id);
        return { data, error };
    }
    
    // Application operations
    async getApplications(clientId) {
        const { data, error } = await this.supabase
            .from('applications')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });
        return { data, error };
    }
    
    async createApplication(appData) {
        const { data, error } = await this.supabase
            .from('applications')
            .insert([appData])
            .select();
        return { data, error };
    }
    
    async updateApplication(id, appData) {
        const { data, error } = await this.supabase
            .from('applications')
            .update({ ...appData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        return { data, error };
    }
    
    async deleteApplication(id) {
        const { data, error } = await this.supabase
            .from('applications')
            .delete()
            .eq('id', id);
        return { data, error };
    }
    
    // Credential operations
    async getCredentials(appId) {
        const { data, error } = await this.supabase
            .from('credentials')
            .select('*')
            .eq('app_id', appId)
            .order('created_at', { ascending: false });
        return { data, error };
    }
    
    async createCredential(credData) {
        const { data, error } = await this.supabase
            .from('credentials')
            .insert([credData])
            .select();
        return { data, error };
    }
    
    async updateCredential(id, credData) {
        const { data, error } = await this.supabase
            .from('credentials')
            .update({ ...credData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        return { data, error };
    }
    
    async deleteCredential(id) {
        const { data, error } = await this.supabase
            .from('credentials')
            .delete()
            .eq('id', id);
        return { data, error };
    }
}
```

#### **3. UI Manager** (`assets/js/ui.js`)
```javascript
class UIManager {
    constructor(authManager) {
        this.auth = authManager;
        this.modals = {};
        this.initializeModals();
    }
    
    showModal(modalId) { /* ... */ }
    hideModal(modalId) { /* ... */ }
    showToast(message, type) { /* ... */ }
    showLoading() { /* ... */ }
    hideLoading() { /* ... */ }
    
    updateUIBasedOnRole() {
        const isAdmin = this.auth.isAdmin();
        
        // Show/hide action buttons based on role
        const createButtons = document.querySelectorAll('[data-action="create"]');
        const editButtons = document.querySelectorAll('[data-action="edit"]');
        const deleteButtons = document.querySelectorAll('[data-action="delete"]');
        
        createButtons.forEach(btn => {
            btn.style.display = isAdmin ? 'block' : 'none';
        });
        
        editButtons.forEach(btn => {
            btn.style.display = isAdmin ? 'block' : 'none';
        });
        
        deleteButtons.forEach(btn => {
            btn.style.display = isAdmin ? 'block' : 'none';
        });
        
        // Update user role indicator
        const roleIndicator = document.getElementById('user-role');
        if (roleIndicator) {
            roleIndicator.textContent = this.auth.getUserRole().toUpperCase();
            roleIndicator.className = `px-2 py-1 text-xs rounded ${
                isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`;
        }
    }
    
    renderClients(clients) {
        const isAdmin = this.auth.isAdmin();
        // Render clients with role-based actions
        // Include create/edit/delete buttons only for admin
    }
    
    renderApplications(apps) {
        const isAdmin = this.auth.isAdmin();
        // Render applications with role-based actions
        // Include create/edit/delete buttons only for admin
    }
    
    renderCredentials(credentials) {
        const isAdmin = this.auth.isAdmin();
        // Render credentials with role-based actions
        // Include create/edit/delete buttons only for admin
        // Copy buttons available for all roles
    }
    
    showRoleRestrictedMessage() {
        this.showToast('Access denied. Admin role required for this action.', 'error');
    }
}
```

#### **4. Authentication Manager** (`assets/js/auth.js`)
```javascript
class AuthManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.user = null;
        this.userProfile = null;
    }
    
    async signIn(email, password) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email, password
        });
        if (!error) {
            await this.loadUserProfile();
        }
        return { data, error };
    }
    
    async signOut() {
        const { error } = await this.supabase.auth.signOut();
        this.user = null;
        this.userProfile = null;
        return { error };
    }
    
    async getCurrentUser() {
        const { data: { user } } = await this.supabase.auth.getUser();
        this.user = user;
        if (user) {
            await this.loadUserProfile();
        }
        return user;
    }
    
    async loadUserProfile() {
        if (!this.user) return null;
        
        const { data, error } = await this.supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', this.user.id)
            .single();
            
        if (!error) {
            this.userProfile = data;
        }
        return data;
    }
    
    getUserRole() {
        return this.userProfile?.role || 'viewer';
    }
    
    isAdmin() {
        return this.getUserRole() === 'admin';
    }
    
    isViewer() {
        return this.getUserRole() === 'viewer';
    }
    
    canCreate() {
        return this.isAdmin();
    }
    
    canUpdate() {
        return this.isAdmin();
    }
    
    canDelete() {
        return this.isAdmin();
    }
    
    onAuthStateChange(callback) {
        return this.supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                this.user = session.user;
                await this.loadUserProfile();
            } else {
                this.user = null;
                this.userProfile = null;
            }
            callback(event, session);
        });
    }
}
```

#### **5. Clipboard Manager** (`assets/js/clipboard.js`)
```javascript
class ClipboardManager {
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy:', error);
            return false;
        }
    }
}
```

#### **6. Main Application** (`assets/js/main.js`)
```javascript
class LaliLinkApp {
    constructor() {
        this.supabase = null;
        this.ui = null;
        this.auth = null;
        this.database = null;
        this.security = null;
        this.clipboard = null;
        
        this.clients = [];
        this.selectedClientId = null;
        this.selectedAppId = null;
    }
    
    async init() {
        await this.initSupabase();
        await this.initModules();
        await this.setupGlobalFunctions();
        await this.checkAuthState();
        await this.initUI();
    }
    
    async initSupabase() { /* ... */ }
    async initModules() {
        this.auth = new AuthManager(this.supabase);
        this.database = new DatabaseManager(this.supabase);
        this.security = new SecurityManager();
        this.ui = new UIManager(this.auth);
        this.clipboard = ClipboardManager;
    }
    
    async setupGlobalFunctions() { /* ... */ }
    async checkAuthState() { /* ... */ }
    async initUI() { /* ... */ }
    
    // Role validation methods
    validateAdminAccess(action) {
        if (!this.auth.isAdmin()) {
            this.ui.showRoleRestrictedMessage();
            console.warn(`Access denied: ${action} requires admin role`);
            return false;
        }
        return true;
    }
    
    // User Profile methods
    async loadUserProfile() {
        return await this.auth.loadUserProfile();
    }
    
    async updateUserRole(userId, newRole) {
        if (!this.validateAdminAccess('update user role')) return;
        
        return await this.database.updateUserRole(userId, newRole);
    }
    
    // Client methods with role validation
    async loadClients() { /* ... */ }
    
    async openClientModal(clientId = null) {
        if (clientId === null && !this.validateAdminAccess('create client')) return;
        if (clientId !== null && !this.validateAdminAccess('edit client')) return;
        // Continue with modal logic
    }
    
    async saveClient() {
        if (!this.validateAdminAccess('save client')) return;
        // Continue with save logic
    }
    
    async deleteClient(clientId) {
        if (!this.validateAdminAccess('delete client')) return;
        // Continue with delete logic
    }
    
    // Application methods with role validation
    async loadApps(clientId) { /* ... */ }
    
    async openAppModal(appId = null) {
        if (appId === null && !this.validateAdminAccess('create application')) return;
        if (appId !== null && !this.validateAdminAccess('edit application')) return;
        // Continue with modal logic
    }
    
    async saveApp() {
        if (!this.validateAdminAccess('save application')) return;
        // Continue with save logic
    }
    
    async deleteApp(appId) {
        if (!this.validateAdminAccess('delete application')) return;
        // Continue with delete logic
    }
    
    // Credential methods with role validation
    async loadCredentials(appId) { /* ... */ }
    
    async openCredentialModal(credId = null) {
        if (credId === null && !this.validateAdminAccess('create credential')) return;
        if (credId !== null && !this.validateAdminAccess('edit credential')) return;
        // Continue with modal logic
    }
    
    async saveCredential() {
        if (!this.validateAdminAccess('save credential')) return;
        // Continue with save logic
    }
    
    async deleteCredential(credId) {
        if (!this.validateAdminAccess('delete credential')) return;
        // Continue with delete logic
    }
    
    // User Management methods (Admin only)
     async loadUsers() {
         if (!this.validateAdminAccess('view users')) return;
         
         const { data, error } = await this.database.getAllUsers();
         if (!error) {
             this.ui.renderUsers(data);
         }
         return { data, error };
     }
     
     async openRoleModal(userId, currentRole) {
         if (!this.validateAdminAccess('change user role')) return;
         
         this.ui.showModal('role-modal');
         document.getElementById('role-select').value = currentRole;
         document.getElementById('role-modal').dataset.userId = userId;
     }
     
     async saveUserRole() {
         if (!this.validateAdminAccess('save user role')) return;
         
         const modal = document.getElementById('role-modal');
         const userId = modal.dataset.userId;
         const newRole = document.getElementById('role-select').value;
         
         const { data, error } = await this.database.updateUserRole(userId, newRole);
         
         if (!error) {
             this.ui.showToast('User role updated successfully', 'success');
             this.ui.hideModal('role-modal');
             await this.loadUsers(); // Refresh user list
         } else {
             this.ui.showToast('Failed to update user role', 'error');
         }
     }
     
     // Utility methods (available for all roles)
     async copyUsername(credId) { /* ... */ }
     async copyPassword(credId) { /* ... */ }
     togglePassword(credId) { /* ... */ }
}
```

### **Step 3: Database Setup**

1. **Create Supabase project**
2. **Run SQL migrations** untuk membuat tables
3. **Setup Row Level Security (RLS)**:
   ```sql
   -- Enable RLS
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
   ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
   ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
   
   -- User Profiles policies
   CREATE POLICY "Users can see their own profile" ON user_profiles
       FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can update their own profile" ON user_profiles
       FOR UPDATE USING (auth.uid() = user_id);
   
   -- Helper function to check user role
   CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
   RETURNS TEXT AS $$
   BEGIN
       RETURN (SELECT role FROM user_profiles WHERE user_id = user_uuid);
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Clients policies with role-based access
   CREATE POLICY "Admin can manage all clients" ON clients
       FOR ALL USING (get_user_role(auth.uid()) = 'admin');
   
   CREATE POLICY "Viewer can only see their own clients" ON clients
       FOR SELECT USING (
           get_user_role(auth.uid()) = 'viewer' AND auth.uid() = user_id
       );
   
   -- Applications policies with role-based access
   CREATE POLICY "Admin can manage all applications" ON applications
       FOR ALL USING (get_user_role(auth.uid()) = 'admin');
   
   CREATE POLICY "Viewer can only see apps for their clients" ON applications
       FOR SELECT USING (
           get_user_role(auth.uid()) = 'viewer' AND
           client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
       );
   
   -- Credentials policies with role-based access
   CREATE POLICY "Admin can manage all credentials" ON credentials
       FOR ALL USING (get_user_role(auth.uid()) = 'admin');
   
   CREATE POLICY "Viewer can only see credentials for their apps" ON credentials
       FOR SELECT USING (
           get_user_role(auth.uid()) = 'viewer' AND
           app_id IN (
               SELECT a.id FROM applications a
               JOIN clients c ON a.client_id = c.id
               WHERE c.user_id = auth.uid()
           )
       );
   
   -- Function to create user profile on signup
   CREATE OR REPLACE FUNCTION handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
       INSERT INTO user_profiles (user_id, role)
       VALUES (NEW.id, 'viewer');
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Trigger to automatically create user profile
   CREATE TRIGGER on_auth_user_created
       AFTER INSERT ON auth.users
       FOR EACH ROW EXECUTE FUNCTION handle_new_user();
   ```

### **Step 4: UI Components**

1. **Main Layout**:
   - Header dengan logout button dan role indicator
   - Sidebar untuk navigation (role-based menu items)
   - Main content area
   - Breadcrumb navigation
   - User role badge di header

2. **Modal Components**:
   - Client modal (add/edit) - Admin only
   - Application modal (add/edit) - Admin only
   - Credential modal (add/edit) - Admin only
   - User management modal - Admin only
   - Confirmation modal untuk delete - Admin only

3. **List Components**:
   - Client cards dengan click handler
   - Application cards dengan click handler
   - Credential cards dengan copy buttons (available for all)
   - User list dengan role management - Admin only

4. **Role-Based UI Elements**:
   ```html
   <!-- Header with role indicator -->
   <header class="bg-white shadow">
       <div class="flex justify-between items-center px-6 py-4">
           <h1>LaliLink</h1>
           <div class="flex items-center space-x-4">
               <span id="user-role" class="px-2 py-1 text-xs rounded"></span>
               <button onclick="logout()" class="btn-secondary">Logout</button>
           </div>
       </div>
   </header>
   
   <!-- Admin-only navigation -->
   <nav class="sidebar">
       <a href="#clients">Clients</a>
       <a href="#users" data-admin-only>User Management</a>
   </nav>
   
   <!-- Action buttons with role-based visibility -->
   <button data-action="create" onclick="openClientModal()" class="btn-primary">
       Add Client
   </button>
   <button data-action="edit" onclick="editClient(id)" class="btn-secondary">
       Edit
   </button>
   <button data-action="delete" onclick="deleteClient(id)" class="btn-danger">
       Delete
   </button>
   ```

5. **User Management Interface (Admin Only)**:
   ```html
   <!-- User Management Table -->
   <div id="user-management" class="hidden">
       <h2>User Management</h2>
       <table class="w-full">
           <thead>
               <tr>
                   <th>Email</th>
                   <th>Role</th>
                   <th>Created</th>
                   <th>Actions</th>
               </tr>
           </thead>
           <tbody id="users-list">
               <!-- Dynamic user rows -->
           </tbody>
       </table>
   </div>
   
   <!-- Role Change Modal -->
   <div id="role-modal" class="modal">
       <div class="modal-content">
           <h3>Change User Role</h3>
           <select id="role-select">
               <option value="viewer">Viewer</option>
               <option value="admin">Admin</option>
           </select>
           <div class="modal-actions">
               <button onclick="saveUserRole()">Save</button>
               <button onclick="closeModal('role-modal')">Cancel</button>
           </div>
       </div>
   </div>
   ```

### **Step 5: Styling dengan Tailwind**

- Gunakan Tailwind utility classes
- Responsive design untuk mobile/desktop
- Consistent color scheme
- Hover effects dan transitions

## 🚀 Development Workflow

1. **Setup environment**:
   ```bash
   npm init -y
   # Setup local development server
   python -m http.server 8080
   ```

2. **Development phases**:
   - Phase 1: Basic HTML structure dan styling
   - Phase 2: Authentication system dengan user profiles
   - Phase 3: Role-Based Access Control (RBAC) implementation
   - Phase 4: Client management dengan role validation
   - Phase 5: Application management dengan role validation
   - Phase 6: Credential management dengan role validation
   - Phase 7: User management interface (Admin only)
   - Phase 8: Security implementation dan encryption
   - Phase 9: Testing dan debugging
   - Phase 10: Role-based UI testing

3. **Testing strategy**:
   - Unit testing untuk setiap module
   - Integration testing untuk database operations
   - UI testing untuk user interactions
   - Security testing untuk encryption
   - **Role-Based Testing**:
     - Admin role: Test all CRUD operations
     - Viewer role: Test read-only access
     - Permission validation testing
     - UI element visibility testing
   - **Database Security Testing**:
     - RLS policy validation
     - Cross-user data access prevention
     - Role-based query testing
   - **Authentication Testing**:
     - User profile creation on signup
     - Role assignment and validation
     - Session management dengan role persistence

## 🔒 Security Considerations

1. **Data Encryption**:
   - Encrypt passwords sebelum menyimpan ke database
   - Gunakan Web Crypto API untuk AES-256
   - Key management yang aman

2. **Authentication**:
   - Gunakan Supabase Auth
   - Implement proper session management
   - Logout functionality

3. **Database Security**:
   - Row Level Security (RLS)
   - Prepared statements untuk prevent SQL injection
   - Input validation dan sanitization

4. **Frontend Security**:
   - CSP headers
   - XSS protection
   - Secure clipboard operations

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly buttons dan interactions
- Optimized modal sizes untuk mobile

## 🎨 UI/UX Guidelines

1. **Color Scheme**:
   - Primary: Blue (#3B82F6)
   - Secondary: Gray (#6B7280)
   - Success: Green (#10B981)
   - Warning: Yellow (#F59E0B)
   - Error: Red (#EF4444)

2. **Typography**:
   - Font: Inter atau system fonts
   - Hierarchy: h1-h6 dengan consistent sizing
   - Readable line heights

3. **Spacing**:
   - Consistent padding dan margins
   - Tailwind spacing scale (4px increments)

4. **Interactions**:
   - Hover states untuk semua clickable elements
   - Loading states untuk async operations
   - Clear feedback untuk user actions

## 🔄 State Management

- Centralized state dalam main LaliLinkApp class
- Event-driven updates
- Reactive UI updates
- Local storage untuk user preferences

## 📊 Performance Optimization

1. **Code Splitting**:
   - Modular JavaScript architecture
   - Lazy loading untuk non-critical features

2. **Database Optimization**:
   - Efficient queries dengan proper indexing
   - Pagination untuk large datasets
   - Caching strategies

3. **UI Optimization**:
   - Minimal DOM manipulations
   - Efficient event handling
   - Optimized re-renders

Dengan PRD ini, Anda memiliki blueprint lengkap untuk membangun ulang aplikasi LaliLink dengan arsitektur yang solid dan scalable.