import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { firestore } from '../../services/firebase';
import { customTheme, theme } from '../../styles/theme';

// Medicine tipi
 type Medicine = {
  id: string;
  medicineName: string;
  medicineType: string;
  dose: string;
  timesPerDay: number;
  times: string[];
  isActive: boolean;
  isDeleted?: boolean;
  [key: string]: any;
};

const HomeScreen = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (!user?.uid) return;
    
    console.log('Ana sayfa ilaç listesi yükleniyor, kullanıcı ID:', user.uid);
    
    const loadMedicines = () => {
      const medRef = collection(firestore, 'users', user.uid, 'medicines');
      
      return onSnapshot(medRef, 
        snapshot => {
          const data = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
              id: doc.id,
              medicineName: d.medicineName || '',
              medicineType: d.medicineType || '',
              dose: d.dose || '',
              timesPerDay: d.timesPerDay || 1,
              times: d.times || [],
              isActive: typeof d.isActive === 'boolean' ? d.isActive : true,
              isDeleted: d.isDeleted === true,
              ...d,
            } as Medicine;
          });
          // Sadece aktif ve silinmemiş olanlar
          const filtered = data.filter(med => med.isActive && med.isDeleted !== true);
          console.log(`Ana sayfada ${filtered.length} aktif ilaç yüklendi`);
          setMedicines(filtered);
          setLoading(false);
        }, 
        (error) => {
          console.error('Ana sayfa ilaç listesi yüklenirken hata:', error);
          setLoading(false);
        }
      );
    };
    
    // İlaç listesini yükle
    const unsubscribe = loadMedicines();
    
    // Ekran odaklandığında verileri yenile
    const focusListener = navigation.addListener('focus', () => {
      console.log('HomeScreen odaklandı, veriler yenileniyor');
      setLoading(true);
      // Mevcut aboneliği iptal etmeye gerek yok, sadece yeni bir snapshot alıyoruz
      loadMedicines();
    });
    
    return () => {
      unsubscribe();
      focusListener();
    };
  }, [user, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'right', 'left', 'bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent]}
      >
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Merhaba, {user?.fullName || 'Kullanıcı'}</Text>
          <Text style={styles.subtitle}>İlaçlarınızı takip etmeye başlayın</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Bugünkü İlaçlarınız</Text>
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Yükleniyor...</Text>
            </View>
          ) : medicines.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Henüz planlanmış ilaç bulunmuyor. İlaçlarım bölümünden ilaçlarınızı ekleyebilirsiniz.
              </Text>
            </View>
          ) : (
            medicines.map((med) => (
              <View key={med.id} style={styles.medicineCard}>
                <Text style={styles.medicineName}>{med.medicineName}</Text>
                <Text style={styles.medicineDose}>Doz: {med.dose}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                  {Array.isArray(med.times) && med.times.map((t, i) => (
                    <View key={i} style={styles.timeBadge}>
                      <Text style={styles.timeBadgeText}>{new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <Text style={{ fontSize: 15, color: '#444', marginRight: 10 }}>İlacı Kullanıyorum</Text>
                  <Switch
                    value={med.isActive}
                    onValueChange={async (val: boolean) => {
                      if (!user?.uid) return;
                      const medDocRef = doc(firestore, 'users', user.uid, 'medicines', med.id);
                      await updateDoc(medDocRef, { isActive: val });
                    }}
                    thumbColor={med.isActive ? '#22c55e' : '#ccc'}
                    trackColor={{ false: '#ccc', true: '#bbf7d0' }}
                  />
                  <TouchableOpacity onPress={() => Alert.alert('Bilgi', 'Bu alan açıkken bildirim almaya devam edersiniz. İlacı kullanmayı bitirdiğinizde bu anahtarı pasif hale getirebilirsiniz.')}
                    style={{ marginLeft: 6, padding: 2 }}>
                    <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  medicineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#22c55e',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#047857',
  },
  medicineDose: {
    fontSize: 15,
    color: '#222',
    marginTop: 2,
    marginBottom: 4,
  },
  timeBadge: {
    backgroundColor: '#bbf7d0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 2,
    minWidth: 44,
    alignItems: 'center',
  },
  timeBadgeText: {
    color: '#047857',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: customTheme.spacing.l,
    paddingBottom: customTheme.spacing.xl,
  },
  greeting: {
    marginTop: 8, // Üstten biraz boşluk
    marginBottom: 12, // Alttan orta boşluk
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
