# 🚀 Quick Setup Guide - Farlandet.dk

## 1. Install Dependencies
```bash
npm install
```

## 2. Supabase Setup (Required)

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Name: `farlandet`, Region: `Europe (eu-west-1)`
3. Generate strong database password

### 2.2 Get Connection Info
1. Settings → API in Supabase dashboard
2. Copy **Project URL** and **anon public** key
3. Update `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-long-key
```

### 2.3 Run Database Migrations
Go to **SQL Editor** in Supabase and run these files in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql` 
3. `supabase/migrations/003_functions.sql`
4. `supabase/migrations/004_add_resource_metadata.sql`
5. `supabase/seed.sql` (adds categories & tags)

## 3. Start Development
```bash
npm run dev
```

✅ Check console for "Database connection successful!" message

## 4. Test Features

### Core Functionality:
- 🏠 **Homepage**: Browse recent resources
- 📊 **Resources page**: Full listing with filters
- ➕ **Submit resources**: Add new content (requires auth)
- 🔐 **Authentication**: Sign up/in system

### Testing Database:
Open dev console and run:
```js
window.testDB()  // Test connection
window.testData() // Check categories/tags
```

## Troubleshooting

**Yellow banner shows?** → Supabase not configured properly, check `.env`

**"Invalid API key" error?** → Double-check ANON_KEY (no spaces)

**No categories/tags?** → Run `seed.sql` again

**Auth errors?** → Check RLS policies are enabled

## Next Steps (Post-Setup)
1. ✅ Configure authentication providers (Google, Apple, Facebook)
2. ✅ Setup storage buckets for file uploads
3. ✅ Add custom domain and SSL certificate
4. ✅ Deploy to production (Vercel/Netlify)

---

**Need help?** Check `/supabase/setup.md` for detailed instructions!