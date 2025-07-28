# LaliLink - Secure Credential Management System

LaliLink adalah aplikasi web untuk manajemen kredensial yang aman dengan enkripsi AES-256, autentikasi berbasis role, dan antarmuka yang responsif.

## 🚀 Fitur Utama

- **Manajemen Klien**: Kelola informasi klien dengan mudah
- **Manajemen Aplikasi**: Organisir aplikasi berdasarkan klien
- **Manajemen Kredensial**: Simpan username/password dengan enkripsi AES-256
- **Role-Based Access Control (RBAC)**: Admin dan Viewer dengan permission berbeda
- **Keamanan Tinggi**: Enkripsi client-side, Row Level Security (RLS)
- **UI Responsif**: Desain mobile-first dengan Tailwind CSS
- **Copy to Clipboard**: Salin kredensial dengan aman
- **Search & Filter**: Pencarian real-time di semua entitas

## 🛠️ Teknologi

### Frontend
- HTML5
- Tailwind CSS
- Vanilla JavaScript
- Supabase JS Client
- Font Awesome Icons

### Backend
- Supabase (PostgreSQL)
- Supabase Auth
- Row Level Security (RLS)
- Real-time subscriptions

## 📋 Prasyarat

- Node.js (untuk development server)
- Akun Supabase
- Browser modern dengan dukungan Web Crypto API

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd lalilupa
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Jalankan SQL migrations dari `database/schema.sql`
3. Setup Row Level Security policies dari `database/policies.sql`
4. Dapatkan URL dan ANON_KEY dari project settings

### 4. Konfigurasi

⚠️ **PENTING**: Jangan pernah commit file `config.js` ke repository!

1. Copy file template konfigurasi:
```bash
cp config.example.js config.js
```

2. Edit file `config.js` dan update konfigurasi Supabase:
```javascript
const CONFIG = {
    SUPABASE: {
        URL: 'YOUR_SUPABASE_URL_HERE',
        ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE'
    },
    // ... konfigurasi lainnya sudah ada
};
```

3. File `config.js` sudah ada di `.gitignore` untuk keamanan

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka browser dan akses `http://localhost:8080`

## 📁 Struktur Project

```
lalilupa/
├── index.html              # Main HTML file
├── config.js               # Konfigurasi aplikasi
├── package.json            # Dependencies dan scripts
├── assets/
│   └── js/
│       ├── main.js         # Main application logic
│       ├── auth.js         # Authentication manager
│       ├── database.js     # Database operations
│       ├── security.js     # Encryption/security
│       ├── ui.js           # UI management
│       └── clipboard.js    # Clipboard operations
├── database/
│   ├── schema.sql          # Database schema
│   └── policies.sql        # RLS policies
└── README.md               # Dokumentasi ini
```

## 🔐 Keamanan

### ⚠️ Keamanan Konfigurasi
- **JANGAN** commit file `config.js` ke repository
- **GUNAKAN** `config.example.js` sebagai template
- **SIMPAN** kredensial Supabase di environment variables untuk production
- **AKTIFKAN** 2FA di akun Supabase Anda

### Enkripsi
- **AES-256-GCM**: Enkripsi password di client-side
- **Web Crypto API**: Implementasi kriptografi yang aman
- **Secure Key Generation**: Generate key dari user session

### Autentikasi
- **Supabase Auth**: Email/password authentication
- **JWT Tokens**: Session management yang aman
- **Role-based Access**: Admin dan Viewer permissions

### Database Security
- **Row Level Security (RLS)**: Akses data berdasarkan user
- **SQL Injection Prevention**: Parameterized queries
- **Audit Logging**: Track semua operasi CRUD

### Best Practices
- Selalu gunakan HTTPS di production
- Jangan share kredensial Supabase
- Backup database secara berkala
- Monitor aktivitas user yang mencurigakan

## 👥 Role & Permissions

### Admin
- ✅ Create, Read, Update, Delete semua entitas
- ✅ Manage user roles
- ✅ Access user management
- ✅ Full system access

