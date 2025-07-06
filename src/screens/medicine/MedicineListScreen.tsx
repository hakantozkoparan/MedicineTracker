import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { firestore } from '../../services/firebase';

const MedicineListScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = firestore
      .collection('users')
      .doc(user.uid)
      .collection('medicines')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMedicines(data);
          setLoading(false);
        },
        (error) => {
          setLoading(false);
        }
      );
    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.containerBg}>
        {medicines.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ fontSize: 18, color: '#888' }}>Henüz hiç ilaç eklemediniz.</Text>
          </View>
        ) : (
          <FlatList
            data={medicines}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 18, paddingTop: 10, paddingBottom: 44 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  {(() => {
                    let typeIcon, typeIconColor = '#22c55e';
                    switch ((item.medicineType || '').toLowerCase()) {
                      case 'hap':
                        typeIcon = <MaterialCommunityIcons name="pill" size={26} color={typeIconColor} style={{ marginRight: 10 }} />;
                        break;
                      case 'surup':
                        typeIcon = <MaterialCommunityIcons name="bottle-soda" size={26} color={typeIconColor} style={{ marginRight: 10 }} />;
                        break;
                      case 'igne':
                        typeIcon = <MaterialCommunityIcons name="needle" size={26} color={typeIconColor} style={{ marginRight: 10 }} />;
                        break;
                      default:
                        typeIcon = <Ionicons name="medkit" size={26} color={typeIconColor} style={{ marginRight: 10 }} />;
                    }
                    return typeIcon;
                  })()}
                  <Text style={styles.title}>{item.medicineName}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Ionicons name="cube-outline" size={18} color="#22c55e" style={{ marginRight: 6 }} />
                  <Text style={styles.label}>Tip:</Text>
                  <Text style={styles.value}>{item.medicineType ? item.medicineType.charAt(0).toUpperCase() + item.medicineType.slice(1) : ''}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Ionicons name="water-outline" size={18} color="#22c55e" style={{ marginRight: 6 }} />
                  <Text style={styles.label}>Doz:</Text>
                  <Text style={styles.value}>{item.dose}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Ionicons name="repeat-outline" size={18} color="#22c55e" style={{ marginRight: 6 }} />
                  <Text style={styles.label}>Günde:</Text>
                  <Text style={styles.value}>{item.timesPerDay} kez</Text>
                </View>
                <View style={[styles.cardRow, { alignItems: 'flex-start' }]}> 
                  <Ionicons name="time-outline" size={18} color="#22c55e" style={{ marginRight: 6, marginTop: 2 }} />
                  <Text style={styles.label}>Saatler:</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1 }}>
                    {Array.isArray(item.times) && item.times.map((t: string, i: number) => (
                      <View key={i} style={styles.timeBadge}>
                        <Text style={styles.timeBadgeText}>{new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
          />
        )}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddMedicine')}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0fdf4', // Açık yeşil arka plan
  },
  containerBg: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#22c55e', // Yeşil FAB
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#22c55e',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1.3,
    borderColor: '#bbf7d0', // Açık yeşil kenar
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginLeft: 2,
  },
  label: {
    color: '#666',
    fontWeight: '600',
    marginRight: 4,
    fontSize: 15,
  },
  value: {
    color: '#222',
    fontSize: 15,
    fontWeight: '500',
    marginRight: 10,
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#047857', // Koyu yeşil
  },
  timeBadge: {
    backgroundColor: '#bbf7d0', // Açık yeşil badge
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 2,
    marginTop: 2,
    minWidth: 44,
    alignItems: 'center',
  },
  timeBadgeText: {
    color: '#047857', // Koyu yeşil
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
});

export default MedicineListScreen;
