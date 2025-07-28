# Panduan Deployment Vercel untuk LaliLink

Panduan ini menjelaskan cara deploy aplikasi LaliLink ke Vercel dengan konfigurasi environment variables yang benar.

## 🚀 Quick Deploy

### 1. Persiapan Repository

Pastikan semua file berikut ada di repository:
- `build-config.js` - Script untuk generate config.js dengan env vars
- `vercel.json` - Konfigurasi deployment Vercel
- `package.json` - Sudah ada script `build:vercel`

### 2. Setup di Vercel Dashboard

1. **Import Project**
   - Login ke [vercel.com](https://vercel.com)
   - Klik "New Project"
   - Import repository GitHub Anda

2. **Configure Environment Variables**
   
   Di Vercel Dashboard → Project Settings → Environment Variables, tambahkan:
   
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_APP_ENV=production
   VITE_APP_DEBUG=false
   ```

3. **Deploy**
   - Klik "Deploy"
   - Vercel akan otomatis menjalankan `npm run build:vercel`
   - Script akan generate `config.js` dengan environment variables

## 🔧 Cara Kerja Build Process

### Build Script (`build-config.js`)

Script ini akan:
1. Membaca environment variables dari Vercel
2. Generate file `config.js` baru dengan values yang sudah diinjeksi
3. Mengganti file `config.js` yang ada dengan versi build-time

### Vercel Configuration (`vercel.json`)

- **buildCommand**: `npm run build:vercel` - Menjalankan build script
- **outputDirectory**: `.` - Root directory sebagai output
- **routes**: Konfigurasi routing untuk SPA
- **headers**: Security headers untuk production

## 🔍 Troubleshooting

### Environment Variables Tidak Terbaca

**Gejala**: Config masih menunjukkan placeholder values

**Solusi**:
1. Cek environment variables di Vercel Dashboard
2. Pastikan nama variable exact match: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. Redeploy project setelah menambah/mengubah env vars

### Build Gagal

**Gejala**: Deployment error saat build

**Solusi**:
1. Cek build logs di Vercel Dashboard
2. Pastikan `build-config.js` ada dan executable
3. Cek syntax error di `build-config.js`

### Static Files Tidak Terbaca

**Gejala**: 404 error untuk assets/css/js

**Solusi**:
1. Cek konfigurasi routes di `vercel.json`
2. Pastikan path assets sesuai dengan struktur folder

## 📝 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|----------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key | `eyJ0eXAiOiJKV1Q...` |
| `VITE_APP_ENV` | ❌ | Environment name | `production` (default) |
| `VITE_APP_DEBUG` | ❌ | Debug mode | `false` (default) |

## 🔄 Update Deployment

### Mengubah Environment Variables

1. Update di Vercel Dashboard → Environment Variables
2. Trigger redeploy:
   ```bash
   # Via Vercel CLI
   vercel --prod
   
   # Atau push commit baru ke repository
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

### Update Code

Setiap push ke branch main akan otomatis trigger deployment baru.

## 🛡️ Security Notes

- Environment variables di Vercel terenkripsi dan aman
- File `config.js` akan di-generate ulang setiap deployment
- Jangan commit file `config.js` yang sudah berisi credentials
- Gunakan `config.example.js` untuk template di repository

## 📚 Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Static Site Deployment](https://vercel.com/docs/concepts/deployments/overview)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/environment-variables)

---

**Catatan**: Setelah deployment berhasil, aplikasi akan tersedia di URL yang diberikan Vercel (contoh: `https://your-app.vercel.app`)