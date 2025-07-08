import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../../../components/ThemedText';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Logo from '../../components/common/Logo';
import { signIn } from '../../services/firebase';
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

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Lütfen e-posta ve şifrenizi girin');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await signIn(email, password);
      
      // Expo Go için kimlik bilgilerini kaydet (sadece geliştirme ortamında)
      if (__DEV__) {
        await saveCredentialsToStorage(email, password);
      }
      
      // Başarılı giriş - AuthContext tarafından yönlendirme yapılacak
    } catch (err: any) {
      // Hata mesajını kullanıcı dostu hale getir
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Hatalı şifre girdiniz';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'İnternet bağlantınızı kontrol edin';
      }
      
      setError(errorMessage);
      console.error('Giriş hatası:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.container, 
            { paddingTop: Math.max(insets.top + 20, 40) }
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Logo />
          </View>
          
          <View style={styles.formContainer}>
            <ThemedText style={styles.title}>Giriş Yap</ThemedText>
            
            {error && (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            )}
            
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
            
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword' as never)}
            >
              <ThemedText style={styles.forgotPasswordText}>
                Şifremi Unuttum
              </ThemedText>
            </TouchableOpacity>
            
            <Button 
              title={loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginButton}
            />
            
            {loading && <ActivityIndicator color={theme.colors.primary} style={styles.loader} />}
            
            <View style={styles.registerContainer}>
              <ThemedText>Hesabınız yok mu? </ThemedText>
              <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
                <ThemedText style={styles.registerText}>Kayıt Ol</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
  },
  loginButton: {
    marginTop: 10,
  },
  loader: {
    marginTop: 10,
    alignSelf: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
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

export default LoginScreen; 