### Viewer
- ✅ Read semua entitas
- ❌ Create, Update, Delete operations
- ❌ User management access
- ❌ Role modifications

## 🎯 Penggunaan

### 1. Registrasi/Login
- Daftar dengan email dan password
- Verifikasi email (jika diaktifkan)
- Login dengan kredensial

### 2. Manajemen Klien
- Tambah klien baru dengan informasi lengkap
- Edit informasi klien
- Hapus klien (akan menghapus semua data terkait)

### 3. Manajemen Aplikasi
- Pilih klien terlebih dahulu
- Tambah aplikasi untuk klien tersebut
- Kelola URL dan deskripsi aplikasi

### 4. Manajemen Kredensial
- Pilih aplikasi terlebih dahulu
- Tambah kredensial dengan username/password
- Password otomatis dienkripsi
- Copy kredensial ke clipboard dengan aman

### 5. User Management (Admin Only)
- Lihat semua user yang terdaftar
- Ubah role user (Admin/Viewer)
- Monitor aktivitas user

## 🔧 Development

### Scripts
```bash
npm run dev     # Start development server (live-server)
npm start       # Start production server (http-server)
```

### Code Structure

#### Main App (`main.js`)
- Orchestrates semua modules
- Handles authentication flow
- Manages application state

#### Authentication (`auth.js`)
- User sign in/up/out
- Session management
- Role-based permissions

#### Database (`database.js`)
- CRUD operations untuk semua entitas
- Caching mechanism
- Error handling

#### Security (`security.js`)
- Password encryption/decryption
- Secure password generation
- Cryptographic utilities

#### UI Management (`ui.js`)
- Modal management
- Toast notifications
- Dynamic rendering
- Search functionality

#### Clipboard (`clipboard.js`)
- Secure copy operations
- Auto-clear sensitive data
- Fallback support

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Periksa URL dan ANON_KEY di `config.js`
   - Pastikan project Supabase aktif

2. **Authentication Failed**
   - Periksa email verification
   - Cek RLS policies di Supabase

3. **Encryption Error**
   - Pastikan browser mendukung Web Crypto API
   - Cek HTTPS connection (required untuk crypto)

4. **Permission Denied**
   - Periksa user role di database
   - Verifikasi RLS policies

### Debug Mode

Buka browser console untuk melihat detailed logs:
```javascript
// Enable debug mode
window.laliApp.config.debug = true;
```

## 📝 Database Schema

### Tables

#### user_profiles
- `user_id` (UUID, FK to auth.users)
- `email` (TEXT)
- `full_name` (TEXT)
- `role` (TEXT) - 'admin' or 'viewer'
- `created_at`, `updated_at` (TIMESTAMP)

#### clients
- `id` (SERIAL, PK)
- `user_id` (UUID, FK)
- `client_name` (TEXT)
- `company_name` (TEXT)
- `email`, `phone`, `address` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

#### applications
- `id` (SERIAL, PK)
- `client_id` (INTEGER, FK)
- `app_name` (TEXT)
- `app_url` (TEXT)
- `description` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

#### credentials
- `id` (SERIAL, PK)
- `app_id` (INTEGER, FK)
- `username` (TEXT)
- `encrypted_password` (TEXT)
- `url` (TEXT)
- `description` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Project ini menggunakan MIT License. Lihat file `LICENSE` untuk detail.

## 🆘 Support

Jika mengalami masalah atau memiliki pertanyaan:

1. Cek [Issues](../../issues) yang sudah ada
2. Buat issue baru dengan detail lengkap
3. Sertakan browser version dan error logs

## 🔄 Changelog

### v1.0.0 (Current)
- ✅ Basic CRUD operations
- ✅ Role-based access control
- ✅ AES-256 encryption
- ✅ Responsive UI
- ✅ Search functionality
- ✅ Clipboard integration

### Planned Features
- 🔄 Backup/Export functionality
- 🔄 Advanced search filters
- 🔄 Activity audit logs
- 🔄 Multi-language support
- 🔄 Dark mode theme
- 🔄 Mobile app (PWA)

---

**LaliLink** - Secure, Simple, Scalable Credential Management 🔐