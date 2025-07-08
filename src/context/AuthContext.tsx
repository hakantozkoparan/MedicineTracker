import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { DeviceInfo, getDeviceInfo } from '../services/device';
import { auth, firestore } from '../services/firebase';
import { initPurchases, logOutPurchases } from '../services/purchases';

// AsyncStorage için key tanımları
const USER_AUTH_KEY = '@MedicineTracker:user_auth';
const SECURE_EMAIL_KEY = 'MedicineTracker_secure_email';
const SECURE_PASSWORD_KEY = 'MedicineTracker_secure_password';

interface UserDevice extends DeviceInfo {
  lastUsedAt: any;
  isCurrentDevice: boolean;
  firstUsedAt?: any;
}

interface User {
  uid: string;
  email: string | null;
  fullName: string | null;
  isPremium: boolean;
  role?: string;
  createdAt?: any;
  lastLoginAt?: any;
  devices?: UserDevice[];
  phoneNumber?: string | null;
  photoURL?: string | null;
  preferences?: {
    notificationsEnabled?: boolean;
    reminderSound?: string;
    darkMode?: boolean;
    language?: string;
  };
  medicalInfo?: {
    allergies?: string[];
    conditions?: string[];
    bloodType?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshUserData: async () => {},
  updateUserProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Kullanıcı kimlik bilgilerini SecureStore'a kaydet (her ortam için)
  const saveCredentialsToStorage = async (email: string, password: string) => {
    try {
      await SecureStore.setItemAsync(SECURE_EMAIL_KEY, email);
      await SecureStore.setItemAsync(SECURE_PASSWORD_KEY, password);
    } catch (error) {
      console.error('Kimlik bilgileri kayıt hatası:', error);
    }
  };

  // Kullanıcı kimlik bilgilerini SecureStore'dan al (her ortam için)
  const loadCredentialsFromStorage = async () => {
    try {
      const email = await SecureStore.getItemAsync(SECURE_EMAIL_KEY);
      const password = await SecureStore.getItemAsync(SECURE_PASSWORD_KEY);
      if (email && password) {
        return { email, password };
      }
      return null;
    } catch (error) {
      console.error('Kimlik bilgileri okuma hatası:', error);
      return null;
    }
  };

  // Kullanıcı verilerini AsyncStorage'a kaydet
  const saveUserToStorage = async (userData: User | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem(USER_AUTH_KEY, JSON.stringify(userData));
        console.log('Kullanıcı AsyncStorage\'a kaydedildi');
      } else {
        await AsyncStorage.removeItem(USER_AUTH_KEY);
        // Kimlik bilgilerini SecureStore'dan da temizleyebiliriz, ancak genellikle çıkışta buna gerek kalmaz,
        // yeni girişte üzerine yazılır. Güvenlik nedeniyle temizlemek isterseniz:
        // await SecureStore.deleteItemAsync(SECURE_EMAIL_KEY);
        // await SecureStore.deleteItemAsync(SECURE_PASSWORD_KEY);
        console.log('Kullanıcı AsyncStorage\'dan silindi');
      }
    } catch (error) {
      console.error('AsyncStorage kayıt hatası:', error);
    }
  };

  // Kullanıcı verilerini AsyncStorage'dan al
  const loadUserFromStorage = async () => {
    try {
      const userDataString = await AsyncStorage.getItem(USER_AUTH_KEY);
      if (userDataString) {
        console.log('Kullanıcı AsyncStorage\'dan yüklendi');
        const userData = JSON.parse(userDataString);
        return userData as User;
      }
      console.log('AsyncStorage\'da kullanıcı bulunamadı');
      return null;
    } catch (error) {
      console.error('AsyncStorage okuma hatası:', error);
      return null;
    }
  };

  // Kullanıcı verilerini Firestore'dan al
  const fetchUserData = async (uid: string) => {
    try {
      console.log('Firestore\'dan kullanıcı verileri alınıyor...');
      const userRef = doc(firestore, 'users', uid);
const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Partial<User>;
        const user = {
          uid,
          email: auth.currentUser?.email || null,
          fullName: userData?.fullName || null,
          isPremium: userData?.isPremium || false,
          role: userData?.role || 'member',
          createdAt: userData?.createdAt,
          lastLoginAt: userData?.lastLoginAt,
          devices: userData?.devices || [],
          phoneNumber: userData?.phoneNumber || null,
          photoURL: userData?.photoURL || null,
          preferences: userData?.preferences || {
            notificationsEnabled: true,
            reminderSound: 'default',
            darkMode: false,
            language: 'tr',
          },
          medicalInfo: userData?.medicalInfo || {
            allergies: [],
            conditions: [],
            bloodType: '',
            emergencyContact: {
              name: '',
              phone: '',
              relationship: '',
            },
          },
        };
        
        // Kullanıcı verilerini AsyncStorage'a kaydet
        await saveUserToStorage(user);
        console.log('Kullanıcı verileri Firestore\'dan alındı ve kaydedildi');
        
        return user;
      }
      
      console.log('Firestore\'da kullanıcı bulunamadı');
      return null;
    } catch (error) {
      console.error('Kullanıcı verileri alınırken hata oluştu:', error);
      return null;
    }
  };

  // Kullanıcı verilerini yenile
  const refreshUserData = async () => {
    if (auth.currentUser) {
      const userData = await fetchUserData(auth.currentUser.uid);
      if (userData) {
        setUser(userData);
      }
    }
  };

  // Yeni Giriş Fonksiyonu
  const handleSignIn = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await saveCredentialsToStorage(email, password);
      // onAuthStateChanged tetiklenecek ve kullanıcı verilerini alacak
    } catch (error) {
      console.error('Giriş hatası (AuthContext):', error);
      throw error; // Hatanın UI'da gösterilmesi için tekrar fırlat
    }
  };

  // Yeni Kayıt Fonksiyonu
  const handleSignUp = async (email: string, password: string, fullName: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // Firestore'da kullanıcı belgesi oluştur
      const userRef = doc(firestore, 'users', user.uid);
      const deviceInfo = await getDeviceInfo();

      const newUser: User = {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        isPremium: false,
        role: 'member',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        devices: [{ ...deviceInfo, lastUsedAt: new Date(), isCurrentDevice: true, firstUsedAt: new Date() }],
        preferences: {
          notificationsEnabled: true,
          reminderSound: 'default',
          darkMode: false,
          language: 'tr',
        },
        medicalInfo: {
          allergies: [],
          conditions: [],
          bloodType: '',
          emergencyContact: { name: '', phone: '', relationship: '' },
        },
      };

      await setDoc(userRef, newUser);
      await saveCredentialsToStorage(email, password);
      
      setUser(newUser); // State'i hemen güncelle
      await saveUserToStorage(newUser); // AsyncStorage'a kaydet

    } catch (error) {
      console.error('Kayıt hatası (AuthContext):', error);
      throw error; // Hatanın UI'da gösterilmesi için tekrar fırlat
    }
  };

  // Kullanıcı profilini güncelle
  const updateUserProfile = async (data: Partial<User>) => {
    if (!auth.currentUser || !user) return;
    
    try {
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      
      // Güncellenecek alanları hazırla
      const updateData: Partial<User> = {};
      
      // Temel alanlar
      if (data.fullName !== undefined) updateData.fullName = data.fullName;
      if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
      if (data.photoURL !== undefined) updateData.photoURL = data.photoURL;
      
      // Tercihler
      if (data.preferences) {
        updateData.preferences = {
          ...user.preferences,
          ...data.preferences,
        };
      }
      
      // Tıbbi bilgiler
      if (data.medicalInfo) {
        updateData.medicalInfo = {
          ...user.medicalInfo,
          ...data.medicalInfo,
        };
      }
      
      // Firestore'da güncelle
      await updateDoc(userRef, updateData);
      
      // Lokal state'i güncelle
      const updatedUser = { ...user, ...updateData };
      setUser(updatedUser);
      
      // AsyncStorage'ı güncelle
      await saveUserToStorage(updatedUser);
    } catch (error) {
      console.error('Kullanıcı profili güncellenirken hata oluştu:', error);
      throw error;
    }
  };

  // Oturumu kapat
  const handleSignOut = async () => {
    try {
      await logOutPurchases();
      await saveUserToStorage(null); // AsyncStorage'dan kullanıcı bilgilerini sil
      await SecureStore.deleteItemAsync(SECURE_EMAIL_KEY);
      await SecureStore.deleteItemAsync(SECURE_PASSWORD_KEY);
      await auth.signOut();
      setUser(null); // Kullanıcıyı state'den de kaldır
    } catch (error) {
      console.error('Oturum kapatılırken hata oluştu:', error);
    }
  };

  // Kimlik doğrulama durumu değişikliklerini dinle
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Auth başlatılıyor...');
        setLoading(true);

        // Firebase oturumu yoksa, cihazda saklanan email/şifre ile tekrar giriş yapmayı dene
        const credentials = await loadCredentialsFromStorage();
        if (credentials && credentials.email && credentials.password) {
          try {
            console.log('Kaydedilmiş kimlik bilgileriyle yeniden giriş yapılıyor...');
            await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            console.log('Otomatik giriş başarılı.');
            // onAuthStateChanged geri kalanı halledecek
          } catch (err) {
            console.log('Otomatik giriş başarısız, muhtemelen şifre değişmiş:', err);
            // Kimlik bilgileri artık geçerli değilse temizle
            await handleSignOut();
          }
        }
        
        // Firebase auth state'i dinle
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
          try {
            console.log('Auth state değişti:', authUser ? `Kullanıcı var: ${authUser.uid}` : 'Kullanıcı yok');
            
            if (authUser) {
              // Firestore'dan güncel kullanıcı bilgilerini al
              const userData = await fetchUserData(authUser.uid);
              
              if (userData) {
                setUser(userData);
                await saveUserToStorage(userData); // Oturum açıldığında da kaydet
                
                // RevenueCat'i başlat
                await initPurchases(authUser.uid);
              } else {
                // Firebase'de kullanıcı var ama Firestore'da yoksa (kayıt tamamlanmamış olabilir)
                // Bu durumda oturumu kapatıp kullanıcıyı temizlemek en güvenlisi
                 console.log('Firebase kullanıcısı var ama Firestore verisi yok. Oturum kapatılıyor.');
                 await handleSignOut();
              }
            } else {
              // Kullanıcı oturumu kapatmışsa, state'i ve storage'ı temizle
              setUser(null);
              await saveUserToStorage(null);
              console.log('Kullanıcı oturumu kapatıldı');
            }
          } catch (error) {
            console.error('Kimlik doğrulama durumu değişikliği işlenirken hata oluştu:', error);
          } finally {
            setLoading(false);
          }
        });
        
        return () => {
          console.log('Auth listener temizleniyor.');
          unsubscribe();
        };
      } catch (error) {
        console.error('Kimlik doğrulama başlatılırken hata oluştu:', error);
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const value = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshUserData,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 