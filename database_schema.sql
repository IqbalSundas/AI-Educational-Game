-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Subjects Table
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT
);

-- 3. Scenarios Table
CREATE TABLE scenarios (
    id SERIAL PRIMARY KEY,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT
);

-- 4. Challenges Table
CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    scenario_id INT REFERENCES scenarios(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    correct_answer VARCHAR(255) NOT NULL
);

-- 5. Player Progress Table
CREATE TABLE player_progress (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    score INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE
);

-- 6. Player Answers Table
CREATE TABLE player_answers (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INT REFERENCES challenges(id) ON DELETE CASCADE,
    given_answer VARCHAR(255) NOT NULL,
    is_correct BOOLEAN NOT NULL
);
