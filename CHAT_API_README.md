# Mobile Chat API System

A comprehensive API system for mobile chat applications with AI agent integration, built using Supabase and React Native.

## 🚀 Features

- **Real-time Chat**: Instant messaging with real-time updates
- **AI Agent Integration**: Claude AI models with configurable options
- **File Management**: Sandbox file upload and management
- **Thread Management**: Multiple chat threads with organization
- **Advanced Options**: Model selection, thinking mode, reasoning effort
- **Security**: Row Level Security (RLS) policies for data protection

## 📁 Project Structure

```
src/
├── lib/
│   ├── api.ts              # Main API functions
│   └── supabaseClient.ts   # Supabase client configuration
├── hooks/
│   └── useChatAPI.ts       # React Native hook for API usage
└── components/
    └── ChatThread.tsx      # Complete chat interface component
```

## 🗄️ Database Setup

### 1. Run the SQL Schema

Execute the `database_schema.sql` file in your Supabase SQL editor to create all necessary tables:

```sql
-- This will create:
-- - threads (chat conversations)
-- - messages (chat messages)
-- - agent_runs (AI processing sessions)
-- - agent_responses (streaming responses)
-- - sandboxes (file storage areas)
-- - sandbox_files (file metadata)
-- - agents (AI agent configurations)
```

### 2. Enable Row Level Security

The schema automatically enables RLS policies for data security. Users can only access their own data.

### 3. Storage Bucket

Create a storage bucket named `sandbox-files` in Supabase for file uploads.

## 🔧 API Functions

### Message Management

```typescript
// Add user message
await addUserMessage(threadId, "Hello, how are you?");

// Get thread messages
const messages = await getThreadMessages(threadId);
```

### Agent Management

```typescript
// Start AI agent
const { agent_run_id } = await startAgent(threadId, {
  model_name: 'claude-3-5-sonnet-20241022',
  enable_thinking: true,
  reasoning_effort: 'high'
});

// Stream agent responses
const unsubscribe = streamAgent(agentRunId, {
  onMessage: (content) => console.log('New response:', content),
  onError: (error) => console.error('Agent error:', error),
  onClose: () => console.log('Stream closed')
});

// Cancel agent
await cancelAgentRun(agentRunId);
```

### Thread Management

```typescript
// Create new thread
const { thread_id } = await createThread("My New Chat");

// Get user threads
const threads = await getUserThreads();

// Delete thread
await deleteThread(threadId);
```

### File Management

```typescript
// Upload file to sandbox
await uploadFileToSandbox(sandboxId, "path/to/file.txt", fileObject);

// Get sandbox files
const files = await getSandboxFiles(sandboxId);

// Delete file
await deleteSandboxFile(sandboxId, "path/to/file.txt");
```

## 🎣 React Native Hook

### Basic Usage

```typescript
import { useChatAPI } from '../hooks/useChatAPI';

const MyChatComponent = () => {
  const {
    messages,
    threads,
    isSending,
    sendMessage,
    createNewThread,
    // ... other functions
  } = useChatAPI();

  const handleSend = async () => {
    await sendMessage("Hello AI!", {
      model_name: 'claude-3-5-sonnet-20241022',
      enable_thinking: true
    });
  };

  return (
    // Your chat UI
  );
};
```

### Hook Features

- **Automatic State Management**: Messages, threads, and agent status
- **Real-time Updates**: Automatic message streaming and updates
- **Error Handling**: Built-in error handling and user feedback
- **Optimistic Updates**: Immediate UI updates for better UX
- **Memory Management**: Automatic cleanup of subscriptions

## 🎨 Complete Chat Component

The `ChatThread.tsx` component provides a full-featured chat interface:

- **Sidebar**: Thread management with create/delete functionality
- **Chat Area**: Real-time messaging with auto-scroll
- **Advanced Options**: Model selection, thinking mode, reasoning effort
- **File Attachments**: File upload integration (placeholder)
- **Responsive Design**: Mobile-optimized UI

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS policies ensuring users can only access their own data:

