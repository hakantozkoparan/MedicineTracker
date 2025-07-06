import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '../../../components/ThemedText';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ActiveSwitch from '../../components/common/ActiveSwitch';
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

// Bildirim izni iste
async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Belirli bir saat için local notification kur ve id döndür
async function scheduleMedicineNotification(medicineName: string, date: Date): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'İlaç Hatırlatıcı',
        body: `İlacı içmeyi unutma: ${medicineName}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: 'calendar',
        hour: date.getHours(),
        minute: date.getMinutes(),
        repeats: true,
      },
    });
    return id;
  } catch (e) {
    return null;
  }
}

// Bildirimleri topluca iptal et
async function cancelMedicineNotifications(notificationIds: string[]) {
  for (const id of notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (e) {}
  }
}

const AddMedicineScreen = () => {
  useEffect(() => {
    console.log('auth.currentUser (AddMedicineScreen render):', auth.currentUser);
  });
  const [medicineName, setMedicineName] = useState('');
  const [medicineType, setMedicineType] = useState('hap');
  const [dose, setDose] = useState('');
  const [isActive, setIsActive] = useState(true);
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
    if (!medicineType) {
      Alert.alert('Eksik Bilgi', 'Lütfen ilaç türünü seçin.');
      return;
    }
    if (!dose.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen doz bilgisini girin.');
      return;
    }
    if (!timesPerDay || timesPerDay < 1) {
      Alert.alert('Eksik Bilgi', 'Günde kaç kez alınacağını belirtin.');
      return;
    }
    if (!Array.isArray(times) || times.length !== timesPerDay || times.some(t => !(t instanceof Date) || isNaN(t.getTime()))) {
      Alert.alert('Eksik Bilgi', 'Tüm saatleri doğru şekilde seçin.');
      return;
    }
    if (typeof isActive !== 'boolean') {
      Alert.alert('Eksik Bilgi', 'Bildirim tercihini seçin.');
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
        isActive,
        createdAt: new Date().toISOString(),
      });
      // Başarılı
    // Bildirim izni al
    const permission = await requestNotificationPermission();
    let notificationIds: string[] = [];
    if (!permission) {
      Alert.alert(
        'Bildirim İzni Gerekli',
        'İlaç saatlerinde hatırlatma almak için uygulamaya bildirim izni vermelisiniz. Bildirim ayarlarından izin verebilirsiniz.'
      );
    } else if (isActive) {
      for (const t of times) {
        let notifDate = t instanceof Date ? t : new Date(t);
        const notifId = await scheduleMedicineNotification(medicineName, notifDate);
        if (notifId) notificationIds.push(notifId);
      }
    }
    // Firestore'a notificationIds'i kaydet
    await firestore
      .collection('users')
      .doc(user.uid)
      .collection('medicines')
      .where('medicineName', '==', medicineName.trim())
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get()
      .then(snapshot => {
        if (!snapshot.empty) {
          const docId = snapshot.docs[0].id;
          firestore.collection('users').doc(user.uid).collection('medicines').doc(docId).update({ notificationIds });
        }
      });
    // Eğer isActive false ise bildirimleri iptal et
    if (!isActive && notificationIds.length > 0) {
      await cancelMedicineNotifications(notificationIds);
    }
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
            <View style={[styles.pickerContainer, { flexDirection: 'column', alignItems: 'flex-start' }]}> 
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
                      backgroundColor: isSelected ? '#bbf7d0' : '#f0fdf4',
                      borderColor: isSelected ? '#22c55e' : '#ccc',
                      borderWidth: 1.5,
                      borderRadius: 8,
                      padding: 8,
                      marginRight: 8,
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}
                  >
                    <MaterialCommunityIcons name={iconName as any} size={20} color={isSelected ? '#22c55e' : '#aaa'} style={{ marginRight: 4 }} />
                    <ThemedText style={{ color: isSelected ? '#047857' : '#666', fontWeight: 'bold', fontSize: 15 }}>{type.label}</ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <ThemedText style={styles.label}>Doz</ThemedText>
  <TouchableOpacity onPress={() => Alert.alert('Doz Bilgisi', 'Aldığınız ilacın miktarını belirtiniz. Örneğin bir hapı yarım alıyorsanız 0.5, tam alıyorsanız 1, bir buçuk alıyorsanız 1.5 gibi yazabilirsiniz. Şurup veya sıvı ilaçlarda mililitre cinsinden de belirtebilirsiniz.')}
    style={{ marginLeft: 6, padding: 2 }}>
    <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.primary} />
  </TouchableOpacity>
</View>
<Input
  placeholder={DOSE_PLACEHOLDER}
  value={dose}
  onChangeText={setDose}
  keyboardType="numeric"
/>
            <View style={styles.pickerContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <ThemedText style={styles.label}>Günde Kaç Kez</ThemedText>
  <TouchableOpacity onPress={() => Alert.alert('Günde Kaç Kez?', 'Bu ilacı bir günde kaç kez aldığınızı belirtiniz. Örneğin sabah ve akşam alıyorsanız 2, sadece sabah alıyorsanız 1 yazabilirsiniz. Her doz için ayrı saat seçebilirsiniz.')}
    style={{ marginLeft: 6, padding: 2 }}>
    <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.primary} />
  </TouchableOpacity>
</View>
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <ThemedText style={styles.label}>Saatler</ThemedText>
  <TouchableOpacity onPress={() => Alert.alert('Saatler', 'İlacı her aldığınız zamanı ekleyin. Örneğin sabah 08:00 ve akşam 20:00 gibi. Her doz için uygun saatleri seçerek hatırlatıcılarınızı kişiselleştirebilirsiniz.')}
    style={{ marginLeft: 6, padding: 2 }}>
    <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.primary} />
  </TouchableOpacity>
</View>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <ActiveSwitch
              value={isActive}
              onValueChange={setIsActive}
              label="İlacı Kullanıyorum"
            />
            <TouchableOpacity onPress={() => Alert.alert('Bilgi', 'Bu alan açıkken bildirim almaya devam edersiniz. İlacı kullanmayı bitirdiğinizde bu anahtarı pasif hale getirebilirsiniz.')}
              style={{ marginLeft: 6, padding: 2 }}>
              <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
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
