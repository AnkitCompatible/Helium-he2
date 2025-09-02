import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useChatAPI } from '../hooks/useChatAPI';
import { UnifiedMessage } from '../lib/api';

interface ChatThreadProps {
  threadId?: string;
  onThreadChange?: (threadId: string) => void;
}

const ChatThread: React.FC<ChatThreadProps> = ({ threadId, onThreadChange }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [enableThinking, setEnableThinking] = useState(false);
  const [reasoningEffort, setReasoningEffort] = useState<'low' | 'medium' | 'high'>('low');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  
  const {
    messages,
    threads,
    isSending,
    currentAgentRunId,
    sandboxFiles,
    sendMessage,
    addMessage,
    createNewThread,
    loadThreads,
    deleteThreadById,
    loadThreadMessages,
    cancelCurrentAgent,
    uploadFile,
    loadSandboxFiles,
    removeFile,
    clearMessages,
    setCurrentThread,
  } = useChatAPI(threadId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Handle thread change
  useEffect(() => {
    if (threadId && onThreadChange) {
      onThreadChange(threadId);
    }
  }, [threadId, onThreadChange]);

  // Debug: Log newMessage changes
  useEffect(() => {
    console.log('newMessage state changed:', newMessage);
  }, [newMessage]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      // Use the real API to send message
      await sendMessage(newMessage, {
        model_name: selectedModel,
        enable_thinking: enableThinking,
        reasoning_effort: reasoningEffort,
      });
      
      setNewMessage('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
      console.error('Error sending message:', error);
    }
  };

  const handleCreateNewThread = async () => {
    try {
      const newThreadId = await createNewThread('New Chat');
      if (onThreadChange) {
        onThreadChange(newThreadId);
      }
      Alert.alert('Success', 'New thread created!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create new thread.');
      console.error('Error creating thread:', error);
    }
  };

  const handleDeleteThread = async (threadIdToDelete: string) => {
    Alert.alert(
      'Delete Thread',
      'Are you sure you want to delete this thread? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteThreadById(threadIdToDelete);
              Alert.alert('Success', 'Thread deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete thread.');
              console.error('Error deleting thread:', error);
            }
          },
        },
      ]
    );
  };

  const handleFileUpload = async () => {
    // This would integrate with a file picker library
    // For now, we'll show an alert
    Alert.alert(
      'File Upload',
      'File upload functionality would be implemented here with a file picker library.',
      [{ text: 'OK' }]
    );
  };

  const renderMessage = ({ item }: { item: UnifiedMessage }) => {
    const isUser = item.type === 'user';
    const isError = item.content.startsWith('Error:');

    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.assistantMessage,
        isError && styles.errorMessage
      ]}>
        <Text style={[
          styles.messageText,
          isUser ? styles.userMessageText : styles.assistantMessageText,
          isError && styles.errorMessageText
        ]}>
          {item.content}
        </Text>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  const renderThreadItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.threadItem,
        threadId === item.thread_id && styles.selectedThread
      ]}
             onPress={() => {
         setCurrentThread(item.thread_id);
         if (onThreadChange) {
           onThreadChange(item.thread_id);
         }
       }}
    >
      <Text style={styles.threadTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.threadTime}>
        {new Date(item.updated_at).toLocaleDateString()}
      </Text>
      <TouchableOpacity
        style={styles.deleteThreadButton}
        onPress={() => handleDeleteThread(item.thread_id)}
      >
        <Text style={styles.deleteThreadButtonText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Threads Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Chats</Text>
          <TouchableOpacity
            style={styles.newThreadButton}
            onPress={handleCreateNewThread}
          >
            <Text style={styles.newThreadButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={threads}
          renderItem={renderThreadItem}
          keyExtractor={(item) => item.thread_id}
          style={styles.threadsList}
        />
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView 
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>
            {threads.find(t => t.thread_id === threadId)?.title || 'Select a chat'}
          </Text>
          {currentAgentRunId && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelCurrentAgent}
            >
              <Text style={styles.cancelButtonText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.message_id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
        />

        {/* Advanced Options */}
        {showAdvancedOptions && (
          <View style={styles.advancedOptions}>
            <Text style={styles.optionsTitle}>Advanced Options</Text>
            
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Model:</Text>
              <TouchableOpacity
                style={styles.modelSelector}
                onPress={() => {
                  Alert.alert(
                    'Select Model',
                    'Choose AI model',
                    [
                      { text: 'Claude 3.5 Sonnet', onPress: () => setSelectedModel('claude-3-5-sonnet-20241022') },
                      { text: 'Claude 3.5 Haiku', onPress: () => setSelectedModel('claude-3-5-haiku-20241022') },
                      { text: 'Claude 3 Opus', onPress: () => setSelectedModel('claude-3-opus-20240229') },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }}
              >
                <Text style={styles.modelSelectorText}>{selectedModel}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Enable Thinking:</Text>
              <TouchableOpacity
                style={[styles.toggleButton, enableThinking && styles.toggleButtonActive]}
                onPress={() => setEnableThinking(!enableThinking)}
              >
                <Text style={styles.toggleButtonText}>
                  {enableThinking ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Reasoning Effort:</Text>
              <TouchableOpacity
                style={styles.reasoningSelector}
                onPress={() => {
                  Alert.alert(
                    'Reasoning Effort',
                    'Choose reasoning effort level',
                    [
                      { text: 'Low', onPress: () => setReasoningEffort('low') },
                      { text: 'Medium', onPress: () => setReasoningEffort('medium') },
                      { text: 'High', onPress: () => setReasoningEffort('high') },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }}
              >
                <Text style={styles.reasoningSelectorText}>{reasoningEffort}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputArea}>
          {/* Debug: Show current input value */}
          {isTyping && (
            <View style={styles.debugInputDisplay}>
              <Text style={styles.debugInputText}>
                Current input: "{newMessage}"
              </Text>
            </View>
          )}
          
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={handleFileUpload}
            >
              <Text style={styles.attachButtonText}>📎</Text>
            </TouchableOpacity>
            
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={(text) => {
                console.log('TextInput onChangeText:', text); // Debug log
                setNewMessage(text);
                setIsTyping(true);
              }}
              placeholder="Type your message..."
              multiline
              maxLength={1000}
              autoFocus={false}
              blurOnSubmit={false}
              returnKeyType="default"
              onFocus={() => {
                console.log('TextInput focused');
                setIsTyping(true);
              }}
              onBlur={() => {
                console.log('TextInput blurred');
                setIsTyping(false);
              }}
              editable={true}
              keyboardType="default"
              textContentType="none"
              autoCorrect={true}
              autoCapitalize="sentences"
            />
            
            <TouchableOpacity
              style={styles.optionsButton}
              onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              <Text style={styles.optionsButtonText}>⚙️</Text>
            </TouchableOpacity>
            
            {/* Debug button to test input */}
            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => {
                console.log('Current newMessage state:', newMessage);
                Alert.alert('Debug', `Current message: "${newMessage}"`);
              }}
            >
              <Text style={styles.debugButtonText}>🐛</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newMessage.trim() || isSending) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sendButtonText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  
  // Sidebar styles
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  newThreadButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newThreadButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  threadsList: {
    flex: 1,
  },
  threadItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  selectedThread: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  threadTime: {
    fontSize: 12,
    color: '#666',
  },
  deleteThreadButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteThreadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Chat area styles
  chatArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ff4444',
    borderRadius: 16,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#333',
  },
  errorMessageText: {
    color: '#c62828',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  
  // Advanced options styles
  advancedOptions: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 14,
    color: '#666',
  },
  modelSelector: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modelSelectorText: {
    fontSize: 12,
    color: '#333',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#ddd',
    borderRadius: 16,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  reasoningSelector: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reasoningSelectorText: {
    fontSize: 12,
    color: '#333',
  },
  
  // Input area styles
  inputArea: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachButtonText: {
    fontSize: 18,
  },
  messageInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  optionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  optionsButtonText: {
    fontSize: 18,
  },
  debugButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffeb3b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  debugButtonText: {
    fontSize: 18,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  debugInputDisplay: {
    backgroundColor: '#e3f2fd',
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  debugInputText: {
    color: '#1976d2',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ChatThread;
