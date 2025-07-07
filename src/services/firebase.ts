
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import {
  getFirestore,
  setDoc,
  getDoc,
  updateDoc,
  doc,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
  addDoc
} from 'firebase/firestore';
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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);


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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Cihaz bilgilerini al
    const deviceInfo = await getDeviceInfo();
    const now = new Date().toISOString();
    
    // Kullanıcı profili oluştur
    if (userCredential.user) {
      try {
        await setDoc(doc(firestore, 'users', userCredential.user.uid), {
          fullName,
          email,
          role: 'member',
          createdAt: serverTimestamp(),
          isPremium: false,
          lastLoginAt: serverTimestamp(),
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Cihaz bilgilerini al
    const deviceInfo = await getDeviceInfo();
    const now = new Date().toISOString();
    
    // Kullanıcı son giriş bilgisini güncelle
    if (userCredential.user) {
      try {
        const userRef = doc(firestore, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          let devices = userData?.devices || [];
          
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
          await updateDoc(userRef, {
            lastLoginAt: serverTimestamp(),
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
        const userRef = doc(firestore, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
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
          
          await updateDoc(userRef, { devices: updatedDevices });
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
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    handleFirestoreError(error, 'şifre sıfırlama');
  }
};