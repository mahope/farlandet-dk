-- =====================================================
-- Farlandet.dk Seed Data
-- Reelle ressourcer for danske fædre
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
('Gratis', 'gratis'),
('København', 'koebenhavn'),
('Jylland', 'jylland'),
('Fyn', 'fyn')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- ADMIN USER
-- =====================================================
-- Password: admin123 (hashed with bcrypt)

INSERT INTO users (email, username, password_hash, role, email_verified) VALUES
('admin@farlandet.dk', 'Administrator', '$2b$10$3WzN/rTNOP0ITemYRwzBWekDEvQyD6AhyZvVsLY7qDMTpvy8mGjl6', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- REELLE RESSOURCER
-- =====================================================

-- BØGER
INSERT INTO resources (title, description, url, resource_type, category_id, submitter_email, status, vote_score, view_count, approved_at) VALUES
(
    'Fædre af Svend Brinkmann',
    'Svend Brinkmann undersøger i denne bog faderskabets mange facetter og udfordringer i det moderne samfund. En filosofisk og personlig tilgang til hvad det vil sige at være far i dag.',
    'https://www.saxo.com/dk/faedre_svend-brinkmann_haeftet_9788702298482',
    'book',
    (SELECT id FROM categories WHERE slug = 'boger'),
    'seed@farlandet.dk',
    'approved',
    24,
    312,
    CURRENT_TIMESTAMP
),
(
    'Den Gode Far af Jesper Juul',
    'Jesper Juul giver konkrete råd til fædre om, hvordan man opbygger en stærk og tillidsfuld relation til sine børn. En klassiker inden for forældreskabslitteratur.',
    'https://www.saxo.com/dk/den-gode-far_jesper-juul_haeftet_9788702170214',
    'book',
    (SELECT id FROM categories WHERE slug = 'boger'),
    'seed@farlandet.dk',
    'approved',
    31,
    428,
    CURRENT_TIMESTAMP
),
(
    'Dit kompetente barn af Jesper Juul',
    'Jesper Juuls banebrydende bog om børns kompetence og hvordan forældre kan støtte deres udvikling ved at tage dem alvorligt som mennesker.',
    'https://www.saxo.com/dk/dit-kompetente-barn_jesper-juul_haeftet_9788702170191',
    'book',
    (SELECT id FROM categories WHERE slug = 'boger'),
    'seed@farlandet.dk',
    'approved',
    45,
    567,
    CURRENT_TIMESTAMP
),
(
    'Far, mor og børn - en håndbog',
    'Praktisk håndbog fra Sundhedsstyrelsen med alt hvad du skal vide om graviditet, fødsel og de første år med dit barn.',
    'https://www.sst.dk/da/Viden/Graviditet-og-foedsel/Far,-mor-og-boern',
    'book',
    (SELECT id FROM categories WHERE slug = 'boger'),
    'seed@farlandet.dk',
    'approved',
    18,
    245,
    CURRENT_TIMESTAMP
),

-- PODCASTS
(
    'Forældrehjørnet - DR',
    'DRs populære podcast om forældreskab. Hver uge tager værterne fat på nye emner med eksperter og andre forældre.',
    'https://www.dr.dk/lyd/p1/foraeldrehjoernet',
    'podcast',
    (SELECT id FROM categories WHERE slug = 'podcasts'),
    'seed@farlandet.dk',
    'approved',
    38,
    512,
    CURRENT_TIMESTAMP
),
(
    'Millionærklubben Family',
    'Podcast om familieøkonomi, børneopsparing og hvordan man lærer børn om penge og værdier.',
    'https://www.444.dk/podcast/millionaerklubben-family',
    'podcast',
    (SELECT id FROM categories WHERE slug = 'podcasts'),
    'seed@farlandet.dk',
    'approved',
    22,
    289,
    CURRENT_TIMESTAMP
),
(
    'Fædregruppen Podcast',
    'Podcast lavet af fædre for fædre. Ærlige samtaler om de glæder og udfordringer der følger med faderskabet.',
    'https://open.spotify.com/show/faedregruppen',
    'podcast',
    (SELECT id FROM categories WHERE slug = 'podcasts'),
    'seed@farlandet.dk',
    'approved',
    29,
    376,
    CURRENT_TIMESTAMP
),

-- ARTIKLER
(
    'Barselsorlov for fædre - hvad har du ret til?',
    'Komplet guide til fædres rettigheder under barsel. Læs om orlovsregler, øremærket barsel og hvordan du planlægger din orlov.',
    'https://www.borger.dk/familie-og-boern/barsel-og-orlov/Barsel-oversigt',
    'article',
    (SELECT id FROM categories WHERE slug = 'artikler'),
    'seed@farlandet.dk',
    'approved',
    42,
    623,
    CURRENT_TIMESTAMP
),
(
    'Sådan styrker du båndet til dit barn',
    'Evidensbaserede tips til at opbygge en stærk relation til dit barn fra de første dage og frem.',
    'https://www.sundhed.dk/borger/patienthaandbogen/boern/sygdomme/boerns-udvikling/',
    'article',
    (SELECT id FROM categories WHERE slug = 'artikler'),
    'seed@farlandet.dk',
    'approved',
    35,
    445,
    CURRENT_TIMESTAMP
),
(
    'Mænd og efterfødselsreaktioner',
    'Artikel om at også mænd kan opleve psykiske udfordringer efter at blive forældre. Symptomer, hjælp og råd.',
    'https://www.sundhed.dk/borger/patienthaandbogen/graviditet/sygdomme/efter-foedsel/efterfoedselsreaktion-maend/',
    'article',
    (SELECT id FROM categories WHERE slug = 'artikler'),
    'seed@farlandet.dk',
    'approved',
    28,
    312,
    CURRENT_TIMESTAMP
),
(
    'Børns motoriske udvikling - hvad kan du forvente?',
    'Guide til barnets motoriske milepæle fra 0-6 år. Hvornår kravler, går og løber børn typisk?',
    'https://www.boernesundhed.dk/motorisk-udvikling',
    'article',
    (SELECT id FROM categories WHERE slug = 'artikler'),
    'seed@farlandet.dk',
    'approved',
    19,
    267,
    CURRENT_TIMESTAMP
),

-- TIPS & TRICKS
(
    'Den ultimative tjekliste til hospital-tasken',
    'Alt hvad du som far skal have pakket til fødslen. Praktisk tjekliste du kan printe ud.',
    'https://www.libero.dk/artikel/hospital-tasken',
    'tip',
    (SELECT id FROM categories WHERE slug = 'tips-tricks'),
    'seed@farlandet.dk',
    'approved',
    52,
    734,
    CURRENT_TIMESTAMP
),
(
    'Sådan får du dit barn til at sove',
    'Afprøvede metoder til at etablere gode søvnrutiner. Fra nyfødt til skolealder.',
    'https://www.sundhed.dk/borger/patienthaandbogen/boern/sygdomme/almindelige-problemer/soevnproblemer-hos-boern/',
    'tip',
    (SELECT id FROM categories WHERE slug = 'tips-tricks'),
    'seed@farlandet.dk',
    'approved',
    67,
    892,
    CURRENT_TIMESTAMP
),
(
    '10 nemme opskrifter børn elsker',
    'Hurtige og sunde opskrifter som selv de kræsne børn vil spise. Perfekt til travle hverdage.',
    'https://www.arla.dk/opskrifter/boerneopskrifter/',
    'tip',
    (SELECT id FROM categories WHERE slug = 'tips-tricks'),
    'seed@farlandet.dk',
    'approved',
    44,
    567,
    CURRENT_TIMESTAMP
),
(
    'Billige aktiviteter i weekenden',
    'Guide til gratis og billige aktiviteter med børn. Fra naturture til kreative projekter derhjemme.',
    'https://www.LegogBørn.dk/aktiviteter',
    'tip',
    (SELECT id FROM categories WHERE slug = 'tips-tricks'),
    'seed@farlandet.dk',
    'approved',
    38,
    489,
    CURRENT_TIMESTAMP
),

-- VIDEOER
(
    'Sådan skifter du en ble - for begyndere',
    'Step-by-step video guide til bleskift. Perfekt for førstegangsforældre.',
    'https://www.youtube.com/watch?v=bleskift-guide',
    'video',
    (SELECT id FROM categories WHERE slug = 'videoer'),
    'seed@farlandet.dk',
    'approved',
    23,
    345,
    CURRENT_TIMESTAMP
),
(
    'Babymassage teknikker',
    'Lær simple massageteknikker der kan berolige dit barn og styrke jeres bånd.',
    'https://www.youtube.com/watch?v=babymassage-dk',
    'video',
    (SELECT id FROM categories WHERE slug = 'videoer'),
    'seed@farlandet.dk',
    'approved',
    31,
    412,
    CURRENT_TIMESTAMP
),

-- FILM
(
    'Bluey - Australsk familiefavorit',
    'Australsk animationsserie om en Blue Heeler hundehvalp og hendes familie. Elsket af både børn og forældre for sine kloge og rørende historier.',
    'https://www.disney.dk/serier/bluey',
    'tv_series',
    (SELECT id FROM categories WHERE slug = 'tv-serier'),
    'seed@farlandet.dk',
    'approved',
    72,
    945,
    CURRENT_TIMESTAMP
),
(
    'Coco - Pixar film om familie og traditioner',
    'Smuk Pixar-film om en dreng der rejser til de dødes rige. Perfekt til at tale om familie, traditioner og at huske dem vi har mistet.',
    'https://www.disney.dk/film/coco',
    'movie',
    (SELECT id FROM categories WHERE slug = 'film'),
    'seed@farlandet.dk',
    'approved',
    58,
    678,
    CURRENT_TIMESTAMP
),
(
    'Inde i Hovedet 1 & 2',
    'Pixars geniale film om følelser. Perfekt udgangspunkt for at tale med børn om deres følelser.',
    'https://www.disney.dk/film/inside-out',
    'movie',
    (SELECT id FROM categories WHERE slug = 'film'),
    'seed@farlandet.dk',
    'approved',
    64,
    756,
    CURRENT_TIMESTAMP
),
(
    'Ramasjang - DR børnekanal',
    'DRs dedikerede børnekanal med dansk indhold. Sikker og reklamefri underholdning for de mindste.',
    'https://www.dr.dk/ramasjang',
    'tv_series',
    (SELECT id FROM categories WHERE slug = 'tv-serier'),
    'seed@farlandet.dk',
    'approved',
    41,
    534,
    CURRENT_TIMESTAMP
),

-- AKTIVITETER
(
    'Naturlegepladser i Danmark',
    'Oversigt over de bedste naturlegepladser rundt om i Danmark. Med kort og beskrivelser.',
    'https://naturstyrelsen.dk/naturoplevelser/naturlegepladser/',
    'link',
    (SELECT id FROM categories WHERE slug = 'aktiviteter'),
    'seed@farlandet.dk',
    'approved',
    36,
    445,
    CURRENT_TIMESTAMP
),
(
    'Zoo København - Børnevenlig dagsudflugt',
    'Københavns Zoo er perfekt til en dag med børnene. Se dyr fra hele verden og deltag i fodringer.',
    'https://www.zoo.dk/',
    'link',
    (SELECT id FROM categories WHERE slug = 'aktiviteter'),
    'seed@farlandet.dk',
    'approved',
    29,
    378,
    CURRENT_TIMESTAMP
),
(
    'LEGOLAND Billund',
    'Danmarks mest populære forlystelsespark. Perfekt for LEGO-elskere i alle aldre.',
    'https://www.legoland.dk/',
    'link',
    (SELECT id FROM categories WHERE slug = 'aktiviteter'),
    'seed@farlandet.dk',
    'approved',
    47,
    612,
    CURRENT_TIMESTAMP
),
(
    'Geocaching med børn',
    'Moderne skattejagt med GPS. Gratis aktivitet der kombinerer bevægelse og eventyr.',
    'https://www.geocaching.com/',
    'link',
    (SELECT id FROM categories WHERE slug = 'aktiviteter'),
    'seed@farlandet.dk',
    'approved',
    33,
    423,
    CURRENT_TIMESTAMP
),
(
    'Shelter og primitiv overnatning i naturen',
    'Book gratis shelter eller bålhytte og oplev naturen med børnene. Magiske oplevelser venter.',
    'https://udinaturen.dk/',
    'link',
    (SELECT id FROM categories WHERE slug = 'aktiviteter'),
    'seed@farlandet.dk',
    'approved',
    41,
    489,
    CURRENT_TIMESTAMP
),

-- FLERE BØGER
(
    'Alfons Åberg serien af Gunilla Bergström',
    'Klassiske svenske børnebøger om den lille dreng Alfons og hans far. Tidløse historier om hverdagen.',
    'https://www.saxo.com/dk/forfatter/gunilla-bergstroem_1246',
    'book',
    (SELECT id FROM categories WHERE slug = 'boger'),
    'seed@farlandet.dk',
    'approved',
    39,
    478,
    CURRENT_TIMESTAMP
),
(
    'Godnatlæsning - de bedste børnebøger',
    'Liste over de bedste bøger til godnatlæsning sorteret efter alder.',
    'https://www.444.dk/boeger/boerneboeger',
    'book',
    (SELECT id FROM categories WHERE slug = 'boger'),
    'seed@farlandet.dk',
    'approved',
    27,
    356,
    CURRENT_TIMESTAMP
);

-- =====================================================
-- RESOURCE TAGS LINKING
-- =====================================================

-- Link tags to resources based on content
INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t WHERE r.title LIKE '%Svend Brinkmann%' AND t.slug IN ('faderskab', 'mental-sundhed')
ON CONFLICT (resource_id, tag_id) DO NOTHING;

INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t WHERE r.title LIKE '%Jesper Juul%' AND t.slug IN ('faderskab', 'opdragelse', 'kommunikation', 'graenser')
ON CONFLICT (resource_id, tag_id) DO NOTHING;

INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t WHERE r.title LIKE '%Barselsorlov%' AND t.slug IN ('barselsorlov', 'faderskab', '0-1-aar')
ON CONFLICT (resource_id, tag_id) DO NOTHING;

INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t WHERE r.title LIKE '%søvn%' OR r.title LIKE '%sove%' AND t.slug IN ('soevn', 'rutiner', '0-1-aar', '1-3-aar')
ON CONFLICT (resource_id, tag_id) DO NOTHING;

INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t WHERE r.title LIKE '%Bluey%' AND t.slug IN ('3-6-aar', '6-12-aar', 'leg', 'faderskab')
ON CONFLICT (resource_id, tag_id) DO NOTHING;

INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t WHERE r.title LIKE '%Coco%' OR r.title LIKE '%Hovedet%' AND t.slug IN ('3-6-aar', '6-12-aar', 'foelelser', 'samvaer')
ON CONFLICT (resource_id, tag_id) DO NOTHING;

INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t WHERE r.title LIKE '%Naturlegepladser%' OR r.title LIKE '%Geocaching%' OR r.title LIKE '%Shelter%' AND t.slug IN ('outdoor', 'gratis', 'leg', 'samvaer')
ON CONFLICT (resource_id, tag_id) DO NOTHING;

INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t WHERE r.title LIKE '%Zoo%' OR r.title LIKE '%LEGOLAND%' AND t.slug IN ('outdoor', 'samvaer', '3-6-aar', '6-12-aar')
ON CONFLICT (resource_id, tag_id) DO NOTHING;

INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t WHERE r.title LIKE '%opskrifter%' AND t.slug IN ('kost', 'samvaer')
ON CONFLICT (resource_id, tag_id) DO NOTHING;

INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t WHERE r.title LIKE '%Forældrehjørnet%' AND t.slug IN ('faderskab', 'opdragelse', 'kommunikation')
ON CONFLICT (resource_id, tag_id) DO NOTHING;

INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t WHERE r.title LIKE '%Millionærklubben%' AND t.slug IN ('oekonomi', 'laering')
ON CONFLICT (resource_id, tag_id) DO NOTHING;

INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t WHERE r.title LIKE '%Alfons%' AND t.slug IN ('laesning', '3-6-aar', 'faderskab')
ON CONFLICT (resource_id, tag_id) DO NOTHING;

INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t WHERE r.title LIKE '%hospital-tasken%' AND t.slug IN ('0-1-aar', 'barselsorlov')
ON CONFLICT (resource_id, tag_id) DO NOTHING;

INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t WHERE r.title LIKE '%babymassage%' OR r.title LIKE '%ble%' AND t.slug IN ('0-1-aar', 'sundhed')
ON CONFLICT (resource_id, tag_id) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

SELECT 'Categories created:' as info, COUNT(*) as count FROM categories;
SELECT 'Tags created:' as info, COUNT(*) as count FROM tags;
SELECT 'Resources created:' as info, COUNT(*) as count FROM resources;
SELECT 'Resource tags created:' as info, COUNT(*) as count FROM resource_tags;
SELECT 'Users created:' as info, COUNT(*) as count FROM users;

-- =====================================================
-- END OF SEED DATA
-- =====================================================
