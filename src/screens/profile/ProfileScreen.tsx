import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import AdminNotificationPanel from './AdminNotificationPanel';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { customTheme, theme } from '../../styles/theme';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  
  // Dynamic Island veya çentik için ekstra padding hesapla
  const topPadding = Platform.OS === 'ios' ? Math.max(20, insets.top) : 20;

  const handleSignOut = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          onPress: signOut,
          style: 'destructive',
        },
      ]
    );
  };

  const handlePremium = () => {
    // Premium abonelik ekranına yönlendirme
    Alert.alert('Premium', 'Premium abonelik ekranı henüz hazır değil.');
  };

  return (
    <>
      <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
        >
          <View style={styles.userInfoContainer}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.fullName?.charAt(0) || 'U'}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.fullName || 'Kullanıcı'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'kullanici@ornek.com'}</Text>
            
            {!user?.isPremium && (
              <TouchableOpacity 
                style={styles.premiumButton}
                onPress={handlePremium}
              >
                <Ionicons name="star" size={18} color="#fff" />
                <Text style={styles.premiumButtonText}>Premium'a Geç</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.menuContainer}>
            {/* Admin ise Bildirim Gönder seçeneği */}
            {(user?.role ?? '') === 'admin' && (
              <TouchableOpacity style={styles.menuItem} onPress={() => setShowNotificationPanel(true)}>
                <Ionicons name="megaphone-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.menuItemText}>Bildirim Gönder</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="person-outline" size={24} color={theme.colors.text} />
              <Text style={styles.menuItemText}>Hesap Bilgileri</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
              <Text style={styles.menuItemText}>Bildirimler</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
              <Text style={styles.menuItemText}>Ayarlar</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="help-circle-outline" size={24} color={theme.colors.text} />
              <Text style={styles.menuItemText}>Yardım ve Destek</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.signOutItem]}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
              <Text style={[styles.menuItemText, styles.signOutText]}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.versionText}>Sürüm 1.0.0</Text>
        </ScrollView>
        {/* Bildirim Gönder Modalini burada tanımlayacağız */}
      </SafeAreaView>
      {/* Admin Bildirim Paneli Modal */}
      {showNotificationPanel && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99,
        }}>
          <View style={{ width: '90%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 16, padding: 8 }}>
            <AdminNotificationPanel />
            <TouchableOpacity onPress={() => setShowNotificationPanel(false)} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
              <Text style={{ color: theme.colors.error, fontWeight: 'bold', fontSize: 16 }}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: customTheme.spacing.l,
    paddingBottom: customTheme.spacing.xl,
  },
  userInfoContainer: {
    alignItems: 'center',
    paddingVertical: customTheme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: customTheme.spacing.m,
    ...customTheme.shadows.small,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: customTheme.spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.6,
    marginBottom: customTheme.spacing.m,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingVertical: customTheme.spacing.s,
    paddingHorizontal: customTheme.spacing.m,
    borderRadius: 20,
    ...customTheme.shadows.small,
  },
  premiumButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: customTheme.spacing.xs,
  },
  menuContainer: {
    paddingHorizontal: customTheme.spacing.l,
    paddingTop: customTheme.spacing.l,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: customTheme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: customTheme.spacing.m,
  },
  signOutItem: {
    borderBottomWidth: 0,
    marginTop: customTheme.spacing.m,
  },
  signOutText: {
    color: theme.colors.error,
  },
  versionText: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.5,
    textAlign: 'center',
    marginTop: customTheme.spacing.xl,
    marginBottom: customTheme.spacing.xl,
  },
});

export default ProfileScreen; 