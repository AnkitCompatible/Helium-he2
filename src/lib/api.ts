import { getSupabaseClient } from './supabaseClient';

// Types for API requests and responses
export interface AgentStartRequest {
  model_name?: string;
  enable_thinking?: boolean;
  reasoning_effort?: string;
  stream?: boolean;
  agent_id?: string;
  enable_context_manager?: boolean;
}

export interface UnifiedMessage {
  message_id: string;
  thread_id: string;
  type: 'user' | 'assistant' | 'system';
  is_llm_message: boolean;
  content: string;
  metadata: string;
  created_at: string;
  updated_at: string;
}

export interface AgentRunResponse {
  agent_run_id: string;
  status: string;
}

// Error handling
export class NoAccessTokenAvailableError extends Error {
  constructor() {
    super('No access token available');
    this.name = 'NoAccessTokenAvailableError';
  }
}

export class ApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to handle API errors
const handleApiError = (error: any, context: { operation: string; resource: string }) => {
  console.error(`Error in ${context.operation}:`, error);
  if (error?.code === 'PGRST116') {
    throw new ApiError(`Unauthorized access to ${context.resource}`, 401);
  }
  if (error?.code === 'PGRST116') {
    throw new ApiError(`${context.resource} not found`, 404);
  }
  throw new ApiError(error?.message || `Failed to ${context.operation}`, error?.status || 500);
};

// API Functions

/**
 * Add a user message to the chat thread
 */
