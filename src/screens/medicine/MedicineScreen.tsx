import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { customTheme, theme } from '../../styles/theme';

const MedicineScreen = () => {
  const insets = useSafeAreaInsets();
  
  // Dynamic Island veya çentik için ekstra padding hesapla
  const topPadding = Platform.OS === 'ios' ? Math.max(20, insets.top) : 20;
  
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>İlaçlarım</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Ionicons name="medkit-outline" size={64} color={theme.colors.text} style={styles.emptyStateIcon} />
            <Text style={styles.emptyStateTitle}>İlaç Bulunamadı</Text>
            <Text style={styles.emptyStateText}>
              Henüz ilaç eklemediniz. Sağ üstteki + butonuna tıklayarak ilaç ekleyebilirsiniz.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: customTheme.spacing.l,
    paddingVertical: customTheme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...customTheme.shadows.small,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: customTheme.spacing.xxl,
  },
  emptyStateIcon: {
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: customTheme.spacing.l,
    marginBottom: customTheme.spacing.s,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.6,
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default MedicineScreen; 