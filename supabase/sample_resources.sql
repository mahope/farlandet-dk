-- Sample resources for Farlandet.dk
-- Run this SQL in Supabase to add 30 test resources across different categories

-- First, let's get the category IDs (these will be different for each database)
-- You'll need to replace these UUIDs with the actual ones from your categories table

-- Insert sample resources
INSERT INTO resources (title, description, url, resource_type, category_id, submitter_email, status, vote_score, view_count, created_at) VALUES

-- Forældreskab resources
('The Danish Way: A Guide to Happy Parenting', 'Dansk tilgang til opdragelse og familie-lykke baseret på hygge og balance', 'https://www.amazon.com/Danish-Way-Guide-Happy-Parenting/dp/1101905026', 'book', (SELECT id FROM categories WHERE slug = 'foraeldre'), 'admin@farlandet.dk', 'approved', 15, 124, NOW() - INTERVAL '1 days'),

('Sådan snakker du med teenagere', 'Praktiske råd til kommunikation med teenagere fra erfaren psykolog', 'https://www.youtube.com/watch?v=example1', 'video', (SELECT id FROM categories WHERE slug = 'foraeldre'), 'user1@example.com', 'approved', 23, 89, NOW() - INTERVAL '2 days'),

('Første hjælp for nye fædre', 'Grundlæggende guide til babypleje, søvn og praktiske tips', 'https://www.babycenter.com/baby/first-aid', 'article', (SELECT id FROM categories WHERE slug = 'foraeldre'), 'dad@newbie.dk', 'approved', 31, 203, NOW() - INTERVAL '3 days'),

('Konfliktløsning i familien', 'Sådan håndterer du uenigheder og konflikter mellem søskende', NULL, 'tip', (SELECT id FROM categories WHERE slug = 'foraeldre'), 'experienced@father.dk', 'approved', 8, 56, NOW() - INTERVAL '4 days'),

-- Sundhed & Trivsel
('Stærke Fædre: Træningsprogram for travle papfar', 'Effektiv 20-minutters træning du kan lave hjemme mellem bleskift', 'https://www.fitness.dk/fathers-workout', 'link', (SELECT id FROM categories WHERE slug = 'sundhed'), 'fit@dad.dk', 'approved', 42, 312, NOW() - INTERVAL '5 days'),

('Søvn og stress - Far edition', 'Podcast om hvordan fædre kan få bedre søvn og håndtere stress', 'https://open.spotify.com/show/fathers-sleep', 'podcast', (SELECT id FROM categories WHERE slug = 'sundhed'), 'sleepy@papa.dk', 'approved', 18, 145, NOW() - INTERVAL '6 days'),

('Mental sundhed for mænd', 'Guide til at erkende og håndtere depression og angst som far', 'https://www.psykiatrifonden.dk/fathers', 'article', (SELECT id FROM categories WHERE slug = 'sundhed'), 'support@mental.dk', 'approved', 67, 234, NOW() - INTERVAL '1 week'),

('Sund madpakke på 5 minutter', 'Hurtige, sunde madpakker til dig og børnene', NULL, 'tip', (SELECT id FROM categories WHERE slug = 'sundhed'), 'healthy@chef.dk', 'approved', 12, 78, NOW() - INTERVAL '8 days'),

-- Aktiviteter
('100 udendørs aktiviteter med børn', 'Inspiration til naturoplevelser hele året rundt i Danmark', 'https://www.naturstyrelsen.dk/fathers-guide', 'link', (SELECT id FROM categories WHERE slug = 'aktiviteter'), 'outdoor@explorer.dk', 'approved', 35, 189, NOW() - INTERVAL '9 days'),

('Bygge fuglehus med teenagere', 'DIY projekt der bringer far og teen sammen om noget kreativt', 'https://www.youtube.com/watch?v=birdhouse-project', 'video', (SELECT id FROM categories WHERE slug = 'aktiviteter'), 'diy@woodwork.dk', 'approved', 29, 156, NOW() - INTERVAL '10 days'),

('Regndags-aktiviteter guide', 'Kreative indendørs projekter når vejret er dårligt', NULL, 'tip', (SELECT id FROM categories WHERE slug = 'aktiviteter'), 'creative@indoor.dk', 'approved', 14, 92, NOW() - INTERVAL '11 days'),

('Far og Søn Fisketur', 'Bedste steder at fiske med børn i Danmark + udstyr guide', 'https://www.sportsfiskeren.dk/family-fishing', 'article', (SELECT id FROM categories WHERE slug = 'aktiviteter'), 'angler@fishing.dk', 'approved', 21, 134, NOW() - INTERVAL '12 days'),

-- Uddannelse
('Matematik for forældre', 'Hjælp dit barn med lektier selvom du havde samme problemer', 'https://www.matematikcenteret.dk/parents', 'link', (SELECT id FROM categories WHERE slug = 'uddannelse'), 'teacher@math.dk', 'approved', 16, 87, NOW() - INTERVAL '13 days'),

('Valg af gymnasium - Forældre guide', 'Sådan støtter du dit barn gennem gymnasievalg', 'https://www.ug.dk/parent-guide', 'article', (SELECT id FROM categories WHERE slug = 'uddannelse'), 'guidance@education.dk', 'approved', 24, 143, NOW() - INTERVAL '14 days'),

('Kreativ skrivning med børn', 'Øvelser til at inspirere børns fantasi og sprog', NULL, 'tip', (SELECT id FROM categories WHERE slug = 'uddannelse'), 'writer@creative.dk', 'approved', 9, 65, NOW() - INTERVAL '15 days'),

