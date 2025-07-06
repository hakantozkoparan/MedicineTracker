import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { DeviceInfo } from '../services/device';
import { auth, firestore } from '../services/firebase';
import { initPurchases, logOutPurchases } from '../services/purchases';

// AsyncStorage için key tanımları
const USER_AUTH_KEY = '@MedicineTracker:user_auth';

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
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUserData: async () => {},
  updateUserProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Kullanıcı verilerini AsyncStorage'a kaydet
  const saveUserToStorage = async (userData: User | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem(USER_AUTH_KEY, JSON.stringify(userData));
        console.log('Kullanıcı AsyncStorage\'a kaydedildi');
      } else {
        await AsyncStorage.removeItem(USER_AUTH_KEY);
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
      const userDoc = await firestore.collection('users').doc(uid).get();
      
      if (userDoc.exists) {
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

  // Kullanıcı profilini güncelle
  const updateUserProfile = async (data: Partial<User>) => {
    if (!auth.currentUser || !user) return;
    
    try {
      const userRef = firestore.collection('users').doc(auth.currentUser.uid);
      
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
      await userRef.update(updateData);
      
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
        // Önce AsyncStorage'dan kullanıcı bilgilerini kontrol et
        const storedUser = await loadUserFromStorage();
        
        // AsyncStorage'dan kullanıcı bulunsa bile, sadece Firebase Auth ile login olan kullanıcıya güven!
        if (auth.currentUser) {
          // Firestore'dan güncel kullanıcı bilgilerini al
          const userData = await fetchUserData(auth.currentUser.uid);
          if (userData) {
            setUser(userData);
            await saveUserToStorage(userData);
            await initPurchases(auth.currentUser.uid);
          }
        } else {
          setUser(null);
          console.log('Kullanıcı oturumu kapalı, login ekranına yönlendirilecek');
        }
        
        // Firebase auth state'i dinle
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
          try {
            console.log('Auth state değişti:', authUser ? 'Kullanıcı var' : 'Kullanıcı yok');
            
            if (authUser) {
              // Firestore'dan güncel kullanıcı bilgilerini al
              const userData = await fetchUserData(authUser.uid);
              
              if (userData) {
                setUser(userData);
                
                // RevenueCat'i başlat
                await initPurchases(authUser.uid);
              }
            } else {
              // Kullanıcı oturumu kapatmışsa, AsyncStorage'dan kontrol et
              const storedUser = await loadUserFromStorage();
              
              if (storedUser) {
                console.log('Firebase oturumu yok ama AsyncStorage\'da kullanıcı var');
                setUser(storedUser);
              } else {
                // Hem Firebase hem de AsyncStorage'da kullanıcı yoksa
                console.log('Kullanıcı oturumu kapatıldı');
                setUser(null);
              }
            }
          } catch (error) {
            console.error('Kimlik doğrulama durumu değişikliği işlenirken hata oluştu:', error);
          } finally {
            setLoading(false);
          }
        });
        
        return () => unsubscribe();
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
    signOut: handleSignOut,
    refreshUserData,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 