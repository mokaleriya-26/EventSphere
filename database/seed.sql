-- ========================================================
-- EventSpear Seed Data
-- File: database/seed.sql
-- Description: Standard development seed dataset containing:
--   - 8 Categories
--   - 11 Users (5 Attendees, 5 Organizers, 1 Administrator)
--   - 25 Events (5 past, 3 today, 17 future; 5 owned by each organizer)
--   - 10 Sample Registrations
--   - 3 Initial Notifications
-- Default Password for all seed accounts: EventSpearLocal!2026
-- Bcrypt Hash: $2b$10$VISRglqPU8qMOGKnbK0lxe90li59FYnT.vtnIgM0Sgh/RJtfBDaY6
-- ========================================================

USE `eventspear_local`;

-- --------------------------------------------------------
-- 1. Categories
-- --------------------------------------------------------
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon_name`, `color`, `badge_text`, `cover_image_url`, `is_active`) VALUES
('cat-tech', 'Technology', 'tech', 'Developer conferences, AI hackathons, and cloud engineering summits.', 'Cpu', '#7541C8', 'Technology', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', 1),
('cat-cultural', 'Cultural & Art', 'cultural', 'Art exhibitions, heritage walks, folk festivals, and gallery openings.', 'Palette', '#EC4899', 'Cultural', 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80', 1),
('cat-concerts', 'Music & Concerts', 'concerts', 'Live acoustics, indie gigs, jazz nights, and music festivals.', 'Music', '#3B82F6', 'Music & Concerts', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', 1),
('cat-business', 'Business & Startups', 'business', 'Angel syndication summits, venture pitch days, and executive networking.', 'Briefcase', '#10B981', 'Business', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80', 1),
('cat-workshops', 'Workshops & Learning', 'workshops', 'Hands-on masterclasses, UI/UX bootcamps, and coding workshops.', 'GraduationCap', '#F59E0B', 'Education', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80', 1),
('cat-sports', 'Sports & Fitness', 'sports', 'Marathons, morning yoga sessions, cycling trails, and fitness bootcamps.', 'Trophy', '#06B6D4', 'Fitness', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80', 1),
('cat-food', 'Food & Culinary', 'food', 'Artisan food festivals, culinary masterclasses, and street eat crawls.', 'Utensils', '#EF4444', 'Culinary', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', 1),
('cat-comedy', 'Comedy & Drama', 'comedy', 'Stand-up comedy, open mic comedy tours, theatre, and improv nights.', 'Sparkles', '#8B5CF6', 'Entertainment', 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80', 1)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `icon_name` = VALUES(`icon_name`),
  `color` = VALUES(`color`),
  `badge_text` = VALUES(`badge_text`),
  `cover_image_url` = VALUES(`cover_image_url`),
  `is_active` = VALUES(`is_active`);

-- --------------------------------------------------------
-- 2. Users (5 Attendees, 5 Organizers, 1 Administrator)
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `organization`, `avatar`, `city`, `bio`, `account_status`) VALUES
-- 1 Administrator
('usr-admin-1', 'EventSpear Platform Admin', 'admin@eventspear.local', '$2b$10$VISRglqPU8qMOGKnbK0lxe90li59FYnT.vtnIgM0Sgh/RJtfBDaY6', 'admin', 'EventSpear Operations', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', 'Mumbai, MH', 'Master operations, platform security compliance, and event ecosystem moderation.', 'active'),

-- 5 Attendees
('usr-att-1', 'Aarav Sharma', 'attendee1@eventspear.local', '$2b$10$VISRglqPU8qMOGKnbK0lxe90li59FYnT.vtnIgM0Sgh/RJtfBDaY6', 'attendee', NULL, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', 'Mumbai, MH', 'Software engineer keen on tech conferences, AI summits, and indie live music.', 'active'),
('usr-att-2', 'Diya Patel', 'attendee2@eventspear.local', '$2b$10$VISRglqPU8qMOGKnbK0lxe90li59FYnT.vtnIgM0Sgh/RJtfBDaY6', 'attendee', NULL, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', 'Bengaluru, KA', 'UX designer passionate about typography workshops and cultural exhibitions.', 'active'),
('usr-att-3', 'Rohan Mehta', 'attendee3@eventspear.local', '$2b$10$VISRglqPU8qMOGKnbK0lxe90li59FYnT.vtnIgM0Sgh/RJtfBDaY6', 'attendee', NULL, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 'Pune, MH', 'Marathon runner, outdoor enthusiast, and startup networking follower.', 'active'),
('usr-att-4', 'Ananya Iyer', 'attendee4@eventspear.local', '$2b$10$VISRglqPU8qMOGKnbK0lxe90li59FYnT.vtnIgM0Sgh/RJtfBDaY6', 'attendee', NULL, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', 'Chennai, TN', 'Full stack learner, classical concert attendee, and book reading club organizer.', 'active'),
('usr-att-5', 'Kabir Verma', 'attendee5@eventspear.local', '$2b$10$VISRglqPU8qMOGKnbK0lxe90li59FYnT.vtnIgM0Sgh/RJtfBDaY6', 'attendee', NULL, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', 'New Delhi, DL', 'Entrepreneur, venture enthusiast, and community tech meetup participant.', 'active'),

-- 5 Organizers
('usr-org-1', 'TechNova Productions', 'organizer1@eventspear.local', '$2b$10$VISRglqPU8qMOGKnbK0lxe90li59FYnT.vtnIgM0Sgh/RJtfBDaY6', 'organizer', 'TechNova Global Pvt Ltd', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80', 'Bengaluru, KA', 'Pioneer of high-impact developer summits, cloud hackathons, and AI bootcamps.', 'active'),
('usr-org-2', 'CulturePulse Collective', 'organizer2@eventspear.local', '$2b$10$VISRglqPU8qMOGKnbK0lxe90li59FYnT.vtnIgM0Sgh/RJtfBDaY6', 'organizer', 'CulturePulse Arts Foundation', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', 'Mumbai, MH', 'Curating modern contemporary art festivals, design galas, and heritage walks.', 'active'),
('usr-org-3', 'SoundWave Live Media', 'organizer3@eventspear.local', '$2b$10$VISRglqPU8qMOGKnbK0lxe90li59FYnT.vtnIgM0Sgh/RJtfBDaY6', 'organizer', 'SoundWave Live Entertainment', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80', 'Pune, MH', 'Organizing acoustic gigs, indie festivals, jazz evenings, and stadium concert tours.', 'active'),
('usr-org-4', 'Apex Sports & Fitness', 'organizer4@eventspear.local', '$2b$10$VISRglqPU8qMOGKnbK0lxe90li59FYnT.vtnIgM0Sgh/RJtfBDaY6', 'organizer', 'Apex Sports Arena & Ventures', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=150&q=80', 'Hyderabad, TS', 'Promoting competitive endurance marathons, corporate leagues, and fitness rallies.', 'active'),
('usr-org-5', 'Inspire Workshops Hub', 'organizer5@eventspear.local', '$2b$10$VISRglqPU8qMOGKnbK0lxe90li59FYnT.vtnIgM0Sgh/RJtfBDaY6', 'organizer', 'Inspire Learning Foundation', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80', 'New Delhi, DL', 'Empowering future leaders through design masterclasses, executive speaking, and skills workshops.', 'active')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `password_hash` = VALUES(`password_hash`),
  `role` = VALUES(`role`),
  `organization` = VALUES(`organization`),
  `avatar` = VALUES(`avatar`),
  `city` = VALUES(`city`),
  `bio` = VALUES(`bio`),
  `account_status` = VALUES(`account_status`);

-- --------------------------------------------------------
-- 3. Events (25 Events: 5 past, 3 today, 17 future; 5 per organizer)
-- --------------------------------------------------------
INSERT INTO `events` (`id`, `organizer_id`, `category_id`, `title`, `slug`, `summary`, `description`, `cover_image_url`, `start_datetime`, `end_datetime`, `venue_name`, `address`, `city`, `event_type`, `capacity`, `price`, `currency`, `status`, `featured`) VALUES
-- Organizer 1 (TechNova Productions): 1 past, 4 future
('evt-org1-1', 'usr-org-1', 'cat-tech', 'Cloud Infrastructure & Kubernetes Summit 2026', 'cloud-infrastructure-kubernetes-summit-2026', 'A retrospective architecture summit on resilient cloud-native patterns.', 'Comprehensive review of multi-cloud architectures, Kubernetes operators, and zero-trust mesh networking.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', '2026-10-03 09:00:00', '2026-10-03 16:30:00', 'ITC Gardenia Convention Hall', 'Residency Road', 'Bengaluru', 'in-person', 300, 0.00, 'INR', 'past', 0),
('evt-org1-2', 'usr-org-1', 'cat-tech', 'NextGen AI & LLM Systems Summit', 'nextgen-ai-llm-systems-summit', 'Hands-on architectural conference uncovering transformer inference, RAG pipelines, and edge AI.', 'Convenes AI researchers, ML engineers, and infrastructure architects. Explores low-latency model serving, parameter-efficient fine tuning, and multimodal agentic workflows.', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', '2026-10-20 10:00:00', '2026-10-20 17:30:00', 'Bangalore International Exhibition Centre', '10th Mile, Tumkur Road', 'Bengaluru', 'in-person', 500, 0.00, 'INR', 'published', 1),
('evt-org1-3', 'usr-org-1', 'cat-tech', 'Bengaluru DevCon 2026: Modern Web & Distributed Systems', 'bengaluru-devcon-2026-modern-web-distributed-systems', 'Deep dive into event-driven streaming, micro-frontends, and distributed systems resilience.', 'Over 40 tech sessions with real production war-stories from industry leads across high-throughput distributed architectures.', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80', '2026-10-24 09:30:00', '2026-10-24 18:00:00', 'Nimhans Convention Center', 'Hosur Road', 'Bengaluru', 'in-person', 450, 0.00, 'INR', 'published', 1),
('evt-org1-4', 'usr-org-1', 'cat-tech', 'CyberSecurity Shield Forum: Zero Trust & Cloud Defense', 'cybersecurity-shield-forum-zero-trust-cloud-defense', 'Live attack simulation labs, posture hardening, and automated vulnerability management.', 'Essential summit for security engineers, CISOs, and devsecops specialists detailing automated red-teaming and defense.', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80', '2026-11-01 10:00:00', '2026-11-01 16:00:00', 'Online Interactive Virtual Stage', 'Global Stream', 'Bengaluru', 'virtual', 600, 0.00, 'INR', 'published', 0),
('evt-org1-5', 'usr-org-1', 'cat-tech', 'Global FinTech Engineering & Payments Conclave', 'global-fintech-engineering-payments-conclave', 'Modern payment rails, UPI integrations, ledger reconciliation, and fraud prevention algorithms.', 'Engineering leaders discuss sub-second payment settlement pipelines, core banking modernization, and cryptographic signature validation.', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80', '2026-11-11 09:00:00', '2026-11-11 17:00:00', 'The Lalit Ashok Conclave Hall', 'Kumarakrupa High Grounds', 'Bengaluru', 'in-person', 350, 0.00, 'INR', 'published', 0),

-- Organizer 2 (CulturePulse Collective): 1 past, 4 future
('evt-org2-1', 'usr-org-2', 'cat-cultural', 'Contemporary Ceramic Sculpture Exhibition Archive', 'contemporary-ceramic-sculpture-exhibition-archive', 'Archived documentation and gallery display of modern terracotta and stoneware.', 'Exquisite showcase of studio potters, sustainable clay formations, and interactive glazing showcases.', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80', '2026-10-07 18:00:00', '2026-10-07 21:30:00', 'Jehangir Art Gallery Hall 2', 'Kala Ghoda, Fort', 'Mumbai', 'in-person', 150, 0.00, 'INR', 'past', 0),
('evt-org2-2', 'usr-org-2', 'cat-cultural', 'Kala Ghoda Heritage Art & Urban Murals Promenade', 'kala-ghoda-heritage-art-urban-murals-promenade', 'Curated architectural and street-mural exploration through the historic southern district.', 'Guided 3-km walk led by senior muralists and architectural preservationists. Discover hidden street frescoes, Victorian neo-gothic landmarks, and conclude with artisanal tea.', 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80', '2026-10-19 11:00:00', '2026-10-19 14:00:00', 'Kala Ghoda Arts Precinct', 'V.B. Gandhi Marg, Fort', 'Mumbai', 'in-person', 40, 0.00, 'INR', 'published', 1),
('evt-org2-3', 'usr-org-2', 'cat-cultural', 'Modern Abstract Canvas Workshop & Wine Tasting', 'modern-abstract-canvas-workshop-wine-tasting', 'Paint on premium linen canvasses guided by contemporary visual artists with curated beverages.', 'All easel materials, acrylic paints, palette knives, and sommelier tastings included for an unforgettable artistic afternoon.', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80', '2026-10-25 07:00:00', '2026-10-25 10:30:00', 'The Atelier Art Studio', 'Bandra West', 'Mumbai', 'in-person', 30, 0.00, 'INR', 'published', 0),
('evt-org2-4', 'usr-org-2', 'cat-cultural', 'Illuminated Night Photography Walk: South Bombay', 'illuminated-night-photography-walk-south-bombay', 'Capture nocturnal streetscapes, colonial façades, and coastal marine silhouettes with master mentors.', 'Tripods and wide-angle lenses recommended. Walk covers Asiatic Library steps, Horniman Circle, and Marine Drive seaside promenades.', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80', '2026-11-02 19:00:00', '2026-11-02 22:30:00', 'Asiatic Society Steps', 'Town Hall, Fort', 'Mumbai', 'in-person', 25, 0.00, 'INR', 'published', 0),
('evt-org2-5', 'usr-org-2', 'cat-cultural', 'Folk Echoes: Regional Dance & Indigenous Music Gala', 'folk-echoes-regional-dance-indigenous-music-gala', 'Celebration of tribal rhythms, traditional attire, and folk storytelling traditions.', 'An immersive cultural showcase presenting Lavani, Garba, and Chhau performances by master troupes with ethnic regional delicacies.', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80', '2026-11-14 10:00:00', '2026-11-14 14:00:00', 'NCPA Experimental Theatre', 'Nariman Point', 'Mumbai', 'in-person', 200, 0.00, 'INR', 'published', 1),

-- Organizer 3 (SoundWave Live Media): 1 past, 1 today, 3 future
('evt-org3-1', 'usr-org-3', 'cat-concerts', 'Monsoon Sitar & Classical Strings Session', 'monsoon-sitar-classical-strings-session', 'Archived classical Indian musical performance dedicated to evening ragas.', 'Celebrated master maestros performed classic ragas on traditional sitars and tablas in an intimate acoustic auditorium.', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', '2026-10-10 19:00:00', '2026-10-10 22:00:00', 'Bal Gandharva Ranga Mandir', 'JM Road, Shivajinagar', 'Pune', 'in-person', 400, 0.00, 'INR', 'past', 0),
('evt-org3-2', 'usr-org-3', 'cat-concerts', 'Moonlight Jazz & Acoustic Saxophone Night', 'moonlight-jazz-acoustic-saxophone-night', 'Open-air acoustic performance featuring celebrated quintets, vintage swing melodies, and craft mocktails today.', 'Escape the city rush under the open stars with our curated Moonlight Jazz session. Featuring celebrated saxophonists, upright bass solos, and an intimate acoustic atmosphere.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', '2026-10-17 10:30:00', '2026-10-17 14:30:00', 'Rooftop Amphitheatre, Koregaon Park', 'Lane 7, Koregaon Park', 'Pune', 'in-person', 180, 0.00, 'INR', 'published', 1),
('evt-org3-3', 'usr-org-3', 'cat-concerts', 'Indie Waves Music Festival 2026', 'indie-waves-music-festival-2026', 'Two stages of breakthrough indie bands, folk-rock ensembles, and singer-songwriters.', 'Featuring 12 independent bands, open food lawns, eco-friendly craft stalls, and warm community vibes under the autumn Pune sky.', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80', '2026-10-22 17:30:00', '2026-10-22 23:00:00', 'The Westin Lawns', 'Mundhwa Road, Koregaon Park Annexe', 'Pune', 'in-person', 750, 0.00, 'INR', 'published', 1),
('evt-org3-4', 'usr-org-3', 'cat-concerts', 'Electric Pulse EDM Rooftop Experience', 'electric-pulse-edm-rooftop-experience', 'Deep house, progressive trance, and laser-mapped visuals across panoramic skyline views.', 'Top resident DJs spin melodic techno and high-energy progressive anthems with state-of-the-art Martin Audio sound systems.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80', '2026-10-29 20:00:00', '2026-10-30 01:00:00', 'High Street Sky Deck', 'Baner Road', 'Pune', 'in-person', 350, 0.00, 'INR', 'published', 0),
('evt-org3-5', 'usr-org-3', 'cat-concerts', 'Candlelight Symphony: Romantic Movie Soundtracks', 'candlelight-symphony-romantic-movie-soundtracks', 'A string quartet playing Hans Zimmer, Morricone, and cinematic classics surrounded by 2,000 candles.', 'A magical acoustic experience enveloped in ambient candle illumination in a breathtaking heritage ballroom.', 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80', '2026-11-08 18:00:00', '2026-11-08 20:30:00', 'Royal Connaught Ball Room', 'Camp Area', 'Pune', 'in-person', 220, 0.00, 'INR', 'published', 1),

-- Organizer 4 (Apex Sports & Fitness): 1 past, 1 today, 3 future
('evt-org4-1', 'usr-org-4', 'cat-sports', 'Monsoon Trail Running Challenge Archive', 'monsoon-trail-running-challenge-archive', 'Archived 15K trail run through hillocks, muddy passes, and natural forests.', 'Official race record documentation with chip timing and scenic off-road challenges.', 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80', '2026-10-13 06:30:00', '2026-10-13 10:30:00', 'Ananthagiri Hills Trailhead', 'Vikarabad', 'Hyderabad', 'in-person', 200, 0.00, 'INR', 'past', 0),
('evt-org4-2', 'usr-org-4', 'cat-sports', 'Sunrise Lake Yoga & Breathwork Masterclass', 'sunrise-lake-yoga-breathwork-masterclass', 'Recharge mind and body at the tranquil lakeside park with guided pranayama and vinyasa flow today.', 'Bring your mat for a grounding morning session led by certified master yogis. Includes calming crystal sound bath meditation and organic cold-pressed juices.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', '2026-10-17 15:00:00', '2026-10-17 17:30:00', 'Sanjeevaiah Children & Lake Park', 'Necklace Road', 'Hyderabad', 'in-person', 60, 0.00, 'INR', 'published', 1),
('evt-org4-3', 'usr-org-4', 'cat-sports', 'City Night Cyclothon 30K Challenge', 'city-night-cyclothon-30k-challenge', 'A night-time illuminated cycling rally promoting clean urban air.', 'Helmets, safety marshals, and hydration points provided across a smooth scenic course spanning Cyber Towers to Gachibowli.', 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=800&q=80', '2026-10-23 21:00:00', '2026-10-24 00:30:00', 'Durgam Cheruvu Cable Bridge Hub', 'Hitec City', 'Hyderabad', 'in-person', 350, 0.00, 'INR', 'published', 0),
('evt-org4-4', 'usr-org-4', 'cat-sports', 'Corporate Badminton Championship 2026', 'corporate-badminton-championship-2026', 'Doubles and singles knockout tournament for tech and corporate teams.', 'Professional BWF standard courts, certified referees, trophies, and corporate networking breaks.', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', '2026-10-31 09:00:00', '2026-10-31 18:00:00', 'Gachibowli Indoor Stadium', 'Old Mumbai Highway', 'Hyderabad', 'in-person', 80, 0.00, 'INR', 'published', 0),
('evt-org4-5', 'usr-org-4', 'cat-sports', 'Charity Half-Marathon for Green Forests', 'charity-half-marathon-green-forests', 'Official 21K and 5K fun runs with proceeds dedicated to afforestation.', 'Timed chip bibs, finisher medals, pre-race warm-up music, and post-run nutritious banquet.', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80', '2026-11-10 05:30:00', '2026-11-10 11:00:00', 'NTR Gardens Boulevard', 'Necklace Road, Hussain Sagar', 'Hyderabad', 'in-person', 600, 0.00, 'INR', 'published', 1),

-- Organizer 5 (Inspire Workshops Hub): 1 past, 1 today, 3 future
('evt-org5-1', 'usr-org-5', 'cat-workshops', 'UI Design Systems Masterclass Archive', 'ui-design-systems-masterclass-archive', 'Deep-dive into component tokenization, Figma variables, and accessibility.', 'Archived workshop teaching enterprise design systems, color harmonies, and token workflows.', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80', '2026-10-15 14:00:00', '2026-10-15 18:00:00', 'India Habitat Centre', 'Lodhi Road', 'New Delhi', 'in-person', 80, 0.00, 'INR', 'past', 0),
('evt-org5-2', 'usr-org-5', 'cat-workshops', 'Evening Executive Leadership & Storytelling', 'evening-executive-leadership-storytelling', 'Master persuasive public speaking, board pitches, and vision communication today.', 'An interactive hands-on evening seminar dissecting body language, voice modulation, and memorable message frameworks.', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80', '2026-10-17 19:00:00', '2026-10-17 21:30:00', 'Civic Center Executive Suite', 'Connaught Place, Barakhamba Road', 'New Delhi', 'in-person', 50, 0.00, 'INR', 'published', 1),
('evt-org5-3', 'usr-org-5', 'cat-workshops', 'Startup Angel Pitching & Term Sheet Bootcamp', 'startup-angel-pitching-termsheet-bootcamp', 'Demystifying valuation caps, liquidation preferences, and founder cap tables.', 'Venture attorneys and angel investors review real-world founder pitch decks with live redline feedback.', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80', '2026-10-26 10:00:00', '2026-10-26 16:00:00', 'Aerocity Business Tower', 'IGI Airport Hospitality District', 'New Delhi', 'in-person', 70, 0.00, 'INR', 'published', 0),
('evt-org5-4', 'usr-org-5', 'cat-workshops', 'Hands-on Data Storytelling with Python & D3', 'hands-on-data-storytelling-python-d3', 'Transform raw datasets into compelling interactive web charts and infographics.', 'Build animated data charts, interactive maps, and narrative scrollytelling dashboards with clean modern visuals.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', '2026-11-04 14:00:00', '2026-11-04 18:00:00', 'The Learning Loft', 'Hauz Khas Village', 'New Delhi', 'hybrid', 90, 0.00, 'INR', 'published', 0),
('evt-org5-5', 'usr-org-5', 'cat-workshops', 'Future of Clean Mobility & EV Engineering', 'future-clean-mobility-ev-engineering', 'Symposium on solid-state batteries, fast charging protocols, and green urban transit.', 'Hear from EV architects, hardware engineers, and policymakers charting the future of carbon-neutral mobility.', 'https://images.unsplash.com/photo-1558441719-7d8cf713cf7a?auto=format&fit=crop&w=800&q=80', '2026-11-12 09:30:00', '2026-11-12 17:30:00', 'Pragati Maidan Convention Hall 5', 'Mathura Road', 'New Delhi', 'in-person', 250, 0.00, 'INR', 'published', 1)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `summary` = VALUES(`summary`),
  `description` = VALUES(`description`),
  `cover_image_url` = VALUES(`cover_image_url`),
  `start_datetime` = VALUES(`start_datetime`),
  `end_datetime` = VALUES(`end_datetime`),
  `venue_name` = VALUES(`venue_name`),
  `address` = VALUES(`address`),
  `city` = VALUES(`city`),
  `event_type` = VALUES(`event_type`),
  `capacity` = VALUES(`capacity`),
  `price` = VALUES(`price`),
  `currency` = VALUES(`currency`),
  `status` = VALUES(`status`),
  `featured` = VALUES(`featured`);

-- --------------------------------------------------------
-- 4. Registrations
-- --------------------------------------------------------
INSERT INTO `registrations` (`id`, `event_id`, `attendee_id`, `booking_reference`, `ticket_type`, `price`, `status`, `registered_at`) VALUES
('reg-001', 'evt-org1-2', 'usr-att-1', 'ES-2026-0001', 'General Admission', 0.00, 'confirmed', '2026-10-16 10:15:00'),
('reg-002', 'evt-org1-2', 'usr-att-2', 'ES-2026-0002', 'General Admission', 0.00, 'confirmed', '2026-10-16 11:20:00'),
('reg-003', 'evt-org2-2', 'usr-att-2', 'ES-2026-0003', 'VIP Pass', 0.00, 'confirmed', '2026-10-15 14:00:00'),
('reg-004', 'evt-org3-2', 'usr-att-3', 'ES-2026-0004', 'General Admission', 0.00, 'confirmed', '2026-10-17 09:30:00'),
('reg-005', 'evt-org4-2', 'usr-att-4', 'ES-2026-0005', 'Yoga Mat Reservation', 0.00, 'confirmed', '2026-10-17 10:15:00'),
('reg-006', 'evt-org5-2', 'usr-att-5', 'ES-2026-0006', 'Delegate Seat', 0.00, 'confirmed', '2026-10-17 11:45:00'),
('reg-007', 'evt-org3-3', 'usr-att-1', 'ES-2026-0007', 'General Admission', 0.00, 'confirmed', '2026-10-16 16:20:00'),
('reg-008', 'evt-org4-3', 'usr-att-3', 'ES-2026-0008', 'Cyclist Rider Bib', 0.00, 'confirmed', '2026-10-16 18:00:00'),
('reg-009', 'evt-org5-3', 'usr-att-5', 'ES-2026-0009', 'Founder Pass', 0.00, 'confirmed', '2026-10-14 15:10:00'),
('reg-010', 'evt-org1-1', 'usr-att-1', 'ES-2026-0010', 'Attendee', 0.00, 'past', '2026-10-01 12:00:00')
ON DUPLICATE KEY UPDATE
  `ticket_type` = VALUES(`ticket_type`),
  `status` = VALUES(`status`);

-- --------------------------------------------------------
-- 5. Notifications
-- --------------------------------------------------------
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `link`, `is_read`, `created_at`) VALUES
('notif-001', 'usr-att-1', 'Registration Confirmed', 'You are confirmed for NextGen AI & LLM Systems Summit (Ref: ES-2026-0001).', 'success', '/attendee/bookings', 0, '2026-10-17 10:55:40'),
('notif-002', 'usr-org-1', 'New Attendee Registered', 'Aarav Sharma has registered for your NextGen AI & LLM Systems Summit.', 'info', '/organizer/events/evt-org1-2/attendees', 0, '2026-10-17 10:55:40'),
('notif-003', 'usr-admin-1', 'System Initialized', 'EventSpear database initialized with 11 accounts and 25 events.', 'system', '/admin/dashboard', 0, '2026-10-17 10:55:40')
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `message` = VALUES(`message`),
  `is_read` = VALUES(`is_read`);
