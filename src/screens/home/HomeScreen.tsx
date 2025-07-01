import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { customTheme, theme } from '../../styles/theme';

const HomeScreen = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Dynamic Island veya çentik için ekstra padding hesapla
  const topPadding = Platform.OS === 'ios' ? Math.max(20, insets.top) : 20;

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
      >
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Merhaba, {user?.fullName || 'Kullanıcı'}</Text>
          <Text style={styles.subtitle}>İlaçlarınızı takip etmeye başlayın</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Bugünkü İlaçlarınız</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Henüz planlanmış ilaç bulunmuyor. İlaçlarım bölümünden ilaçlarınızı ekleyebilirsiniz.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: customTheme.spacing.xxl,
  },
  greeting: {
    marginTop: customTheme.spacing.xl,
    marginBottom: customTheme.spacing.l,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.6,
    marginTop: customTheme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: customTheme.spacing.m,
  },
  emptyState: {
    padding: customTheme.spacing.l,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.colors.border ? 8 : customTheme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    ...customTheme.shadows.small,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.6,
    textAlign: 'center',
  },
});

export default HomeScreen; 