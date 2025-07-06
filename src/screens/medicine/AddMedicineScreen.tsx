import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '../../../components/ThemedText';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { auth, firestore } from '../../services/firebase';
import { customTheme, theme } from '../../styles/theme';

const MEDICINE_TYPES = [
  { label: 'Hap', value: 'hap' },
  { label: 'İğne', value: 'igne' },
  { label: 'Şurup', value: 'surup' },
  { label: 'Diğer', value: 'diger' },
];

const DOSE_PLACEHOLDER = 'Örn: 1.5, 2, 0.5';

const AddMedicineScreen = () => {
  useEffect(() => {
    console.log('auth.currentUser (AddMedicineScreen render):', auth.currentUser);
  });
  const [medicineName, setMedicineName] = useState('');
  const [medicineType, setMedicineType] = useState('hap');
  const [dose, setDose] = useState('');
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [times, setTimes] = useState([new Date()]);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [activeTimeIndex, setActiveTimeIndex] = useState<number | null>(null);

  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const handleTimesPerDayChange = (value: number) => {
    setTimesPerDay(value);
    // Saat dizisini yeni sayıya göre güncelle
    setTimes((prev) => {
      const arr = [...prev];
      if (arr.length < value) {
        // Eksikse yeni Date() ekle
        return arr.concat(Array(value - arr.length).fill(new Date()));
      } else {
        // Fazlaysa kırp
        return arr.slice(0, value);
      }
    });
  };

  const handleShowTimePicker = (index: number) => {
    setActiveTimeIndex(index);
    setDatePickerVisible(true);
  };

  const handleConfirmTime = (selectedDate: Date) => {
    if (activeTimeIndex !== null) {
      setTimes(prev => {
        const arr = [...prev];
        arr[activeTimeIndex] = selectedDate;
        return arr;
      });
    }
    setDatePickerVisible(false);
    setActiveTimeIndex(null);
  };

  const handleCancelTime = () => {
    setDatePickerVisible(false);
    setActiveTimeIndex(null);
  };

  const handleSave = async () => {
    console.log('user:', user);
    console.log('auth.currentUser:', auth.currentUser);
    if (!medicineName.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen ilaç adını girin.');
      return;
    }
    if (!user?.uid) {
      Alert.alert('Kullanıcı bulunamadı', 'Lütfen tekrar giriş yapın.');
      return;
    }
    try {
      console.log('Firestore kayıt:', { uid: user.uid, medicineName });
      await firestore.collection('users').doc(user.uid).collection('medicines').add({
        medicineName: medicineName.trim(),
        medicineType,
        dose,
        timesPerDay,
        times: times.map(t => t instanceof Date ? t.toISOString() : t),
        createdAt: new Date().toISOString(),
      });
      // Başarılı
      Alert.alert('Başarılı', 'İlaç başarıyla kaydedildi!');
      // Reset
      setMedicineName('');
      // Anasayfaya (İlaçlarım sekmesine) dön
      navigation.goBack();
    } catch (err) {
      console.log('Firestore hata:', err);
      Alert.alert('Hata', 'İlaç kaydedilirken bir sorun oluştu.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.container, { paddingTop: 0, paddingBottom: 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginTop: customTheme.spacing.xl }}>
            <Input
              label="İlaç Adı"
              placeholder="Parol, Vermidon..."
              value={medicineName}
              onChangeText={setMedicineName}
            />
            <View style={[styles.pickerContainer, {flexDirection: 'column', alignItems: 'flex-start'}]}>
              <ThemedText style={styles.label}>İlaç Türü</ThemedText>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {MEDICINE_TYPES.map((type) => {
                  let iconName = 'pill';
                  if (type.value === 'igne') iconName = 'needle';
                  if (type.value === 'surup') iconName = 'bottle-soda';
                  if (type.value === 'diger') iconName = 'dots-horizontal-circle';
                  const isSelected = medicineType === type.value;
                  return (
                    <TouchableOpacity
                      key={type.value}
                      onPress={() => setMedicineType(type.value)}
                      style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                        padding: 10,
                        borderRadius: 12,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                        minWidth: 64,
                        minHeight: 64,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={iconName as any}
                        size={28}
                        color={isSelected ? '#fff' : theme.colors.primary}
                      />
                      <ThemedText style={{ color: isSelected ? '#fff' : theme.colors.primary, fontWeight: isSelected ? 'bold' : 'normal', marginTop: 6 }}>
                        {type.label}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <Input
              label="Doz"
              placeholder={DOSE_PLACEHOLDER}
              value={dose}
              onChangeText={setDose}
              keyboardType="numeric"
            />
            <View style={styles.pickerContainer}>
              <ThemedText style={styles.label}>Günde Kaç Kez</ThemedText>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {[1,2,3,4,5,6].map((v) => {
                  const isSelected = timesPerDay === v;
                  return (
                    <TouchableOpacity
                      key={v}
                      onPress={() => handleTimesPerDayChange(v)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        marginRight: 8,
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        minWidth: 36,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ThemedText style={{ color: isSelected ? '#fff' : theme.colors.primary, fontWeight: isSelected ? 'bold' : 'normal', fontSize: 18 }}>{v}</ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <ThemedText style={styles.label}>Saatler</ThemedText>
            {times.map((time, idx) => (
              <View key={idx} style={[styles.timeRow, { alignItems: 'center', marginBottom: 10 }]}>  
                <ThemedText style={{ fontSize: 16, minWidth: 110, color: theme.colors.text }}>{`${idx + 1}. Doz Saati`}</ThemedText>
                <TouchableOpacity
                  onPress={() => handleShowTimePicker(idx)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 22,
                    borderRadius: 10,
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.primary,
                    borderWidth: 1.5,
                    marginLeft: 8,
                  }}
                >
                  <MaterialCommunityIcons name="clock-outline" size={22} color={theme.colors.primary} style={{ marginRight: 6 }} />
                  <ThemedText style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 17 }}>
                    {time instanceof Date ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="time"
            date={activeTimeIndex !== null ? times[activeTimeIndex] : new Date()}
            onConfirm={handleConfirmTime}
            onCancel={handleCancelTime}
            is24Hour
            confirmTextIOS="Onayla"
            pickerContainerStyleIOS={{ alignItems: 'center', justifyContent: 'center' }}
            customHeaderIOS={() => <View style={{ height: 16 }} />}
          />
          <Button
            title="Kaydet"
            onPress={handleSave}
            mode="primary"
            style={{ marginBottom: customTheme.spacing.xl }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: customTheme.spacing.l,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: customTheme.fontFamily.bold,
    color: theme.colors.primary,
    marginBottom: customTheme.spacing.l,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    marginTop: customTheme.spacing.s,
  },
  pickerContainer: {
    marginBottom: customTheme.spacing.m,
  },
  // pickerWrapper ve picker artık kullanılmıyor, buton grubu ile değiştirildi.

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: customTheme.spacing.s,
  },
  timeText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 8,
    minWidth: 64,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: customTheme.spacing.l,
  },
});

export default AddMedicineScreen;
