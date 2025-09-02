-- Database Schema for Mobile Chat Application
-- This file contains all the necessary tables for the chat system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth)
-- This is automatically created by Supabase

-- Threads table for chat conversations
CREATE TABLE IF NOT EXISTS threads (
    thread_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL DEFAULT 'New Chat',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Messages table for chat messages
CREATE TABLE IF NOT EXISTS messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES threads(thread_id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('user', 'assistant', 'system')),
    is_llm_message BOOLEAN DEFAULT false,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent runs table for tracking LLM processing
CREATE TABLE IF NOT EXISTS agent_runs (
    agent_run_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES threads(thread_id) ON DELETE CASCADE,
    model_name TEXT NOT NULL DEFAULT 'claude-3-5-sonnet-20241022',
    enable_thinking BOOLEAN DEFAULT false,
    reasoning_effort TEXT DEFAULT 'low' CHECK (reasoning_effort IN ('low', 'medium', 'high')),
    stream BOOLEAN DEFAULT true,
    agent_id UUID,
    enable_context_manager BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'error', 'cancelled')),
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent responses table for streaming responses
CREATE TABLE IF NOT EXISTS agent_responses (
    response_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_run_id UUID NOT NULL REFERENCES agent_runs(agent_run_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    response_type TEXT DEFAULT 'content' CHECK (response_type IN ('content', 'thinking', 'error')),
    sequence_number INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sandboxes table for file management
CREATE TABLE IF NOT EXISTS sandboxes (
    sandbox_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sandbox files table for file metadata
CREATE TABLE IF NOT EXISTS sandbox_files (
    file_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sandbox_id UUID NOT NULL REFERENCES sandboxes(sandbox_id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sandbox_id, file_path)
);

-- Agents table for different AI agents
CREATE TABLE IF NOT EXISTS agents (
    agent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    model_name TEXT NOT NULL DEFAULT 'claude-3-5-sonnet-20241022',
    system_prompt TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_runs_thread_id ON agent_runs(thread_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_responses_agent_run_id ON agent_responses(agent_run_id);
CREATE INDEX IF NOT EXISTS idx_sandbox_files_sandbox_id ON sandbox_files(sandbox_id);
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);

-- Create RLS (Row Level Security) policies
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandbox_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for threads
CREATE POLICY "Users can view their own threads" ON threads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own threads" ON threads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own threads" ON threads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own threads" ON threads
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their threads" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.thread_id = messages.thread_id 
            AND threads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their threads" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.thread_id = messages.thread_id 
            AND threads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages in their threads" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.thread_id = messages.thread_id 
            AND threads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages in their threads" ON messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.thread_id = messages.thread_id 
            AND threads.user_id = auth.uid()
        )
    );

-- RLS Policies for agent_runs
CREATE POLICY "Users can view agent runs in their threads" ON agent_runs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.thread_id = agent_runs.thread_id 
            AND threads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert agent runs in their threads" ON agent_runs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.thread_id = agent_runs.thread_id 
            AND threads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update agent runs in their threads" ON agent_runs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.thread_id = agent_runs.thread_id 
            AND threads.user_id = auth.uid()
        )
    );

-- RLS Policies for agent_responses
CREATE POLICY "Users can view agent responses in their runs" ON agent_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agent_runs 
            JOIN threads ON threads.thread_id = agent_runs.thread_id
            WHERE agent_runs.agent_run_id = agent_responses.agent_run_id 
            AND threads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert agent responses in their runs" ON agent_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM agent_runs 
            JOIN threads ON threads.thread_id = agent_runs.thread_id
            WHERE agent_runs.agent_run_id = agent_responses.agent_run_id 
            AND threads.user_id = auth.uid()
        )
    );

-- RLS Policies for sandboxes
CREATE POLICY "Users can view their own sandboxes" ON sandboxes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sandboxes" ON sandboxes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sandboxes" ON sandboxes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sandboxes" ON sandboxes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sandbox_files
CREATE POLICY "Users can view files in their sandboxes" ON sandbox_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sandboxes 
            WHERE sandboxes.sandbox_id = sandbox_files.sandbox_id 
            AND sandboxes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert files in their sandboxes" ON sandbox_files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM sandboxes 
            WHERE sandboxes.sandbox_id = sandbox_files.sandbox_id 
            AND sandboxes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update files in their sandboxes" ON sandbox_files
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM sandboxes 
            WHERE sandboxes.sandbox_id = sandbox_files.sandbox_id 
            AND sandboxes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete files in their sandboxes" ON sandbox_files
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM sandboxes 
            WHERE sandboxes.sandbox_id = sandbox_files.sandbox_id 
            AND sandboxes.user_id = auth.uid()
        )
    );

-- RLS Policies for agents
CREATE POLICY "Users can view their own agents" ON agents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agents" ON agents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" ON agents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" ON agents
    FOR DELETE USING (auth.uid() = user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_runs_updated_at BEFORE UPDATE ON agent_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sandbox_files_updated_at BEFORE UPDATE ON sandbox_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default agent for new users
INSERT INTO agents (agent_id, name, description, model_name, system_prompt, is_default, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Default Assistant',
    'Default AI assistant for general conversations',
    'claude-3-5-sonnet-20241022',
    'You are a helpful AI assistant. Be concise, accurate, and helpful in your responses.',
    true,
    true
) ON CONFLICT (agent_id) DO NOTHING;

-- Create a function to get user's default agent
CREATE OR REPLACE FUNCTION get_user_default_agent(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    default_agent_id UUID;
BEGIN
    -- First try to get user's own default agent
    SELECT agent_id INTO default_agent_id
    FROM agents
    WHERE user_id = user_uuid AND is_default = true AND is_active = true
    LIMIT 1;
    
    -- If no user-specific default, get the global default
    IF default_agent_id IS NULL THEN
        SELECT agent_id INTO default_agent_id
        FROM agents
        WHERE agent_id = '00000000-0000-0000-0000-000000000001' AND is_active = true;
    END IF;
    
    RETURN default_agent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
