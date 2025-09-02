import { useState, useCallback, useEffect, useRef } from 'react';
import {
  addUserMessage,
  startAgent,
  streamAgent,
  getAgentRunStatus,
  cancelAgentRun,
  uploadFileToSandbox,
  getSandboxFiles,
  deleteSandboxFile,
  getThreadMessages,
  createThread,
  getUserThreads,
  deleteThread,
  UnifiedMessage,
  AgentStartRequest,
} from '../lib/api';

export interface UseChatAPIReturn {
  // State
  messages: UnifiedMessage[];
  threads: any[];
  isSending: boolean;
  currentAgentRunId: string | null;
  sandboxFiles: any[];
  
  // Message functions
  sendMessage: (content: string, options?: Partial<AgentStartRequest>) => Promise<void>;
  addMessage: (content: string) => Promise<void>;
  
  // Thread functions
  createNewThread: (title?: string) => Promise<string>;
  loadThreads: () => Promise<void>;
  deleteThreadById: (threadId: string) => Promise<void>;
  loadThreadMessages: (threadId: string) => Promise<void>;
  
  // Agent functions
  startAgentRun: (threadId: string, options?: Partial<AgentStartRequest>) => Promise<string>;
  cancelCurrentAgent: () => Promise<void>;
  getAgentStatus: (agentRunId: string) => Promise<any>;
  
  // File functions
  uploadFile: (sandboxId: string, path: string, file: any) => Promise<void>;
  loadSandboxFiles: (sandboxId: string) => Promise<void>;
  removeFile: (sandboxId: string, path: string) => Promise<void>;
  
  // Utility functions
  clearMessages: () => void;
  setCurrentThread: (threadId: string) => void;
}