export const addUserMessage = async (
  threadId: string,
  content: string,
): Promise<void> => {
  const supabase = getSupabaseClient();

  // Format the message in the format the LLM expects
  const message = {
    role: 'user',
    content: content,
  };

  // Insert the message into the messages table
  const { error } = await supabase.from('messages').insert({
    thread_id: threadId,
    type: 'user',
    is_llm_message: true,
    content: JSON.stringify(message),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error adding user message:', error);
    handleApiError(error, { operation: 'add message', resource: 'message' });
    throw new Error(`Error adding message: ${error.message}`);
  }
};

/**
 * Start an agent (LLM) for processing
 */
export const startAgent = async (
  threadId: string,
  options?: {
    model_name?: string;
    enable_thinking?: boolean;
    reasoning_effort?: string;
    stream?: boolean;
    agent_id?: string;
    enable_context_manager?: boolean;
  },
): Promise<{ agent_run_id: string }> => {
  try {
    const supabase = getSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new NoAccessTokenAvailableError();
    }

    const defaultOptions = {
      model_name: 'claude-3-5-sonnet-20241022',
      enable_thinking: false,
      reasoning_effort: 'low',
      stream: true,
      enable_context_manager: false,
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Create agent run record in database
    const { data: agentRun, error: agentRunError } = await supabase
      .from('agent_runs')
      .insert({
        thread_id: threadId,
        model_name: finalOptions.model_name,
        enable_thinking: finalOptions.enable_thinking,
        reasoning_effort: finalOptions.reasoning_effort,
        stream: finalOptions.stream,
        agent_id: finalOptions.agent_id,
        enable_context_manager: finalOptions.enable_context_manager,
        status: 'running',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('agent_run_id')
      .single();

    if (agentRunError) {
      console.error('Error creating agent run:', agentRunError);
      handleApiError(agentRunError, { operation: 'start agent', resource: 'agent run' });
      throw new Error(`Error starting agent: ${agentRunError.message}`);
    }

    // Trigger background processing (this would be handled by your backend service)
    // For now, we'll simulate the agent starting
    console.log(`Agent started for thread ${threadId} with run ID: ${agentRun.agent_run_id}`);

    return { agent_run_id: agentRun.agent_run_id };
  } catch (error) {
    console.error('Error in startAgent:', error);
    throw error;
  }
};

/**
 * Stream agent responses using Supabase realtime
 */
export const streamAgent = (
  agentRunId: string,
  callbacks: {
    onMessage: (content: string) => void;
    onError: (error: Error | string) => void;
    onClose: () => void;
  },
): (() => void) => {
  const supabase = getSupabaseClient();
  
  // Subscribe to realtime changes in the agent_runs table
  const subscription = supabase
    .channel(`agent-run-${agentRunId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'agent_runs',
        filter: `agent_run_id=eq.${agentRunId}`,
      },
      (payload: any) => {
        const newData = payload.new as any;
        
        if (newData.status === 'completed') {
          // Agent run completed
          callbacks.onMessage('Agent run completed');
          callbacks.onClose();
        } else if (newData.status === 'error') {
          // Agent run failed
          callbacks.onError(new Error(newData.error_message || 'Agent run failed'));
          callbacks.onClose();
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_responses',
        filter: `agent_run_id=eq.${agentRunId}`,
      },
      (payload: any) => {
        const response = payload.new as any;
        if (response.content) {
          callbacks.onMessage(response.content);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

/**
 * Get agent run status
 */
export const getAgentRunStatus = async (agentRunId: string): Promise<any> => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('agent_runs')
    .select('*')
    .eq('agent_run_id', agentRunId)
    .single();

  if (error) {
    handleApiError(error, { operation: 'get agent run status', resource: 'agent run' });
    throw new Error(`Error getting agent run status: ${error.message}`);
  }

  return data;
};

/**
 * Cancel an agent run
 */
export const cancelAgentRun = async (agentRunId: string): Promise<void> => {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('agent_runs')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('agent_run_id', agentRunId);

  if (error) {
    handleApiError(error, { operation: 'cancel agent run', resource: 'agent run' });
    throw new Error(`Error cancelling agent run: ${error.message}`);
  }
};

/**
 * Upload file to sandbox
 */
export const uploadFileToSandbox = async (
  sandboxId: string,
  path: string,
  file: any, // Using any for React Native compatibility
): Promise<{ status: string; created: boolean; path: string }> => {
  const supabase = getSupabaseClient();
  
  try {
    // Read file content - handle both web File and React Native file objects
    let content: ArrayBuffer;
    if (file.arrayBuffer) {
      content = await file.arrayBuffer();
    } else if (file.uri) {
      // React Native file handling
      const response = await fetch(file.uri);
      content = await response.arrayBuffer();
    } else {
      throw new Error('Unsupported file type');
    }
    
    // Store file metadata in database
    const { error: metadataError } = await supabase
      .from('sandbox_files')
      .insert({
        sandbox_id: sandboxId,
        file_path: path,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (metadataError) {
      handleApiError(metadataError, { operation: 'upload file metadata', resource: 'sandbox file' });
      throw new Error(`Error uploading file metadata: ${metadataError.message}`);
    }

    // Store file content in storage (you might want to use Supabase Storage)
    const { error: storageError } = await supabase.storage
      .from('sandbox-files')
      .upload(`${sandboxId}/${path}`, content, {
        contentType: file.type,
        upsert: true,
      });

    if (storageError) {
      handleApiError(storageError, { operation: 'upload file content', resource: 'file storage' });
      throw new Error(`Error uploading file content: ${storageError.message}`);
    }

    return { status: 'success', created: true, path };
  } catch (error) {
    console.error('Error uploading file to sandbox:', error);
    throw error;
  }
};

/**
 * Get sandbox files
 */
export const getSandboxFiles = async (sandboxId: string): Promise<any[]> => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('sandbox_files')
    .select('*')
    .eq('sandbox_id', sandboxId)
    .order('created_at', { ascending: false });

  if (error) {
    handleApiError(error, { operation: 'get sandbox files', resource: 'sandbox files' });
    throw new Error(`Error getting sandbox files: ${error.message}`);
  }

  return data || [];
};

/**
 * Delete file from sandbox
 */
export const deleteSandboxFile = async (sandboxId: string, path: string): Promise<void> => {
  const supabase = getSupabaseClient();
  
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('sandbox-files')
    .remove([`${sandboxId}/${path}`]);

  if (storageError) {
    console.error('Error deleting file from storage:', storageError);
  }

  // Delete metadata from database
  const { error: dbError } = await supabase
    .from('sandbox_files')
    .delete()
    .eq('sandbox_id', sandboxId)
    .eq('file_path', path);

  if (dbError) {
    handleApiError(dbError, { operation: 'delete file metadata', resource: 'sandbox file' });
    throw new Error(`Error deleting file: ${dbError.message}`);
  }
};

/**
 * Get thread messages
 */
export const getThreadMessages = async (threadId: string): Promise<UnifiedMessage[]> => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error) {
    handleApiError(error, { operation: 'get thread messages', resource: 'messages' });
    throw new Error(`Error getting messages: ${error.message}`);
  }

  return data || [];
};

/**
 * Create a new thread
 */
export const createThread = async (title?: string): Promise<{ thread_id: string }> => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('threads')
    .insert({
      title: title || 'New Chat',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('thread_id')
    .single();

  if (error) {
    handleApiError(error, { operation: 'create thread', resource: 'thread' });
    throw new Error(`Error creating thread: ${error.message}`);
  }

  return { thread_id: data.thread_id };
};

/**
 * Get user threads
 */
export const getUserThreads = async (): Promise<any[]> => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('threads')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    handleApiError(error, { operation: 'get user threads', resource: 'threads' });
    throw new Error(`Error getting threads: ${error.message}`);
  }

  return data || [];
};

/**
 * Delete thread
 */
export const deleteThread = async (threadId: string): Promise<void> => {
  const supabase = getSupabaseClient();
  
  // Delete messages first
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .eq('thread_id', threadId);

  if (messagesError) {
    console.error('Error deleting messages:', messagesError);
  }

  // Delete agent runs
  const { error: runsError } = await supabase
    .from('agent_runs')
    .delete()
    .eq('thread_id', threadId);

  if (runsError) {
    console.error('Error deleting agent runs:', runsError);
  }

  // Delete thread
  const { error: threadError } = await supabase
    .from('threads')
    .delete()
    .eq('thread_id', threadId);

  if (threadError) {
    handleApiError(threadError, { operation: 'delete thread', resource: 'thread' });
    throw new Error(`Error deleting thread: ${threadError.message}`);
  }
};


