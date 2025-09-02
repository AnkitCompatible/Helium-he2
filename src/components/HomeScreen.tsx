import React from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, FlatList, TouchableOpacity, Pressable, Image, ScrollView, Modal, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SafeAreaView } from 'react-native-safe-area-context';

// Type definitions for API response
interface ChatMessage {
  role: string;
  content: string;
}

interface ChatChoice {
  message: ChatMessage;
}

interface ChatResponse {
  choices: ChatChoice[];
}


type HomeScreenProps = {
  displayName: string;
  onLogout?: () => void;
  onBack?: () => void;
};

const HomeScreen = ({ displayName, onLogout, onBack }: HomeScreenProps) => {
  const [draft, setDraft] = React.useState('');
  const [messages, setMessages] = React.useState<Array<{role: string, content: string}>>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showHeader, setShowHeader] = React.useState(true);
  const [showMenu, setShowMenu] = React.useState(false);
  const inputRef = React.useRef<TextInput>(null);
  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    
    setIsLoading(true);
    setShowHeader(false); // Hide header after first message
    console.log('[Home] Sent message:', trimmed);
    
    // Add user message to chat
    const userMessage = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    
    fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "user",
            content: trimmed,
          },
        ],
      }),
    })
        .then(response => {
      console.log('[Home] Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json() as Promise<ChatResponse>;
    })
    .then((data: ChatResponse) => {
      console.log('[Home] API Response:', data);
      
      // Extract the AI response content
      const aiResponse = data.choices[0]?.message?.content;
      if (aiResponse) {
        console.log('[Home] AI Response:', aiResponse);
        const assistantMessage = { role: 'assistant', content: aiResponse };
        setMessages(prev => [...prev, assistantMessage]);
      }
    })
    .catch(error => {
      console.error('[Home] API Error:', error);
      // Add error message to chat
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    })
    .finally(() => {
      setIsLoading(false);
    });
    
    setDraft('');
  };
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setShowMenu(false);
            try {
              let shouldSignOut = true;
              try {
                if (typeof (GoogleSignin as any).hasPreviousSignIn === 'function') {
                  const hasPrev = await (GoogleSignin as any).hasPreviousSignIn();
                  shouldSignOut = hasPrev;
                }
              } catch {}
              if (shouldSignOut) {
                try { await GoogleSignin.revokeAccess(); } catch {}
                try { await GoogleSignin.signOut(); } catch {}
              }
            } catch {}
            onLogout && onLogout();
          },
        },
      ]
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenu(true)}>
              <View style={styles.hamburgerIcon}>
                <View style={styles.hamburgerLine} />
                <View style={styles.hamburgerLine} />
                <View style={styles.hamburgerLine} />
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.greeting}>Good Morning, <Text style={styles.bold}>{displayName}</Text></Text>
          <Text style={styles.sub}>what can I do for you?</Text>
        </View>
      )}

      {/* Messages Display */}
      <ScrollView 
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContentContainer}
      >
        {messages.map((message, index) => (
          <View key={index} style={[
            styles.messageBubble,
            message.role === 'user' ? styles.userMessage : styles.assistantMessage
          ]}>
            <Text style={[
              styles.messageText,
              message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
            ]}>
              {message.content}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageBubble, styles.assistantMessage]}>
            <Text style={[styles.messageText, styles.assistantMessageText]}>
              Thinking...
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Input Section - Fixed at bottom */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.inputContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Pressable style={styles.glowRing} onPress={() => inputRef.current?.focus()}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="" 
              placeholderTextColor="#9ca3af"
              multiline
              value={draft}
              onChangeText={setDraft}
            />
            {/* Attach button - bottom left */}
            <TouchableOpacity onPress={() => {}} activeOpacity={0.7} style={styles.attachBtn}>
              <Image source={require('../../assets/attach.png')} style={styles.iconImg} resizeMode="contain" />
            </TouchableOpacity>
            {/* Mic button - left to send */}
            <TouchableOpacity onPress={() => {}} activeOpacity={0.7} style={styles.micBtn}>
              <Image source={require('../../assets/mic.png')} style={styles.iconImg} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSend} activeOpacity={0.8} style={styles.sendBtn}>
              <Image source={require('../../assets/send.png')} style={styles.sendImg} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </KeyboardAvoidingView>

      {/* Hamburger Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={styles.menuItemText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerIcon: {
    width: 20,
    height: 16,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    height:150,
    backgroundColor: 'black',
  },
  logoutBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: {
    color: '#e5e7eb',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 200,
  },
  greeting: {
    color: '#e5e7eb',
    fontSize: 28,
    textAlign: 'left',
  },
  bold: {
    fontWeight: '700',
  },
  sub: {
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 18,
    fontSize: 16,
  },
  inputWrapper: {
    position: 'relative',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ff88',
    padding: 6,
    backgroundColor: '#1f1f1f',
    shadowColor: '#00ff88',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    width: '100%',
    height: '55%',
    
  },
// inputWrapper::after{
//    width: '100%',
//     height: '55%',
// }
  glowRing: { 
    borderRadius: 14,
    padding: 2,
    backgroundColor: 'black',
    alignSelf: 'stretch',
  },
  input: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    // borderWidth: 1,
    borderColor: '#3a3a3a',
    paddingHorizontal: 14,
    paddingBottom:40 ,
    color: '#e5e7eb',
    textAlignVertical: 'top',
  },
  inlineAccessoryLeft: {
    position: 'absolute',
    left: 10,
    top: '50%',
    marginTop: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2a2a2a',
    
    // borderRadius: 9,
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  inlineAccessoryRight: {
    position: 'absolute',
    right: 48,
    top: '50%',
    marginTop: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2a2a2a',
  },
  sendBtn: {
    position: 'absolute',
    right: 12,
    bottom: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    // backgroundColor: '#00ff88',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendTxt: {
    color: '#0b0b0b',
    fontSize: 16,
    fontWeight: '700',
  },
  attachBtn: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachTxt: {
    color: '#8a8a8a',
    fontSize: 16,
  },
  iconImg: {
    width: 33,
    height: 33,
    padding :10,
    margin: 10,

  },
  micBtn: {
    position: 'absolute',
    right: 52,
    bottom: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micTxt: {
    color: '#8a8a8a',
    fontSize: 16,
  },
  sendImg: {
    height:33,
    width:33,
  },
  text:{
    alignItems: 'center', 
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContentContainer: {
    paddingBottom: 20,
  },
  messageBubble: {
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#00ff88',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2a2a2a',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#000000',
  },
  assistantMessageText: {
    color: '#e5e7eb',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 120,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
});

export default HomeScreen;