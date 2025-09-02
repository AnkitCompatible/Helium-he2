import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


type BusinessSolutionsScreenProps = {
  displayName: string;
  onNavigateToHome: () => void;
  onLogout?: () => void;
  onBack?: () => void;
};

const BusinessSolutionsScreen = ({ displayName, onNavigateToHome, onLogout, onBack }: BusinessSolutionsScreenProps) => {
  const [showMenu, setShowMenu] = React.useState(false);

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
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button and Hamburger Menu */}
      <View style={styles.header}>
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

      {/* Main Content - Scrollable */}
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Avatar and Title */}
        <View style={styles.titleSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>H</Text>
          </View>
          <Text style={styles.title}>How do I help your business today?</Text>
        </View>

        {/* Options Row - Two Cards */}
        <View style={styles.cardsRow}>
          <TouchableOpacity style={[styles.card, styles.consultantCard]}>
            <View style={styles.cardTop}>
              <View style={styles.personIcon}>
                <View style={styles.personHead} />
                <View style={styles.personBody} />
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </View>
            <Text style={styles.cardText}>Talk with Consultant</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.aiCard]}>
            <View style={styles.cardTop}>
              <View style={styles.chatIcon}>
                <View style={styles.chatBubble} />
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </View>
            <Text style={styles.cardText}>Chat with AI{'\n'}Assistant</Text>
          </TouchableOpacity>
        </View>

        {/* Business Solutions Label */}
        <View style={styles.businessSolutionsLabel}>
          <View style={styles.graphIcon} />
          <Text style={styles.labelText}>Business Solutions</Text>
        </View>


        <View style={styles.businessSolutionsLabel}>
          <View style={styles.graphIcon} />
          <Text style={styles.labelText}>Business Solutions</Text>
        </View>
        <View style={styles.businessSolutionsLabel}>
          <View style={styles.graphIcon} />
          <Text style={styles.labelText}>Business Solutions</Text>
        </View>
        <View style={styles.businessSolutionsLabel}>
          <View style={styles.graphIcon} />
          <Text style={styles.labelText}>Business Solutions</Text>
        </View>
        <View style={styles.businessSolutionsLabel}>
          <View style={styles.graphIcon} />
          <Text style={styles.labelText}>Business Solutions</Text>
        </View>
        <View style={styles.businessSolutionsLabel}>
          <View style={styles.graphIcon} />
          <Text style={styles.labelText}>Business Solutions</Text>
        </View>
        <View style={styles.businessSolutionsLabel}>
          <View style={styles.graphIcon} />
          <Text style={styles.labelText}>Business Solutions</Text>
        </View>
        <View style={styles.businessSolutionsLabel}>
          <View style={styles.graphIcon} />
          <Text style={styles.labelText}>Business Solutions</Text>
        </View>
        <View style={styles.businessSolutionsLabel}>
          <View style={styles.graphIcon} />
          <Text style={styles.labelText}>Business Solutions</Text>
        </View>
        <View style={styles.businessSolutionsLabel}>
          <View style={styles.graphIcon} />
          <Text style={styles.labelText}>Business Solutions</Text>
        </View>
        <View style={styles.businessSolutionsLabel}>
          <View style={styles.graphIcon} />
          <Text style={styles.labelText}>Business Solutions</Text>
        </View>

        



        {/* Business Operations Subtext */}
        <View style={styles.businessOperationsLabel}>
          <View style={styles.operationsIcon} />
          
          <Text style={styles.subtext}>Business Operations</Text>
        </View>

      </ScrollView>

      {/* Floating Action Button - Fixed position over content */}
      <TouchableOpacity style={styles.floatingButton} onPress={onNavigateToHome}>
        <Image
          source={require('../../assets/post-feed-navigation-item.png')} 
          style={styles.floatingButtonIcon}
          resizeMode="contain"
        />
        <Text style={styles.floatingButtonText}>Start business chat</Text>
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>
            <Image 
                source={require('../../assets/home.png')} 
                style={styles.activeProfileText}
                resizeMode="contain" />          
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>
            <Image 
                source={require('../../assets/chart.png')} 
                style={styles.activeProfileText}
                resizeMode="contain" />  
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>
            <Image 
                source={require('../../assets/question.png')} 
                style={styles.activeProfileText}
                resizeMode="contain" />  
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>
            <Image 
                source={require('../../assets/tick.png')} 
                style={styles.activeProfileText}
                resizeMode="contain" />  
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeProfileIcon}>
            {/* <Text ></Text> */}
             <Image 
                source={require('../../assets/userIcon.png')} 
                style={styles.activeProfileText}
                resizeMode="contain" />          
          </View>
        </TouchableOpacity>
      </View>

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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#000000',
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
  },
  avatar: {
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
    color: '#000000',
    lineHeight: 50,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: 24,
  },
  card: {
    width: '45%',
    height: 250,
    borderRadius: 30,
    padding: 25,
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
  personHead: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
    marginBottom: 2,
  },
  personBody: {
    width: 16,
    height: 8,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  chatIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBubble: {
    width: 20,
    height: 16,
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  arrowIcon: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
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
  floatingButton: {
    position: 'absolute',
    bottom: 100, // Position above the bottom navigation (60px height + 20px margin)
    left: 20,
    right: 20,
    backgroundColor: '#000000',
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000, // Ensure it floats above all content
  },
  floatingButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#FFFFFF',
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  navIcon: {
    fontSize: 20,
  },
  activeProfileIcon: {
    width: 50,
    height: 32,
    borderRadius: 25,
    backgroundColor: '#C6FF00',
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
  iconImg:{
    width: 20,
    height: 20,
  },
  messageIcon:{

  }
});

export default BusinessSolutionsScreen;