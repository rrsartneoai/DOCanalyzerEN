-- Add language column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'pl';

-- Add document_id column to analyses table for better relationship tracking
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS document_id UUID REFERENCES documents(id);

-- Add extracted_text column to documents table for storing processed text
ALTER TABLE documents ADD COLUMN IF NOT EXISTS extracted_text TEXT;

-- Update existing users to have default language
UPDATE users SET language = 'pl' WHERE language IS NULL;

-- Create index for better performance on language queries
CREATE INDEX IF NOT EXISTS idx_users_language ON users(language);
CREATE INDEX IF NOT EXISTS idx_analyses_document_id ON analyses(document_id);

-- Add processing_time column to analyses table
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS processing_time TIMESTAMP DEFAULT NOW();
