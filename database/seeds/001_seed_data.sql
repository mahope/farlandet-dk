-- =====================================================
-- Farlandet.dk Seed Data
-- Initial data for categories, tags, and demo content
-- =====================================================

-- =====================================================
-- CATEGORIES SEED DATA
-- =====================================================

INSERT INTO categories (name, description, slug, color) VALUES
('Bøger', 'Anbefalede bøger om faderskab, opdragelse og familieliv', 'boger', '#3B82F6'),
('Podcasts', 'Podcasts om faderskab, forældre-tips og familieliv', 'podcasts', '#8B5CF6'),
('Artikler', 'Artikler og blogindlæg om faderskab', 'artikler', '#10B981'),
('Tips & Tricks', 'Praktiske tips og tricks til hverdagen som far', 'tips-tricks', '#F59E0B'),
('Videoer', 'Videoer om faderskab, aktiviteter og læring', 'videoer', '#EF4444'),
('Film', 'Anbefalede film til hele familien', 'film', '#EC4899'),
('TV-serier', 'TV-serier for børn og familier', 'tv-serier', '#6366F1'),
('Aktiviteter', 'Aktiviteter og oplevelser med børn', 'aktiviteter', '#14B8A6')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- TAGS SEED DATA
-- =====================================================

INSERT INTO tags (name, slug) VALUES
-- Alder relaterede tags
('0-1 år', '0-1-aar'),
('1-3 år', '1-3-aar'),
('3-6 år', '3-6-aar'),
('6-12 år', '6-12-aar'),
('Teenager', 'teenager'),

-- Tema tags
('Faderskab', 'faderskab'),
('Barselsorlov', 'barselsorlov'),
('Opdragelse', 'opdragelse'),
('Kommunikation', 'kommunikation'),
('Leg', 'leg'),
('Læring', 'laering'),
('Sundhed', 'sundhed'),
('Mental sundhed', 'mental-sundhed'),
('Kost', 'kost'),
('Søvn', 'soevn'),
('Rutiner', 'rutiner'),
('Grænser', 'graenser'),
('Følelser', 'foelelser'),

-- Aktivitets tags
('Outdoor', 'outdoor'),
('Indoor', 'indoor'),
('Sport', 'sport'),
('Kreativitet', 'kreativitet'),
('Håndværk', 'haandvaerk'),
('Musik', 'musik'),
('Læsning', 'laesning'),
('Spil', 'spil'),

-- Praktisk
('Økonomi', 'oekonomi'),
('Arbejde-liv balance', 'arbejde-liv-balance'),
('Samvær', 'samvaer'),
('Skilsmisse', 'skilsmisse'),
('Blandet familie', 'blandet-familie'),

-- Dansk specifikt
('Danske traditioner', 'danske-traditioner'),
('Danske værdier', 'danske-vaerdier')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- ADMIN USER
-- =====================================================
-- Password: admin123 (hashed with bcrypt)

INSERT INTO users (email, username, password_hash, role, email_verified) VALUES
('admin@farlandet.dk', 'Administrator', '$2b$10$3WzN/rTNOP0ITemYRwzBWekDEvQyD6AhyZvVsLY7qDMTpvy8mGjl6', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- DEMO RESOURCES (OPTIONAL - for testing)
-- =====================================================

-- Example resource 1
INSERT INTO resources (
    title,
    description,
    url,
    resource_type,
    category_id,
    submitter_email,
    status,
    vote_score,
    view_count,
    approved_at
) VALUES (
    'Far & Barn - Podcast om moderne faderskab',
    'En dansk podcast der tager fat i de udfordringer og glæder som moderne fædre møder. Hver uge nye emner om opdragelse, balance mellem arbejde og familieliv.',
    'https://www.example.com/far-barn-podcast',
    'podcast',
    (SELECT id FROM categories WHERE slug = 'podcasts'),
    'demo@farlandet.dk',
    'approved',
    5,
    42,
    CURRENT_TIMESTAMP
),
(
    'Den Moderne Fars Håndbog',
    'Denne bog guider dig gennem faderskabets mange faser, fra graviditet til teenage-årene. Fuld af praktiske råd og personlige historier.',
    'https://www.example.com/moderne-fars-haandbog',
    'book',
    (SELECT id FROM categories WHERE slug = 'boger'),
    'demo@farlandet.dk',
    'approved',
    8,
    67,
    CURRENT_TIMESTAMP
),
(
    '10 sjove indendørs aktiviteter på regnvejrsdage',
    'Guide til aktiviteter du kan lave med dine børn når vejret ikke indbyder til udeleg. Kreative og sjove idéer der holder børnene underholdt.',
    'https://www.example.com/indendors-aktiviteter',
    'article',
    (SELECT id FROM categories WHERE slug = 'artikler'),
    'demo@farlandet.dk',
    'approved',
    12,
    156,
    CURRENT_TIMESTAMP
),
(
    'Sådan laver du den perfekte pandekage',
    'Nem og hurtig opskrift på pandekager som børnene elsker. Perfekt til lazy søndage eller hurtige hverdagsmorgener.',
    'https://www.example.com/pandekage-opskrift',
    'tip',
    (SELECT id FROM categories WHERE slug = 'tips-tricks'),
    'demo@farlandet.dk',
    'approved',
    15,
    203,
    CURRENT_TIMESTAMP
);

-- Link demo tags to resources
INSERT INTO resource_tags (resource_id, tag_id)
SELECT
    r.id,
    t.id
FROM resources r
CROSS JOIN tags t
WHERE
    (r.title LIKE '%Podcast%' AND t.slug IN ('faderskab', 'kommunikation', 'mental-sundhed'))
    OR (r.title LIKE '%Håndbog%' AND t.slug IN ('faderskab', 'opdragelse', '0-1-aar', '1-3-aar'))
    OR (r.title LIKE '%indendørs%' AND t.slug IN ('indoor', 'leg', 'kreativitet', 'regnvejr'))
    OR (r.title LIKE '%pandekage%' AND t.slug IN ('kost', 'samvaer'))
ON CONFLICT (resource_id, tag_id) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES (optional - for testing)
-- =====================================================

-- Uncomment to verify data after running seed

-- SELECT 'Categories created:' as info, COUNT(*) as count FROM categories;
-- SELECT 'Tags created:' as info, COUNT(*) as count FROM tags;
-- SELECT 'Resources created:' as info, COUNT(*) as count FROM resources;
-- SELECT 'Resource tags created:' as info, COUNT(*) as count FROM resource_tags;

-- =====================================================
-- END OF SEED DATA
-- =====================================================
