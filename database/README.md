# Database Migrations & Seed Data

Dette directory indeholder database migrations og seed data for Farlandet.dk PostgreSQL databasen.

## Oversigt

```
database/
├── migrations/
│   └── 001_initial_schema.sql    # Initial database schema
├── seeds/
│   └── 001_seed_data.sql         # Seed data (kategorier, tags, demo content)
└── README.md                      # Denne fil
```

## Forudsætninger

- PostgreSQL 12+ installeret
- Database oprettet (f.eks. `farlandet`)
- Database credentials konfigureret i `.env` filen

## Opret Database

Hvis du ikke allerede har oprettet databasen:

```bash
# Log ind i PostgreSQL
psql -U postgres

# Opret database
CREATE DATABASE farlandet;

# Opret database bruger (valgfrit)
CREATE USER farlandet_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE farlandet TO farlandet_user;

# Afslut psql
\q
```

## Kør Migrations

### Metode 1: Via psql kommandolinje

```bash
# Kør initial schema migration
psql -U postgres -d farlandet -f database/migrations/001_initial_schema.sql

# Kør seed data
psql -U postgres -d farlandet -f database/seeds/001_seed_data.sql
```

### Metode 2: Via environment variables

```bash
# Hvis du har sat PGPASSWORD environment variable
export PGPASSWORD='your_password'
psql -U postgres -d farlandet -f database/migrations/001_initial_schema.sql
psql -U postgres -d farlandet -f database/seeds/001_seed_data.sql
```

### Metode 3: Med connection string

```bash
psql "postgresql://username:password@localhost:5432/farlandet" -f database/migrations/001_initial_schema.sql
psql "postgresql://username:password@localhost:5432/farlandet" -f database/seeds/001_seed_data.sql
```

## Hurtig Setup Script

Du kan også bruge det inkluderede setup script:

```bash
# Gør scriptet eksekverbart (Linux/Mac)
chmod +x database/setup_db.sh

# Kør setup (Linux/Mac)
./database/setup_db.sh

# Eller kør direkte med bash
bash database/setup_db.sh
```

## Hvad Opretter Migrations?

### Tabeller

1. **users** - Bruger profiler med authentication
2. **categories** - Ressource kategorier (8 kategorier)
3. **tags** - Fleksibel tagging system (30+ tags)
4. **resources** - Hovedindhold med moderation workflow
5. **resource_tags** - Many-to-many relation mellem resources og tags
6. **votes** - Community voting system (upvote/downvote)
7. **comments** - Bruger kommentarer med soft deletion

### Features

- **Automatiske Timestamps**: `created_at` og `updated_at` opdateres automatisk
- **Vote Score Calculation**: Trigger der automatisk beregner vote_score ved ændringer
- **Full Text Search**: GIN indexes på title og description for hurtig søgning
- **Database View**: `approved_resources_view` med alle relations pre-joined
- **Data Integritet**: Foreign keys med CASCADE og SET NULL policies

### Indexes

Optimeret for hurtig data retrieval:
- Status, type, category indexes for filtrering
- Full-text search indexes for søgning
- Vote score og created_at for sortering
- Unique constraints på kritiske relationer

## Hvad Indeholder Seed Data?

### Kategorier (8)
- Bøger
- Podcasts
- Artikler
- Tips & Tricks
- Videoer
- Film
- TV-serier
- Aktiviteter

### Tags (30+)
Kategoriseret efter:
- Aldersgrupper (0-1 år, 1-3 år, osv.)
- Temaer (Faderskab, Opdragelse, Kommunikation, osv.)
- Aktiviteter (Outdoor, Sport, Kreativitet, osv.)
- Praktiske emner (Økonomi, Arbejde-liv balance, osv.)

### Demo Resources (4)
- Podcast om moderne faderskab
- Bog: Den Moderne Fars Håndbog
- Artikel: Indendørs aktiviteter
- Tip: Pandekage opskrift

## Verificer Installation

Efter at have kørt migrations, verificer at alt er oprettet korrekt:

```sql
-- Tjek tabeller
\dt

-- Tjek antal kategorier
SELECT COUNT(*) FROM categories;

-- Tjek antal tags
SELECT COUNT(*) FROM tags;

-- Tjek demo resources
SELECT id, title, status FROM resources;

-- Tjek approved resources view
SELECT * FROM approved_resources_view;
```

## Reset Database

Hvis du vil starte forfra:

```sql
-- Drop alle tabeller (PAS PÅ - dette sletter alt data!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Derefter kan du køre migrations igen.

## Troubleshooting

### "relation already exists" error
Tabellerne eksisterer allerede. Enten:
1. Drop eksisterende tabeller først
2. Eller skip migration hvis data skal bevares

### "permission denied" error
Sørg for at din database bruger har de nødvendige rettigheder:
```sql
GRANT ALL PRIVILEGES ON DATABASE farlandet TO your_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
```

### UUID extension error
Hvis `uuid-ossp` extension ikke kan oprettes:
```sql
-- Som superuser (postgres)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Næste Skridt

Efter database setup:

1. Opdater `.env` fil med database credentials
2. Test database connection fra applikationen
3. Start development server: `npm run dev`
4. Tilgå admin panel for at moderere resources

## Database Backup

Husk at lave regelmæssige backups:

```bash
# Backup hele databasen
pg_dump -U postgres farlandet > backup_$(date +%Y%m%d).sql

# Restore fra backup
psql -U postgres farlandet < backup_20240101.sql
```