export const useChatAPI = (initialThreadId?: string): UseChatAPIReturn => {
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [currentAgentRunId, setCurrentAgentRunId] = useState<string | null>(null);
  const [sandboxFiles, setSandboxFiles] = useState<any[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(initialThreadId || null);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Set current thread
  const setCurrentThread = useCallback((threadId: string) => {
    setCurrentThreadId(threadId);
    clearMessages();
  }, [clearMessages]);

  // Add a single message
  const addMessage = useCallback(async (content: string) => {
    if (!currentThreadId) {
      throw new Error('No thread selected');
    }

    const optimisticMessage: UnifiedMessage = {
      message_id: `temp-${Date.now()}`,
      thread_id: currentThreadId,
      type: 'user',
      is_llm_message: false,
      content,
      metadata: '{}',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      await addUserMessage(currentThreadId, content);
      
      // Update the message to remove temp ID
      setMessages(prev => 
        prev.map(msg => 
          msg.message_id === optimisticMessage.message_id 
            ? { ...msg, message_id: `msg-${Date.now()}` }
            : msg
        )
      );
    } catch (error) {
      console.error('Error adding message:', error);
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg.message_id !== optimisticMessage.message_id));
      throw error;
    }
  }, [currentThreadId]);

  // Send message and start agent
  const sendMessage = useCallback(async (
    content: string, 
    options?: Partial<AgentStartRequest>
  ) => {
    if (!currentThreadId) {
      throw new Error('No thread selected');
    }

    setIsSending(true);
    
    try {
      // Add user message
      await addMessage(content);

      // Start agent
      const agent_run_id = await startAgentRun(currentThreadId, options);
      
      // Set up streaming
      if (agent_run_id) {
        setCurrentAgentRunId(agent_run_id);
        
        // Subscribe to agent responses
        const unsubscribe = streamAgent(agent_run_id, {
          onMessage: (content: string) => {
            // Add assistant message
            const assistantMessage: UnifiedMessage = {
              message_id: `assistant-${Date.now()}`,
              thread_id: currentThreadId!,
              type: 'assistant',
              is_llm_message: true,
              content,
              metadata: '{}',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            setMessages(prev => [...prev, assistantMessage]);
          },
          onError: (error: Error | string) => {
            console.error('Agent error:', error);
            // Add error message
            const errorMessage: UnifiedMessage = {
              message_id: `error-${Date.now()}`,
              thread_id: currentThreadId!,
              type: 'assistant',
              is_llm_message: true,
              content: `Error: ${typeof error === 'string' ? error : error.message}`,
              metadata: '{}',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            setMessages(prev => [...prev, errorMessage]);
          },
          onClose: () => {
            setCurrentAgentRunId(null);
            unsubscribeRef.current = null;
          },
        });
        
        unsubscribeRef.current = unsubscribe;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [currentThreadId, addMessage]);

  // Start agent run
  const startAgentRun = useCallback(async (
    threadId: string, 
    options?: Partial<AgentStartRequest>
  ): Promise<string> => {
    const result = await startAgent(threadId, options);
    return result.agent_run_id;
  }, []);

  // Cancel current agent
  const cancelCurrentAgent = useCallback(async () => {
    if (currentAgentRunId) {
      try {
        await cancelAgentRun(currentAgentRunId);
        setCurrentAgentRunId(null);
        
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      } catch (error) {
        console.error('Error cancelling agent:', error);
      }
    }
  }, [currentAgentRunId]);

  // Get agent status
  const getAgentStatus = useCallback(async (agentRunId: string) => {
    return await getAgentRunStatus(agentRunId);
  }, []);

  // Create new thread
  const createNewThread = useCallback(async (title?: string): Promise<string> => {
    const { thread_id } = await createThread(title);
    setCurrentThreadId(thread_id);
    clearMessages();
    await loadThreads(); // Refresh threads list
    return thread_id;
  }, [clearMessages]);

  // Load user threads
  const loadThreads = useCallback(async () => {
    try {
      const userThreads = await getUserThreads();
      setThreads(userThreads);
    } catch (error) {
      console.error('Error loading threads:', error);
    }
  }, []);

  // Delete thread
  const deleteThreadById = useCallback(async (threadId: string) => {
    try {
      await deleteThread(threadId);
      await loadThreads(); // Refresh threads list
      
      // If deleted thread was current, clear current thread
      if (currentThreadId === threadId) {
        setCurrentThreadId(null);
        clearMessages();
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
      throw error;
    }
  }, [currentThreadId, clearMessages, loadThreads]);

  // Load thread messages
  const loadThreadMessages = useCallback(async (threadId: string) => {
    try {
      const threadMessages = await getThreadMessages(threadId);
      setMessages(threadMessages);
      setCurrentThreadId(threadId);
    } catch (error) {
      console.error('Error loading thread messages:', error);
    }
  }, []);

  // Upload file to sandbox
  const uploadFile = useCallback(async (sandboxId: string, path: string, file: any) => {
    try {
      await uploadFileToSandbox(sandboxId, path, file);
      await loadSandboxFiles(sandboxId); // Refresh files list
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }, []);

  // Load sandbox files
  const loadSandboxFiles = useCallback(async (sandboxId: string) => {
    try {
      const files = await getSandboxFiles(sandboxId);
      setSandboxFiles(files);
    } catch (error) {
      console.error('Error loading sandbox files:', error);
    }
  }, []);

  // Remove file from sandbox
  const removeFile = useCallback(async (sandboxId: string, path: string) => {
    try {
      await deleteSandboxFile(sandboxId, path);
      await loadSandboxFiles(sandboxId); // Refresh files list
    } catch (error) {
      console.error('Error removing file:', error);
      throw error;
    }
  }, [loadSandboxFiles]);

  // Load initial data
  useEffect(() => {
    loadThreads();
    
    if (initialThreadId) {
      loadThreadMessages(initialThreadId);
    }
  }, [loadThreads, loadThreadMessages, initialThreadId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    // State
    messages,
    threads,
    isSending,
    currentAgentRunId,
    sandboxFiles,
    
    // Message functions
    sendMessage,
    addMessage,
    
    // Thread functions
    createNewThread,
    loadThreads,
    deleteThreadById,
    loadThreadMessages,
    
    // Agent functions
    startAgentRun,
    cancelCurrentAgent,
    getAgentStatus,
    
    // File functions
    uploadFile,
    loadSandboxFiles,
    removeFile,
    
    // Utility functions
    clearMessages,
    setCurrentThread,
  };
};
