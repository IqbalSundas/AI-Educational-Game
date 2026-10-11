-- ========================================================
-- Mini-Game 1: Explore & Discover Schema & Sample Data
-- Project: Educational AI Game
-- ========================================================

-- 1. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Games Table (Mini-Game types)
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(20) DEFAULT 'Easy',
    points INT DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Player Progress Table
CREATE TABLE IF NOT EXISTS player_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    score INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Player Answers Table (for tracking individual question responses)
CREATE TABLE IF NOT EXISTS public.player_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points_earned INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_player_question UNIQUE (user_id, question_id)
);


-- ========================================================
-- Sample Data Insertion
-- ========================================================

-- Insert Subject
INSERT INTO subjects (name, description) 
VALUES ('Biology', 'Study of living organisms and plant life')
ON CONFLICT (name) DO NOTHING;

-- Insert Game
INSERT INTO games (title, game_type, description) 
VALUES ('Explore & Discover', 'explore_discover', 'Find objects in the environment, learn info, and answer questions.');

-- Insert Question for Photosynthesis
INSERT INTO questions (game_id, subject_id, question_text, options, correct_answer, explanation, difficulty, points)
VALUES (
    (SELECT id FROM games WHERE title = 'Explore & Discover' LIMIT 1),
    (SELECT id FROM subjects WHERE name = 'Biology' LIMIT 1),
    'What process do plants use to convert sunlight into food?',
    '["Respiration", "Photosynthesis", "Transpiration", "Fermentation"]'::jsonb,
    'Photosynthesis',
    'Photosynthesis is the process used by plants to convert light energy into chemical energy.',
    'Easy',
    10
);

-- Insert Test User
INSERT INTO users (username, email) 
VALUES ('test_player', 'player1@example.com')
ON CONFLICT (username) DO NOTHING;
