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

## 📁 File yang Dibuat/Diperbarui

- `.env.example` - Template environment variables
- `.env` - File aktual dengan kredensial (tidak di-commit)
- `config.js` - Konfigurasi yang membaca environment variables
- `config.example.js` - Template konfigurasi (aman untuk GitHub)
- `ENVIRONMENT_SETUP.md` - Dokumentasi lengkap

## 🔒 Keamanan

- ✅ File `.env` sudah ada di `.gitignore`
- ✅ Kredensial sensitif dipindah dari `config.js`
- ✅ `config.example.js` menggunakan placeholder yang aman
- ✅ Fallback values untuk development
- ✅ Validasi otomatis environment variables

## 🚀 Production Deployment

Untuk production, set environment variables di hosting platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_APP_ENV=production
VITE_APP_DEBUG=false
```

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