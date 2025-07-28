# LaliLink - Simple Credential Management System

LaliLink is a web application for credential management with role-based authentication and responsive interface.

## 🚀 Key Features

- **Client Management**: Easily manage client information
- **Application Management**: Organize applications by client
- **Credential Management**: Store username/password securely
- **Role-Based Access Control (RBAC)**: Admin and Viewer with different permissions
- **Security**: Row Level Security (RLS) and secure authentication
- **Responsive UI**: Mobile-first design with Tailwind CSS
- **Copy to Clipboard**: Safely copy credentials
- **Search & Filter**: Real-time search across all entities

## 🛠️ Technology Stack

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

## 📋 Prerequisites

- Node.js (for development server)
- Supabase account
- Modern browser

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

1. Create a new project at [Supabase](https://supabase.com)
2. Run SQL migrations from `database/schema.sql`
3. Setup Row Level Security policies from `database/policies.sql`
4. Get URL and ANON_KEY from project settings

### 4. Configuration

⚠️ **IMPORTANT**: Never commit `config.js` file to repository!

1. Copy configuration template:
```bash
cp config.example.js config.js
```

2. Edit `config.js` file and update Supabase configuration:
```javascript
const CONFIG = {
    SUPABASE: {
        URL: 'YOUR_SUPABASE_URL_HERE',
        ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE'
    },
    // ... other configurations are already set
};
```

3. `config.js` file is already in `.gitignore` for security

### 5. Run Development Server

```bash
npm run dev
```

Open browser and access `http://localhost:8080`

## 📁 Project Structure

```
lalilupa/
├── index.html              # Main HTML file
├── config.js               # Application configuration
├── package.json            # Dependencies and scripts
├── assets/
│   └── js/
│       ├── main.js         # Main application logic
│       ├── auth.js         # Authentication manager
│       ├── database.js     # Database operations
│       ├── security.js     # Security utilities
│       ├── ui.js           # UI management
│       └── clipboard.js    # Clipboard operations
├── database/
│   ├── schema.sql          # Database schema
│   └── policies.sql        # RLS policies
└── README.md               # This documentation
```

## 🔐 Security

### ⚠️ Configuration Security
- **DO NOT** commit `config.js` file to repository
- **USE** `config.example.js` as template
- **STORE** Supabase credentials in environment variables for production
- **ENABLE** 2FA on your Supabase account

### Data Storage
- **Plain Text Storage**: Passwords are stored as plain text in database
- **Database Security**: Protected by Row Level Security (RLS)
- **Access Control**: User-based data isolation

### Authentication
- **Supabase Auth**: Email/password authentication
- **JWT Tokens**: Secure session management
- **Role-based Access**: Admin and Viewer permissions

### Database Security
- **Row Level Security (RLS)**: User-based data access
- **SQL Injection Prevention**: Parameterized queries
- **Audit Logging**: Track all CRUD operations

### Best Practices
- Always use HTTPS in production
- Don't share Supabase credentials
- Backup database regularly
- Monitor suspicious user activities

## 👥 Role & Permissions

### Admin
- ✅ Create, Read, Update, Delete all entities
- ✅ Manage user roles
- ✅ Access user management
- ✅ Full system access

### Viewer
- ✅ Read all entities
- ❌ Create, Update, Delete operations
- ❌ User management access
- ❌ Role modifications

## 🎯 Usage

### 1. Registration/Login
- Register with email and password
- Email verification (if enabled)
- Login with credentials

### 2. Client Management
- Add new client with complete information
- Edit client information
- Delete client (will delete all related data)

### 3. Application Management
- Select client first
- Add application for that client
- Manage URL and application description

### 4. Credential Management
- Select application first
- Add credentials with username/password
- Passwords are stored securely
- Copy credentials to clipboard safely

### 5. User Management (Admin Only)
- View all registered users
- Change user roles (Admin/Viewer)
- Monitor user activities

## 🔧 Development

### Scripts
```bash
npm run dev     # Start development server (live-server)
npm start       # Start production server (http-server)
```

### Code Structure

#### Main App (`main.js`)
- Orchestrates all modules
- Handles authentication flow
- Manages application state

#### Authentication (`auth.js`)
- User sign in/up/out
- Session management
- Role-based permissions

#### Database (`database.js`)
- CRUD operations for all entities
- Caching mechanism
- Error handling

#### Security (`security.js`)
- Security utilities
- Secure password generation
- Input validation

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
   - Check URL and ANON_KEY in `config.js`
   - Ensure Supabase project is active

2. **Authentication Failed**
   - Check email verification
   - Verify RLS policies in Supabase

3. **Permission Denied**
   - Check user role in database
   - Verify RLS policies

4. **UI Issues**
   - Clear browser cache
   - Check browser console for errors

### Debug Mode

Open browser console to see detailed logs:
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
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

## 📄 License

This project uses MIT License. See `LICENSE` file for details.

## 🆘 Support

If you encounter issues or have questions:

1. Check existing [Issues](../../issues)
2. Create new issue with complete details
3. Include browser version and error logs

## 🔄 Changelog

### v1.0.0 (Current)
- ✅ Basic CRUD operations
- ✅ Role-based access control
- ✅ Secure data storage
- ✅ Responsive UI
- ✅ Search functionality
- ✅ Clipboard integration
- ✅ Password visibility toggle
- ✅ Dark theme support

### Planned Features
- 🔄 Password encryption
- 🔄 Backup/Export functionality
- 🔄 Advanced search filters
- 🔄 Activity audit logs
- 🔄 Multi-language support
- 🔄 Mobile app (PWA)

---

**LaliLink** - Simple, Secure, Scalable Credential Management 🔐