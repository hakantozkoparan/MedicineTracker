import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '../../../components/ThemedText';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ActiveSwitch from '../../components/common/ActiveSwitch';
import { useAuth } from '../../context/AuthContext';
import { firestore } from '../../services/firebase';
import { customTheme, theme } from '../../styles/theme';

const MEDICINE_TYPES = [
  { label: 'Hap', value: 'hap' },
  { label: 'İğne', value: 'igne' },
  { label: 'Şurup', value: 'surup' },
  { label: 'Diğer', value: 'diger' },
];

const EditMedicineScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { medicine } = route.params;

  const [medicineName, setMedicineName] = useState(medicine.medicineName || '');
  const [medicineType, setMedicineType] = useState(medicine.medicineType || 'hap');
  const [dose, setDose] = useState(medicine.dose || '');
  const [isActive, setIsActive] = useState(typeof medicine.isActive === 'boolean' ? medicine.isActive : true);
  const [timesPerDay, setTimesPerDay] = useState(medicine.timesPerDay || 1);
  const [times, setTimes] = useState(
    Array.isArray(medicine.times)
      ? medicine.times.map((t: any) => {
          if (typeof t === 'string' || typeof t === 'number') return new Date(t);
          if (t instanceof Date) return t;
          return new Date();
        })
      : [new Date()]
  );
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [activeTimeIndex, setActiveTimeIndex] = useState<number | null>(null);

  const handleTimesPerDayChange = (value: number) => {
    setTimesPerDay(value);
    setTimes((prev: any[]) => {
      const arr = [...prev];
      if (arr.length < value) {
        return arr.concat(Array(value - arr.length).fill(new Date()));
      } else {
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
      setTimes((prev: any[]) => {
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
      await firestore
        .collection('users')
        .doc(user.uid)
        .collection('medicines')
        .doc(medicine.id)
        .update({
          medicineName: medicineName.trim(),
          medicineType,
          dose,
          timesPerDay,
          times: times.map(t => t instanceof Date ? t.toISOString() : t),
          isActive,
        });
      Alert.alert('Başarılı', 'İlaç başarıyla güncellendi!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', 'İlaç güncellenirken bir sorun oluştu.');
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
          contentContainerStyle={{ padding: 18, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          
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
            placeholder="Örn: 1.5, 2, 0.5"
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
                      backgroundColor: isSelected ? '#bbf7d0' : '#f0fdf4',
                      borderColor: isSelected ? '#22c55e' : '#ccc',
                      borderWidth: 1.5,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      marginRight: 8,
                      alignItems: 'center',
                    }}
                  >
                    <ThemedText style={{ color: isSelected ? '#047857' : '#666', fontWeight: 'bold', fontSize: 15 }}>{v}</ThemedText>
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
          {times.map((time: any, idx: number) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <ThemedText style={{ fontSize: 16, minWidth: 110, color: theme.colors.text }}>{`${idx + 1}. Doz Saati`}</ThemedText>
              <TouchableOpacity onPress={() => handleShowTimePicker(idx)} style={{ marginLeft: 10 }}>
                <View style={{ backgroundColor: '#bbf7d0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <ThemedText style={{ color: '#047857', fontWeight: 'bold', fontSize: 16 }}>
                    {time instanceof Date ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          ))} 
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="time"
            date={activeTimeIndex !== null ? times[activeTimeIndex] : new Date()}
            onConfirm={handleConfirmTime}
            onCancel={handleCancelTime}
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
});

export default EditMedicineScreen;
