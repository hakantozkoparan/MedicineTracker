import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../../components/ThemedText';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Logo from '../../components/common/Logo';
import { signUp } from '../../services/firebase';
import { customTheme, theme } from '../../styles/theme';

// AsyncStorage için key tanımı
const USER_CREDENTIALS_KEY = '@MedicineTracker:user_credentials';

// Kullanıcı kimlik bilgilerini AsyncStorage'a kaydet (sadece geliştirme ortamı için)
const saveCredentialsToStorage = async (email: string, password: string) => {
  try {
    if (__DEV__) {
      await AsyncStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify({ email, password }));
      console.log('Kullanıcı kimlik bilgileri AsyncStorage\'a kaydedildi (sadece geliştirme ortamı için)');
    }
  } catch (error) {
    console.error('AsyncStorage kimlik bilgileri kayıt hatası:', error);
  }
};

const RegisterScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigation = useNavigation();
  
  const handleRegister = async () => {
    // Basit doğrulama
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await signUp(email, password, fullName);
      
      // Expo Go için kimlik bilgilerini kaydet (sadece geliştirme ortamında)
      if (__DEV__) {
        await saveCredentialsToStorage(email, password);
      }
      
      // Başarılı kayıt - Firebase servisi tarafından yönlendirme yapılacak
    } catch (err: any) {
      // Hata mesajını kullanıcı dostu hale getir
      let errorMessage = 'Kayıt sırasında bir hata oluştu';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta adresi zaten kullanılıyor';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Şifre çok zayıf. Daha güçlü bir şifre belirleyin';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'İnternet bağlantınızı kontrol edin';
      }
      
      setError(errorMessage);
      console.error('Kayıt hatası:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Logo />
        </View>
        
        <View style={styles.formContainer}>
          <ThemedText style={styles.title}>Kayıt Ol</ThemedText>
          
          {error && (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}
          
          <Input
            placeholder="Ad Soyad"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
          
          <Input
            placeholder="E-posta"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input
            placeholder="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <Input
            placeholder="Şifre Tekrar"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          <Button 
            title={loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
            onPress={handleRegister}
            disabled={loading}
            style={styles.registerButton}
          />
          
          {loading && <ActivityIndicator color={theme.colors.primary} style={styles.loader} />}
          
          <View style={styles.loginContainer}>
            <ThemedText>Zaten bir hesabınız var mı? </ThemedText>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <ThemedText style={styles.loginText}>Giriş Yap</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: customTheme.fontFamily.bold,
    color: theme.colors.primary,
    lineHeight: 36,
    marginBottom: 28,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: 20,
  },
  loader: {
    marginTop: 10,
    alignSelf: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '20', // %20 opacity
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },
});

export default RegisterScreen; 