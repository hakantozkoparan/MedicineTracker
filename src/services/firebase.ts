import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { DeviceInfo, getDeviceInfo } from './device';

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyCSVJ-PmljNUI_EqlLGAKbZAP0qcjrYE14",
  authDomain: "medicine-tracker-18e8d.firebaseapp.com",
  projectId: "medicine-tracker-18e8d",
  storageBucket: "medicine-tracker-18e8d.firebasestorage.app",
  messagingSenderId: "843905118700",
  appId: "1:843905118700:web:3870986db3e7862c7790c9",
  measurementId: "G-0HN1MLE4FH"
};

// React Native için AsyncStorage adapter'ı
const reactNativePersistence = (firebase as any).auth.ReactNativeAsyncStorage;
if (reactNativePersistence) {
  reactNativePersistence.setAsyncStorage(AsyncStorage);
}

// Firebase'i başlat
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();

// React Native ortamında persistence ayarını kaldır
// auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

export const firestore = firebase.firestore();

// Firestore ayarları
firestore.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
  ignoreUndefinedProperties: true,
  merge: true
});

// Hata yakalama fonksiyonu
const handleFirestoreError = (error: any, operation: string) => {
  console.error(`Firebase ${operation} işlemi sırasında hata oluştu:`, error);
  // Geliştirme aşamasında hatayı fırlat, üretimde kullanıcıya dost bir mesaj göster
  if (__DEV__) {
    throw error;
  } else {
    throw new Error(`İşlem sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.`);
  }
};

// Authentication işlemleri
export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    
    // Cihaz bilgilerini al
    const deviceInfo = await getDeviceInfo();
    const now = new Date().toISOString();
    
    // Kullanıcı profili oluştur
    if (userCredential.user) {
      try {
        await firestore.collection('users').doc(userCredential.user.uid).set({
          fullName,
          email,
          role: 'member',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          isPremium: false,
          // Ek kullanıcı bilgileri
          lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
          devices: [{
            ...deviceInfo,
            lastUsedAt: now,
            isCurrentDevice: true,
            firstUsedAt: now
          }]
        });
      } catch (firestoreError) {
        // Firestore hatası durumunda kullanıcıyı silme
        console.error('Kullanıcı profili oluşturulurken hata:', firestoreError);
        // Kullanıcı kaydını silmeyi deneyebiliriz, ancak bu da başarısız olabilir
        try {
          await userCredential.user.delete();
        } catch (deleteError) {
          console.error('Kullanıcı silinirken hata:', deleteError);
        }
        handleFirestoreError(firestoreError, 'kayıt');
      }
    }
    
    return userCredential;
  } catch (error) {
    handleFirestoreError(error, 'kimlik doğrulama');
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // Cihaz bilgilerini al
    const deviceInfo = await getDeviceInfo();
    const now = new Date().toISOString();
    
    // Kullanıcı son giriş bilgisini güncelle
    if (userCredential.user) {
      try {
        const userRef = firestore.collection('users').doc(userCredential.user.uid);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          const devices = userData?.devices || [];
          
          // Cihazın daha önce kullanılıp kullanılmadığını kontrol et
          const deviceIndex = devices.findIndex(
            (device: DeviceInfo & { lastUsedAt: any }) => 
              device.deviceId === deviceInfo.deviceId
          );
          
          if (deviceIndex !== -1) {
            // Mevcut cihazı güncelle
            devices[deviceIndex] = {
              ...devices[deviceIndex],
              ...deviceInfo,
              lastUsedAt: now,
              isCurrentDevice: true
            };
          } else {
            // Yeni cihaz ekle
            devices.push({
              ...deviceInfo,
              lastUsedAt: now,
              isCurrentDevice: true,
              firstUsedAt: now
            });
          }
          
          // Kullanıcı dokümanını güncelle
          await userRef.update({
            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
            devices: devices
          });
        }
      } catch (firestoreError) {
        // Firestore hatası durumunda sadece loglama yap, giriş işlemine devam et
        console.error('Kullanıcı giriş bilgileri güncellenirken hata:', firestoreError);
      }
    }
    
    return userCredential;
  } catch (error) {
    handleFirestoreError(error, 'giriş');
  }
};

export const signOut = async () => {
  try {
    // Cihazın current device özelliğini false yap
    if (auth.currentUser) {
      try {
        const deviceInfo = await getDeviceInfo();
        const userRef = firestore.collection('users').doc(auth.currentUser.uid);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          const devices = userData?.devices || [];
          
          const updatedDevices = devices.map(
            (device: DeviceInfo & { lastUsedAt: any; isCurrentDevice: boolean }) => {
              if (device.deviceId === deviceInfo.deviceId) {
                return { ...device, isCurrentDevice: false };
              }
              return device;
            }
          );
          
          await userRef.update({ devices: updatedDevices });
        }
      } catch (firestoreError) {
        // Firestore hatası durumunda sadece loglama yap, çıkış işlemine devam et
        console.error('Cihaz durumu güncellenirken hata:', firestoreError);
      }
    }
    
    await auth.signOut();
  } catch (error) {
    handleFirestoreError(error, 'çıkış');
  }
};

export const resetPassword = async (email: string) => {
  try {
    await auth.sendPasswordResetEmail(email);
  } catch (error) {
    handleFirestoreError(error, 'şifre sıfırlama');
  }
};

export default firebase; 