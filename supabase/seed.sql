-- seed.sql
-- Sample questions for local dev/testing. Verify facts (especially any
-- records, which change over time) before using in production -- this
-- is written from general knowledge, not a live lookup.

insert into questions (prompt, choices, correct_choice, category, difficulty) values
(
  'What material are UCS Spirit vaulting poles made from?',
  '["Carbon fiber blend", "Aerospace-grade fiberglass", "Aluminum alloy", "Bamboo"]',
  'Aerospace-grade fiberglass',
  'Equipment', 'easy'
),
(
  'Which of these athletes currently holds the men''s pole vault world record?',
  '["Sergei Bubka", "Renaud Lavillenie", "Armand Duplantis", "Sam Kendricks"]',
  'Armand Duplantis',
  'Records', 'medium'
),
(
  'What is the standard scoring event category pole vault belongs to?',
  '["Throws", "Jumps", "Combined events only", "Middle distance"]',
  'Jumps',
  'Rules', 'easy'
),
(
  'A vaulter''s pole weight rating is based primarily on what?',
  '["The vaulter''s body weight", "The pole''s color", "The height of the crossbar", "The length of the runway"]',
  'The vaulter''s body weight',
  'Technique', 'medium'
),
(
  'What is the padded landing area in pole vault called?',
  '["The box", "The pit", "The bar", "The standard"]',
  'The pit',
  'Equipment', 'easy'
),
(
  'What is the small metal-and-fiberglass trough at the end of the runway called, where the pole tip is planted?',
  '["The box", "The socket", "The plant", "The wedge"]',
  'The box',
  'Equipment', 'medium'
),
(
  'Who is a former Olympic and world record-holding women''s pole vaulter associated with UCS Spirit poles?',
  '["Allyson Felix", "Yelena Isinbayeva", "Jackie Joyner-Kersee", "Florence Griffith-Joyner"]',
  'Yelena Isinbayeva',
  'Athletes', 'medium'
),
(
  'In competition, how many attempts does a vaulter typically get at each height before elimination?',
  '["One", "Two", "Three", "Unlimited"]',
  'Three',
  'Rules', 'medium'
),
(
  'What technique element happens right after a vaulter plants the pole?',
  '["The takeoff", "The swing-up", "The bar clearance", "The runway sprint"]',
  'The takeoff',
  'Technique', 'hard'
),
(
  'UCS Spirit''s partner company, United Canvas and Sling, held exclusive equipment contracts at how many Olympic Games?',
  '["Two", "Three", "Four", "Six"]',
  'Four',
  'Company', 'hard'
);
