# Environment Variables Setup Guide

Panduan ini menjelaskan cara mengatur environment variables untuk LaliLink.

## 🔧 Setup untuk Development

### 1. Copy Template Environment
```bash
cp .env.example .env
```

### 2. Edit File .env
Buka file `.env` dan isi dengan nilai-nilai aktual:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Application Environment
VITE_APP_ENV=development
VITE_APP_DEBUG=true
```

### 3. Dapatkan Kredensial Supabase
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Pergi ke **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** → `anon public` → `VITE_SUPABASE_ANON_KEY`

## 🚀 Setup untuk Production

### Hosting Platforms

#### Netlify
1. Pergi ke **Site settings** → **Environment variables**
2. Tambahkan:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your_anon_key_here
   VITE_APP_ENV = production
   VITE_APP_DEBUG = false
   ```

#### Vercel
1. Pergi ke **Project Settings** → **Environment Variables**
2. Tambahkan variabel yang sama seperti di atas

#### GitHub Pages
Untuk GitHub Pages, Anda perlu menggunakan GitHub Secrets:
1. Pergi ke **Repository Settings** → **Secrets and variables** → **Actions**
2. Tambahkan secrets dengan nama yang sama

## 📁 Struktur File

```
├── .env.example          # Template environment variables
├── .env                  # File aktual (tidak di-commit)
├── config.js             # Konfigurasi yang membaca env vars
└── ENVIRONMENT_SETUP.md  # Dokumentasi ini
```

## 🔒 Keamanan

### ⚠️ PENTING:
- **JANGAN PERNAH** commit file `.env` ke repository
- File `.env` sudah ada di `.gitignore`
- Gunakan `.env.example` sebagai template
- Untuk production, selalu set `VITE_APP_DEBUG=false`

### Validasi Environment
Aplikasi akan otomatis memvalidasi environment variables saat dimuat:

```javascript
// Cek di browser console
if (CONFIG.validateEnvironment()) {
    console.log('✅ Environment variables configured correctly');
} else {
    console.error('❌ Missing or invalid environment variables');
}
```

## 🛠️ Troubleshooting

### Error: "Missing required environment variables"
1. Pastikan file `.env` ada
2. Cek nama variabel sesuai dengan `.env.example`
3. Restart development server setelah mengubah `.env`

### Error: "Supabase client initialization failed"
1. Cek URL Supabase benar
2. Cek ANON_KEY valid dan tidak expired
3. Pastikan project Supabase aktif

### Environment Variables Tidak Terbaca
1. Pastikan nama dimulai dengan `VITE_`
2. Restart development server
3. Cek browser console untuk error

## 📞 Support

Jika mengalami masalah dengan setup environment variables:
1. Cek dokumentasi [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
2. Cek dokumentasi [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/initializing)
3. Buat issue di repository ini