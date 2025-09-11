-- ===========================================
-- FitTrack Database Initialization Script
-- PostgreSQL 17 Compatible
-- ===========================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Create indexes for users table
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Workouts Table
CREATE TABLE IF NOT EXISTS workouts (
    id SERIAL PRIMARY KEY,
    "userID" INTEGER NOT NULL,
    date DATE NOT NULL,
    exercise VARCHAR(255) NOT NULL,
    "exerciseType" VARCHAR(255) NOT NULL,
    sets INTEGER,
    reps INTEGER,
    "repsDetail" JSONB,
    distance REAL,
    duration INTEGER,
    intensity VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Foreign Key Constraint
    CONSTRAINT fk_workouts_user 
        FOREIGN KEY ("userID") 
        REFERENCES users(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE
);

-- Create indexes for workouts table
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts("userID");
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_workouts_exercise_type ON workouts("exerciseType");

-- Sample test data (optional - remove in production)
-- INSERT INTO users (username, email, password) VALUES 
-- ('testuser', 'test@example.com', '$2b$12$example_hashed_password');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'FitTrack database initialization completed successfully!';
END $$;