# 🚀 Supabase Database Setup Guide

## 1. Opret Supabase Projekt

1. Gå til https://supabase.com
2. Klik "Start your project" og log ind
3. Klik "New Project"
4. Udfyld:
   - **Name:** `farlandet`
   - **Database Password:** Generer stærk kodeord (gem det!)
   - **Region:** `Europe (eu-west-1)`
5. Klik "Create new project" (tager 2 minutter)

## 2. Hent Connection Info

Når projektet er klar:

1. Gå til **Settings** > **API** i sidebar
2. Find **Project URL** og **anon public** key
3. Kopier værdierne til `.env` filen i rod-mappen:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...dit-lange-key
```

## 3. Kør Database Migrationer

I Supabase dashboard, gå til **SQL Editor** og kør følgende filer i rækkefølge:

### 3.1 Initial Schema
Kopier indhold fra `migrations/001_initial_schema.sql` og kør det.

### 3.2 RLS Policies  
Kopier indhold fra `migrations/002_rls_policies.sql` og kør det.

### 3.3 Functions
Kopier indhold fra `migrations/003_functions.sql` og kør det.

### 3.4 Metadata Column
Kopier indhold fra `migrations/004_add_resource_metadata.sql` og kør det.

### 3.5 Seed Data
Kopier indhold fra `seed.sql` og kør det for at få test-kategorier og tags.

## 4. Verificer Setup

Gå til **Database** > **Tables** og tjek at du har:
- ✅ categories (8 records)
- ✅ tags (49 records) 
- ✅ user_profiles
- ✅ resources
- ✅ resource_tags
- ✅ votes
- ✅ comments

## 5. Test Forbindelse

Kør `npm run dev` og tjek konsollen for fejl. Du skulle nu se fallback kategorier/tags loade korrekt.

## 6. Storage Buckets (Valgfri)

Hvis du vil uploade filer:

1. Gå til **Storage** i Supabase dashboard
2. Opret bucket kaldet `resources` (public)
3. Opret bucket kaldet `avatars` (public)

## Troubleshooting

**Problem:** "Invalid API key" fejl
**Løsning:** Tjek at VITE_SUPABASE_ANON_KEY er kopieret korrekt (ingen mellemrum)

**Problem:** RLS fejl
**Løsning:** Kør RLS policies igen og tjek at de er enabled på alle tabeller

**Problem:** No data vises
**Løsning:** Kør seed.sql igen og tjek at data er indsat korrekt