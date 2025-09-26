-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.sessions;

-- Create sessions table
CREATE TABLE public.sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_updated_at ON public.sessions(updated_at DESC);
CREATE INDEX idx_messages_session_id ON public.messages(session_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- For now, we'll handle user isolation in the application layer
-- instead of using RLS to avoid JWT verification issues
-- 
-- Note: In production, you should properly configure JWT verification
-- between Clerk and Supabase and re-enable RLS for security

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on sessions
CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON public.sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions to anon users (temporary for development)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.sessions_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.messages_id_seq TO anon;

-- Also grant to authenticated users for future use
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.sessions_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.messages_id_seq TO authenticated;