# 🚀 Environment Variables - Quick Start

## Setup Cepat (5 menit)

### 1. Copy Template
```bash
# Windows
npm run setup:env

# Linux/Mac
npm run setup:env:unix
```

### 2. Edit File .env
Buka `.env` dan ganti dengan kredensial Supabase Anda:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_APP_ENV=development
VITE_APP_DEBUG=true
```

### 3. Validasi Setup
```bash
npm run validate:env
```

✅ **Output yang diharapkan:**
```
Environment valid: true
```

### 4. Jalankan Aplikasi

```bash
npm run dev
```

**Catatan**: Script `npm run dev` akan otomatis:
1. Menjalankan `npm run dev:setup` untuk generate config.js dari .env
2. Memulai live-server di port 8080

**Manual Setup** (jika diperlukan):
```bash
npm run dev:setup  # Generate config.js dari .env
npm run start      # Jalankan server tanpa auto-setup
```

## 📁 File yang Dibuat/Diupdate

- ✅ `.env.example` - Template environment variables
- ✅ `.env` - File environment variables lokal (tidak di-commit)
- ✅ `config.js` - Konfigurasi dengan environment variables
- ✅ `config.example.js` - Template konfigurasi aman untuk GitHub commit
- ✅ `package.json` - Script setup dan validasi environment
- ✅ `build-config.js` - Build script untuk deployment (Vercel/hosting)
- ✅ `dev-setup.js` - Development setup script (generate config.js dari .env)
- ✅ `vercel.json` - Konfigurasi deployment Vercel
- ✅ `ENVIRONMENT_SETUP.md` - Dokumentasi lengkap
- ✅ `VERCEL_DEPLOYMENT.md` - Panduan deployment Vercel
- ✅ `ENV_QUICK_START.md` - Panduan cepat ini

## 🔒 Keamanan

- ✅ File `.env` tidak di-commit ke repository (ada di `.gitignore`)
- ✅ `config.example.js` menggunakan placeholder values yang aman untuk GitHub commit
- ✅ Environment variables terpisah dari kode aplikasi
- ✅ Validasi otomatis untuk memastikan semua environment variables tersedia
- ✅ Development dan production menggunakan workflow terpisah untuk keamanan maksimal

## 🔄 Development vs Production Workflow

### Development (Local)
1. Environment variables dibaca dari file `.env`
2. Script `dev-setup.js` generate `config.js` dengan values dari `.env`
3. `npm run dev` otomatis menjalankan setup dan server

### Production (Vercel/Hosting)
1. Environment variables diset di platform hosting
2. Script `build-config.js` generate `config.js` dengan values dari platform
3. Build process otomatis inject environment variables saat deployment

## 🚀 Production Deployment

### Vercel Deployment (Recommended)

1. **Setup Environment Variables di Vercel Dashboard**:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_APP_ENV=production
   VITE_APP_DEBUG=false
   ```

2. **Deploy**:
   - Push ke GitHub repository
   - Import project di Vercel
   - Vercel akan otomatis menjalankan `npm run build:vercel`
   - Build script akan generate `config.js` dengan environment variables

3. **Verifikasi**:
   - Cek build logs untuk memastikan environment variables terbaca
   - Test aplikasi di URL Vercel

📖 **Panduan Lengkap**: Lihat `VERCEL_DEPLOYMENT.md`

### Platform Hosting Lainnya

Untuk platform lain (Netlify, GitHub Pages, dll):
1. Set environment variables di platform hosting
2. Jalankan `npm run build` sebelum deployment
3. Upload hasil build ke hosting

## 🛠️ Troubleshooting

**Error: Environment valid: false**
1. Cek file `.env` ada
2. Pastikan nilai tidak mengandung `YOUR_` atau `_HERE`
3. Restart development server

**Kredensial tidak terbaca**
1. Pastikan nama variabel dimulai dengan `VITE_`
2. Restart server setelah mengubah `.env`
3. Cek browser console untuk error

---

📖 **Dokumentasi lengkap:** `ENVIRONMENT_SETUP.md`