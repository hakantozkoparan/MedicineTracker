import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../../components/ThemedText';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Logo from '../../components/common/Logo';
import { resetPassword } from '../../services/firebase';
import { theme } from '../../styles/theme';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const navigation = useNavigation();
  
  const handleResetPassword = async () => {
    if (!email) {
      setError('Lütfen e-posta adresinizi girin');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await resetPassword(email);
      setSuccess('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.');
      setEmail(''); // Formu temizle
    } catch (err: any) {
      // Hata mesajını kullanıcı dostu hale getir
      let errorMessage = 'Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'İnternet bağlantınızı kontrol edin';
      }
      
      setError(errorMessage);
      console.error('Şifre sıfırlama hatası:', err);
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
          <ThemedText style={styles.title}>Şifremi Unuttum</ThemedText>
          <ThemedText style={styles.subtitle}>
            Şifre sıfırlama bağlantısı için e-posta adresinizi girin
          </ThemedText>
          
          {error && (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}
          
          {success && (
            <View style={styles.successContainer}>
              <ThemedText style={styles.successText}>{success}</ThemedText>
            </View>
          )}
          
          <Input
            placeholder="E-posta"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Button 
            title={loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
            onPress={handleResetPassword}
            disabled={loading}
            style={styles.resetButton}
          />
          
          {loading && <ActivityIndicator color={theme.colors.primary} style={styles.loader} />}
          
          <TouchableOpacity 
            style={styles.backToLogin}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <ThemedText style={styles.backToLoginText}>
              Giriş sayfasına dön
            </ThemedText>
          </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  resetButton: {
    marginTop: 20,
  },
  loader: {
    marginTop: 10,
    alignSelf: 'center',
  },
  backToLogin: {
    marginTop: 20,
    alignSelf: 'center',
  },
  backToLoginText: {
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
  successContainer: {
    backgroundColor: theme.colors.success + '20', // %20 opacity
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  successText: {
    color: theme.colors.success,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen; 