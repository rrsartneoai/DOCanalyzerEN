CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'uploaded',
    analysis_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies for users table
DROP POLICY IF EXISTS "Public users are viewable by themselves." ON users;
CREATE POLICY "Public users are viewable by themselves." ON users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own data." ON users;
CREATE POLICY "Users can update their own data." ON users FOR UPDATE USING (auth.uid() = id);

-- Policies for documents table
DROP POLICY IF EXISTS "Users can view their own documents." ON documents;
CREATE POLICY "Users can view their own documents." ON documents FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own documents." ON documents;
CREATE POLICY "Users can insert their own documents." ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own documents." ON documents;
CREATE POLICY "Users can update their own documents." ON documents FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own documents." ON documents;
CREATE POLICY "Users can delete their own documents." ON documents FOR DELETE USING (auth.uid() = user_id);

-- Policies for orders table
DROP POLICY IF EXISTS "Users can view their own orders." ON orders;
CREATE POLICY "Users can view their own orders." ON orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own orders." ON orders;
CREATE POLICY "Users can insert their own orders." ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own orders." ON orders;
CREATE POLICY "Users can update their own orders." ON orders FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own orders." ON orders;
CREATE POLICY "Users can delete their own orders." ON orders FOR DELETE USING (auth.uid() = user_id);
