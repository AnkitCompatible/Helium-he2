import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  Alert,
} from 'react-native';

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
      {/* Status Bar Area */}
      <View style={styles.statusBar}>
        <Text style={styles.timeText}>9:41</Text>
        <View style={styles.statusIcons}>
          <View style={styles.statusIcon} />
          <View style={styles.statusIcon} />
          <View style={styles.statusIcon} />
        </View>
      </View>

      {/* Header Section */}
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
        <View style={styles.profileSection}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileText}>H</Text>
          </View>
          <Text style={styles.mainHeading}>How do I help your business today?</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Interactive Cards */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity style={[styles.card, styles.consultantCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.consultantIcon}>
                <View style={styles.personIcon} />
                <View style={styles.consultantDot} />
              </View>
              <View style={styles.arrowIcon}>
                <Text style={styles.arrowText}>›</Text>
              </View>
            </View>
            <Text style={styles.cardText}>Talk with Consultant</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.aiCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.chatIcon}>
                <View style={styles.chatBubble} />
              </View>
              <View style={styles.arrowIcon}>
                <Text style={styles.arrowText}>›</Text>
              </View>
            </View>
            <Text style={styles.cardText}>Chat with AI{'\n'}Assistant</Text>
          </TouchableOpacity>
        </View>

        {/* Business Solutions Section */}
        <View style={styles.businessSolutionsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.graphIcon} />
            <Text style={styles.sectionTitle}>Business Solutions</Text>
          </View>
        </View>

        {/* Start Business Chat Bar */}
        <TouchableOpacity style={styles.chatBar} onPress={onNavigateToHome}>
          <View style={styles.chatBarContent}>
            <View style={styles.chatBarIcon}>
              <View style={styles.chatBubbleWhite} />
            </View>
            <Text style={styles.chatBarText}>Start business chat</Text>
          </View>
        </TouchableOpacity>

        {/* Business Operations Section */}
        <View style={styles.businessOperationsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.operationsIcon} />
            <Text style={styles.operationsTitle}>Business Operations</Text>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>🏠</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>📊</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>❓</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>✓</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <View style={[styles.navIcon, styles.activeNavIcon]}>
            <Text style={styles.activeNavIconText}>👤</Text>
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
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  statusIcon: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00FF88',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    lineHeight: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  consultantCard: {
    backgroundColor: '#00FF88',
  },
  aiCard: {
    backgroundColor: '#87CEEB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  consultantIcon: {
    position: 'relative',
  },
  personIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#000000',
    borderRadius: 10,
  },
  consultantDot: {
    position: 'absolute',
    top: -4,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: '#000000',
    borderRadius: 4,
  },
  chatIcon: {
    width: 20,
    height: 20,
  },
  chatBubble: {
    width: 20,
    height: 16,
    backgroundColor: '#000000',
    borderRadius: 8,
    position: 'relative',
  },
  chatBubbleWhite: {
    width: 16,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 20,
  },
  businessSolutionsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  graphIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#00FF88',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FF88',
  },
  chatBar: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  chatBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatBarIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  businessOperationsSection: {
    marginBottom: 20,
  },
  operationsIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#808080',
    borderRadius: 2,
  },
  operationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#808080',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  activeNavItem: {
    // Active state styling
  },
  navIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00FF88',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconText: {
    fontSize: 20,
  },
  activeNavIconText: {
    fontSize: 16,
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

export default BusinessSolutionsScreen;