```sql
-- Example: Users can only view their own threads
CREATE POLICY "Users can view their own threads" ON threads
    FOR SELECT USING (auth.uid() = user_id);
```

### Authentication

- Uses Supabase Auth for user management
- JWT tokens for API authentication
- Automatic user ID injection in queries

## 📱 Mobile Integration

### React Native Compatibility

- **File Handling**: Supports both web File objects and React Native file objects
- **Platform Detection**: Automatic platform-specific behavior
- **Touch Interactions**: Mobile-optimized touch controls
- **Responsive Layout**: Adapts to different screen sizes

### File Upload Integration

To enable actual file uploads, integrate with a file picker library:

```typescript
// Example with react-native-document-picker
import DocumentPicker from 'react-native-document-picker';

const handleFileUpload = async () => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    });
    
    if (result[0]) {
      await uploadFile(sandboxId, result[0].name, result[0]);
    }
  } catch (err) {
    if (!DocumentPicker.isCancel(err)) {
      console.error('Error picking file:', err);
    }
  }
};
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
# For file uploads (optional)
npm install react-native-document-picker
```

### 2. Configure Supabase

Set up your environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Database Schema

Execute `database_schema.sql` in your Supabase SQL editor.

### 4. Use the Hook

```typescript
import { useChatAPI } from './hooks/useChatAPI';

const App = () => {
  const chatAPI = useChatAPI();
  
  return (
    <ChatThread 
      threadId={chatAPI.threads[0]?.thread_id}
      onThreadChange={(id) => console.log('Thread changed:', id)}
    />
  );
};
```

## 🔄 Real-time Features

### Supabase Realtime

The system uses Supabase's real-time capabilities for:

- **Live Message Updates**: Instant message delivery
- **Agent Status Changes**: Real-time agent run status updates
- **File Upload Progress**: Live file upload status
- **Thread Updates**: Real-time thread modifications

### Event Handling

```typescript
// Subscribe to real-time updates
const subscription = supabase
  .channel('agent-run-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'agent_runs',
    filter: `agent_run_id=eq.${agentRunId}`
  }, (payload) => {
    // Handle real-time updates
    console.log('Agent status changed:', payload.new);
  })
  .subscribe();
```

## 🧪 Testing

### API Testing

Test individual API functions:

```typescript
// Test message creation
const testMessage = async () => {
  try {
    await addUserMessage('test-thread-id', 'Test message');
    console.log('Message added successfully');
  } catch (error) {
    console.error('Error adding message:', error);
  }
};
```

### Component Testing

Test the complete chat flow:

```typescript
// Test complete chat flow
const testChatFlow = async () => {
  // Create thread
  const threadId = await createNewThread('Test Chat');
  
  // Send message
  await sendMessage('Hello AI!', {
    model_name: 'claude-3-5-sonnet-20241022'
  });
  
  // Check messages
  console.log('Messages:', messages);
};
```

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure Supabase client is properly configured
2. **RLS Policy Violations**: Check if user is authenticated and policies are correct
3. **Real-time Issues**: Verify Supabase real-time is enabled
4. **File Upload Errors**: Check storage bucket permissions and policies

### Debug Mode

Enable debug logging:

```typescript
// In supabaseClient.ts
const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

## 📈 Performance Optimization

### Database Indexes

The schema includes optimized indexes for:

- Message retrieval by thread
- Agent run status queries
- User thread access
- File metadata queries

### Caching Strategy

- **Message Caching**: Messages are cached in component state
- **Thread Caching**: Thread list is cached and updated incrementally
- **Agent Status**: Real-time updates prevent unnecessary API calls

## 🔮 Future Enhancements

- **Voice Messages**: Audio recording and playback
- **Image Support**: Image upload and display in chat
- **Code Highlighting**: Syntax highlighting for code blocks
- **Search Functionality**: Full-text search across messages
- **Export Features**: Chat export to various formats
- **Multi-language Support**: Internationalization support

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review the Supabase documentation
- Consult the React Native documentation