-- Økonomi
('Familiebudget der virker', 'Excel template og guide til økonomisk planlægning', 'https://www.mybanker.dk/family-budget', 'link', (SELECT id FROM categories WHERE slug = 'oekonomi'), 'finance@planner.dk', 'approved', 38, 287, NOW() - INTERVAL '16 days'),

('Børneopsparing strategies', 'Forskellige måder at spare op til dit barns fremtid', 'https://www.jyskebank.dk/children-savings', 'article', (SELECT id FROM categories WHERE slug = 'oekonomi'), 'savings@bank.dk', 'approved', 27, 178, NOW() - INTERVAL '17 days'),

('SU og ungdomsuddannelse', 'Guide til økonomi når dit barn starter på uddannelse', NULL, 'tip', (SELECT id FROM categories WHERE slug = 'oekonomi'), 'student@economy.dk', 'approved', 11, 94, NOW() - INTERVAL '18 days'),

-- Teknologi
('Forældrekontrol på mobilen', 'Bedste apps til at holde øje med børnenes skærmtid', 'https://www.sikkerdigital.dk/parental-control', 'link', (SELECT id FROM categories WHERE slug = 'teknologi'), 'tech@safety.dk', 'approved', 33, 201, NOW() - INTERVAL '19 days'),

('Programmering for børn', 'Scratch og Python - sådan lærer I sammen', 'https://www.kodning.dk/family-coding', 'article', (SELECT id FROM categories WHERE slug = 'teknologi'), 'coder@family.dk', 'approved', 19, 112, NOW() - INTERVAL '20 days'),

('Digital sikkerhed for familier', 'Beskyt familien mod online trusler og scams', NULL, 'tip', (SELECT id FROM categories WHERE slug = 'teknologi'), 'security@expert.dk', 'approved', 45, 298, NOW() - INTERVAL '21 days'),

-- Karriere
('Fleksible arbejdstider som far', 'Sådan forhandler du bedre work-life balance', 'https://www.flexjob.dk/fathers-guide', 'article', (SELECT id FROM categories WHERE slug = 'karriere'), 'balance@work.dk', 'approved', 52, 324, NOW() - INTERVAL '22 days'),

('Hjemmearbejde med børn', 'Praktiske tips til at være produktiv hjemmefra', NULL, 'tip', (SELECT id FROM categories WHERE slug = 'karriere'), 'remote@worker.dk', 'approved', 26, 156, NOW() - INTERVAL '23 days'),

('Karriereskift som familiefar', 'Guide til at skifte job når du har ansvar for familien', 'https://www.jobindex.dk/career-change', 'link', (SELECT id FROM categories WHERE slug = 'karriere'), 'career@change.dk', 'approved', 17, 89, NOW() - INTERVAL '24 days'),

-- Fritid & Hobbyer
('Brygning af øl - begynderkursus', 'Start din øl-hobby med simpel hjemmebrygning', 'https://www.hjemmebryggerforeningen.dk/beginners', 'link', (SELECT id FROM categories WHERE slug = 'fritid'), 'brewer@hobby.dk', 'approved', 28, 167, NOW() - INTERVAL '25 days'),

('Fodboldtræner for børn', 'Bliv frivillig træner i dit barns fodboldklub', 'https://www.dbu.dk/volunteer-coach', 'article', (SELECT id FROM categories WHERE slug = 'fritid'), 'coach@football.dk', 'approved', 22, 134, NOW() - INTERVAL '26 days'),

('Cykelreparation basics', 'Lær dit barn at vedligeholde sin cykel', NULL, 'tip', (SELECT id FROM categories WHERE slug = 'fritid'), 'mechanic@bicycle.dk', 'approved', 15, 98, NOW() - INTERVAL '27 days'),

('Model-tog med dit barn', 'Sådan kommer I i gang med modeltog som hobby', 'https://www.modeljernbane.dk/family-guide', 'link', (SELECT id FROM categories WHERE slug = 'fritid'), 'train@model.dk', 'approved', 13, 76, NOW() - INTERVAL '28 days'),

-- Entertainment
('Bedste familiefilm 2024', 'Anmeldelser af årets bedste film for hele familien', 'https://www.filmmagasinet.dk/family-movies', 'article', (SELECT id FROM categories WHERE slug = 'fritid'), 'critic@movies.dk', 'approved', 34, 198, NOW() - INTERVAL '29 days'),

('Drengen der ikke ville vokse op', 'Dansk børnebog perfekt til fars læsning med børnene', 'https://www.saxo.com/dk/danish-childrens-book', 'book', (SELECT id FROM categories WHERE slug = 'fritid'), 'reader@books.dk', 'approved', 20, 123, NOW() - INTERVAL '30 days');

-- Add some tags to resources (assuming some common tags exist)
INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id 
FROM resources r, tags t 
WHERE r.title LIKE '%teenagere%' AND t.name = 'teenagere'
UNION ALL
SELECT r.id, t.id 
FROM resources r, tags t 
WHERE r.title LIKE '%baby%' OR r.description LIKE '%baby%' AND t.name = 'baby'
UNION ALL
SELECT r.id, t.id 
FROM resources r, tags t 
WHERE r.title LIKE '%træning%' OR r.description LIKE '%træning%' AND t.name = 'motion'
UNION ALL
SELECT r.id, t.id 
FROM resources r, tags t 
WHERE r.title LIKE '%søvn%' OR r.description LIKE '%søvn%' AND t.name = 'søvn'
UNION ALL
SELECT r.id, t.id 
FROM resources r, tags t 
WHERE r.title LIKE '%madpakke%' OR r.description LIKE '%mad%' AND t.name = 'mad';