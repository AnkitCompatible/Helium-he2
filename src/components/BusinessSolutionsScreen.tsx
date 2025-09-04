import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform,Pressable,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare,User,House,ChartColumn,CircleQuestionMark , CircleCheck,} from 'lucide-react-native';


type BusinessSolutionsScreenProps = {
  displayName: string;
  onNavigateToHome: (message?: string) => void;
  onLogout?: () => void;
  onBack?: () => void;
};

const BusinessSolutionsScreen = ({ displayName, onNavigateToHome, onLogout, onBack }: BusinessSolutionsScreenProps) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(true); // Start with dark mode
  const [draft, setDraft] = React.useState('');
  const inputRef = React.useRef<TextInput>(null);

  // Sample chat history data
  const [chatHistory] = React.useState([
    { id: 1, title: "Business Strategy Discussion", timestamp: "2 hours ago", preview: "How can I improve my business..." },
    { id: 2, title: "Marketing Campaign Ideas", timestamp: "1 day ago", preview: "What are some effective marketing..." },
    { id: 3, title: "Financial Planning Help", timestamp: "3 days ago", preview: "I need help with budgeting..." },
    { id: 4, title: "Product Development", timestamp: "1 week ago", preview: "How should I approach product..." },
    { id: 5, title: "Team Management", timestamp: "2 weeks ago", preview: "What's the best way to manage..." },
  ]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    
    console.log('[Business] Sent message:', trimmed);
    setDraft('');
    // Navigate to home screen with the message
    onNavigateToHome(trimmed);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
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
          onPress: () => {
            setShowMenu(false);
            onLogout && onLogout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#F1F1F1' }]}>
      {/* Header with Back Button, Dark Mode Toggle, and Hamburger Menu */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#1a1a1a' : '#F1F1F1' }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: isDarkMode ? '#2a2a2a' : '#F5F5F5' }]} onPress={onBack}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity style={[styles.darkModeButton, { backgroundColor: isDarkMode ? '#2a2a2a' : '#F5F5F5' }]} onPress={toggleDarkMode}>
            <Text style={[styles.darkModeIcon, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              {isDarkMode ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuButton, { backgroundColor: isDarkMode ? '#2a2a2a' : '#F5F5F5' }]} onPress={() => setShowSidebar(true)}>
            <View style={styles.hamburgerIcon}>
              <View style={[styles.hamburgerLine, { backgroundColor: isDarkMode ? '#FFFFFF' : '#000000' }]} />
              <View style={[styles.hamburgerLine, { backgroundColor: isDarkMode ? '#FFFFFF' : '#000000' }]} />
              <View style={[styles.hamburgerLine, { backgroundColor: isDarkMode ? '#FFFFFF' : '#000000' }]} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content - Scrollable */}
      <View style={styles.scrollContainer}>
        {/* Avatar and Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>How do I help your business today?</Text>
        </View>

        {/* Cards Grid - 2x2 Layout */}
        <View style={styles.cardsGrid}>
          <View style={styles.cardsRow}>
            <TouchableOpacity style={[styles.card, styles.consultantCard]}>
              <View style={styles.cardTop}>
                <View style={styles.personIcon}>
                <User 
                  size={30} 
                  color={isDarkMode ? '#FFFFFF' : '#000000'} 
                />
                </View>
                <Text style={[styles.arrowIcon, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>›</Text>
              </View>
              <Text style={[styles.cardText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Talk with Consultant</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, styles.consultantCard]}>
              <View style={styles.cardTop}>
                <View style={styles.personIcon}>
                <User 
                  size={30} 
                  color={isDarkMode ? '#FFFFFF' : '#000000'} 
                />
                </View>
                <Text style={[styles.arrowIcon, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>›</Text>
              </View>
              <Text style={[styles.cardText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Talk with Consultant</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardsRow}>
            <TouchableOpacity style={[styles.card, styles.consultantCard]}>
              <View style={styles.cardTop}>
                <View style={styles.personIcon}>
                <User 
                  size={30} 
                  color={isDarkMode ? '#FFFFFF' : '#000000'} 
                />
                </View>
                <Text style={[styles.arrowIcon, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>›</Text>
              </View>
              <Text style={[styles.cardText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Talk with Consultant</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.card, styles.aiCard]}>
              <View style={styles.cardTop}>
                <View style={styles.chatIcon}>
                  <MessageSquare 
                    size={30} 
                    color={isDarkMode ? '#FFFFFF' : '#000000'} 
                  />
                </View>
                <Text style={[styles.arrowIcon, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>›</Text>
              </View>
              <Text style={[styles.cardText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Chat with AI{'\n'}Assistant</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Input Section - Fixed at bottom */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1a1a1a' : '#F1F1F1' }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Pressable style={[styles.glowRing, { backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF' }]} onPress={() => inputRef.current?.focus()}>
          <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? '#2a2a2a' : '#FFFFFF' }]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
              placeholder="" 
              placeholderTextColor="#9ca3af"
              multiline
              value={draft}
              onChangeText={setDraft}
            />
            {/* Attach button - bottom left */}
            <TouchableOpacity onPress={() => {}} activeOpacity={0.7} style={styles.attachBtn}>
              <Image source={isDarkMode ? require('../../assets/attach.png') : require('../../assets/WhiteAttach.png')}
               style={styles.iconImg} resizeMode="contain" />
            </TouchableOpacity>
            {/* Mic button - left to send */}
            <TouchableOpacity onPress={() => {}} activeOpacity={0.7} style={styles.micBtn}>
              <Image 
                source={isDarkMode ? require('../../assets/mic.png') : require('../../assets/WhiteMic.png')} 
                style={styles.iconImg} 
                resizeMode="contain" 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSend} activeOpacity={0.8} style={styles.sendBtn}>
              <Image  source={isDarkMode ? require('../../assets/darkSend.png') : require('../../assets/send.png')} 
               style={styles.sendImg} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </KeyboardAvoidingView>

      {/* Bottom Navigation Bar - Horizontally Scrollable */}
      <View style={[styles.bottomNavContainer, { backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF', borderTopColor: isDarkMode ? '#333333' : '#E0E0E0' }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bottomNav}
          style={styles.bottomNavScroll}
        >
          <TouchableOpacity style={styles.navItem}>
          <House 
            size={24} 
            color={isDarkMode ? '#FFFFFF' : '#000000'} 
          />       
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
          <ChartColumn 
            size={24} 
            color={isDarkMode ? '#FFFFFF' : '#000000'} 
          /> 

          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
          <CircleQuestionMark 
            size={24} 
            color={isDarkMode ? '#FFFFFF' : '#000000'} 
          />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
          <CircleCheck 
            size={24} 
            color={isDarkMode ? '#FFFFFF' : '#000000'} 
          />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <View style={styles.activeProfileIcon}>
            <User 
              size={24} 
              color={isDarkMode ? '#FFFFFF' : '#000000'} 
            />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Right Sidebar Menu */}
      <Modal
        visible={showSidebar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSidebar(false)}
      >
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity 
            style={styles.sidebarBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowSidebar(false)}
          />
          <View style={[styles.sidebarContainer, { backgroundColor: isDarkMode ? '#2a2a2a' : '#FFFFFF' }]}>
            <View style={[styles.sidebarHeader, { borderBottomColor: isDarkMode ? '#444444' : '#E0E0E0' }]}>
              <Text style={[styles.sidebarTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Chat History</Text>
              <TouchableOpacity 
                style={[styles.closeButton, { backgroundColor: isDarkMode ? '#444444' : '#F5F5F5' }]} 
                onPress={() => setShowSidebar(false)}
              >
                <Text style={[styles.closeButtonText, { color: isDarkMode ? '#FFFFFF' : '#666666' }]}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.historyList}>
              {chatHistory.map((chat) => (
                <TouchableOpacity 
                  key={chat.id} 
                  style={[styles.historyItem, { borderBottomColor: isDarkMode ? '#444444' : '#F0F0F0' }]}
                  onPress={() => {
                    setShowSidebar(false);
                    onNavigateToHome();
                  }}
                >
                  <Text style={[styles.historyTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>{chat.title}</Text>
                  <Text style={[styles.historyPreview, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>{chat.preview}</Text>
                  <Text style={styles.historyTimestamp}>{chat.timestamp}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={[styles.sidebarFooter, { borderTopColor: isDarkMode ? '#444444' : '#E0E0E0' }]}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Sign out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  darkModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkModeIcon: {
    fontSize: 18,
    color: '#FFFFFF',
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Add space for the floating button
  },
  titleSection: {
    marginBottom: 24,
    marginLeft:20,
  },
  avatar: {
    marginTop:15,
    width: 50,
    height: 50,
    borderRadius: 35,
    backgroundColor: '#C6FF00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 50,
  },
    cardsGrid: {
    paddingLeft: 20,
    paddingRight: 30,
    marginBottom: 24,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    height: 150,
    borderRadius: 30,
    padding: 25,
    marginHorizontal: 8,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consultantCard: {
    backgroundColor: '#7bc043',
  },
  aiCard: {
    backgroundColor: '#38ACEC',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  personIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
 
  chatIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBubble: {
    width: 30,
    height: 30,
    paddingRight:5,
  },
  arrowIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  businessSolutionsLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop:20,
  },
  graphIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    marginRight: 8,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingBottom:190,
    height: 200,
    backgroundColor: '#1a1a1a',
  },
  inputWrapper: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ff88',
    padding: 6,
    backgroundColor: '#2a2a2a',
    shadowColor: '#00ff88',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    width: '100%',
    height: 170,
  },
  glowRing: { 
    borderRadius: 14,
    padding: 2,
    backgroundColor: '#1a1a1a',
    alignSelf: 'stretch',
  },
  input: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderColor: '#3a3a3a',
    paddingHorizontal: 14,
    paddingBottom: 40,
    textAlignVertical: 'top',
    color: '#FFFFFF',
  },
  sendBtn: {
    position: 'absolute',
    right: 12,
    bottom: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  iconImg: {
    width: 33,
    height: 33,
    padding: 10,
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
  sendImg: {
    height: 33,
    width: 33,
  },
  businessOperationsLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  operationsIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#9E9E9E',
    borderRadius: 2,
    marginRight: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  bottomNavContainer: {
    height: 60,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  bottomNavScroll: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 38,
    minWidth: '100%',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 40,
    marginHorizontal: 10,
  },
  navIcon: {
    width: 24,
    height: 24,
  },
  activeProfileIcon: {
    width: 50,
    height: 32,
    borderRadius: 25,
    // backgroundColor: '#C6FF00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeProfileText: {
    width: 30,
    paddingRight:5,
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
  messageIcon:{

  },
  // Right Sidebar styles
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebarContainer: {
    width: 300,
    height: '100%',
    backgroundColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#444444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  historyList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  historyPreview: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  historyTimestamp: {
    fontSize: 12,
    color: '#999999',
  },
  sidebarFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#444444',
  },
  logoutButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BusinessSolutionsScreen;