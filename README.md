# MedicineTracker 💊

MedicineTracker, kullanıcıların ilaçlarını takip etmelerine, hatırlatıcı bildirimler almalarına ve sağlık bilgilerini yönetmelerine olanak tanıyan, bulut tabanlı modern bir mobil uygulamadır.

## 🚀 Başlıca Özellikler

- 🔐 Firebase Authentication ile güvenli kullanıcı yönetimi
- 🔔 Push notification (bildirim) sistemi: Expo Push API & Firestore ile entegre
- 🛡️ Rol tabanlı erişim: Admin paneli ile uygulama içinden toplu bildirim gönderme
- 🗂️ Firestore tabanlı veri yönetimi (ilaçlar, kullanıcılar, cihazlar)
- 📱 iOS ve Android desteği (native push notification için EAS Build/TestFlight entegrasyonu)
- 👤 Kullanıcı profil yönetimi
- 🌓 Karanlık/Aydınlık tema
- 💊 İlaç ekleme, düzenleme, silme ve hatırlatıcı kurma

## ☁️ Mimari ve Altyapı

- **Backend gerektirmez!** Tüm veriler ve servisler Firebase & Expo bulut altyapısı üzerinde çalışır.
- Bildirimler ve kullanıcı rolleri Firestore'da tutulur, ek bir sunucuya/hostinge ihtiyaç yoktur.
- Gerçek push notification ve admin paneli için native build gereklidir (Expo Go ile sadece local notification test edilebilir).

## 🔔 Push Notification Sistemi

- Kullanıcılar uygulamayı yüklediğinde cihaz push token'ı otomatik olarak Firestore'a kaydedilir.
- Admin kullanıcılar, profil ekranındaki "Bildirim Paneli" üzerinden tüm kullanıcılara toplu push notification gönderebilir.
- Bildirimler Expo Push API üzerinden, Firestore'dan alınan token'lara toplu olarak iletilir.
- Kullanıcı rolleri (admin/member) Firestore'da tutulur ve AuthContext ile uygulama geneline yayılır.

## 🛠️ Kurulum ve Geliştirme

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/hakantozkoparan/MedicineTracker.git
   cd MedicineTracker
   ```
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. Firebase projesi oluşturun ve config dosyanızı `src/services/firebase.ts` içinde tanımlayın.
4. Geliştirme için:
   ```bash
   npx expo start
   ```
   - **Not:** Expo Go ile gerçek push notification test edilemez, sadece local notification çalışır.

## 📦 Native Build & TestFlight ile Gerçek Cihazda Test

1. Apple Developer hesabınız onaylandıktan sonra:
   ```bash
   eas build:configure
   eas build --platform ios
   ```
2. IPA dosyanızı TestFlight'a yükleyin ve gerçek cihazda bildirimleri test edin.
3. Android için de benzer şekilde `eas build --platform android` ile APK/AAB oluşturabilirsiniz.

## 📂 Uygulama Klasör Yapısı

```
MedicineTracker/
  - app/                   # Expo Router tabanlı ana uygulama
  - components/            # Paylaşılan UI bileşenleri
  - src/
    - assets/              # Görseller, fontlar ve diğer statik dosyalar
    - components/          # UI bileşenleri
    - context/             # React context'leri (Auth, Theme, vs.)
    - hooks/               # Özel React hook'ları
    - navigation/          # Navigasyon yapılandırması
    - screens/             # Uygulama ekranları (Profile, Admin Panel, vs.)
    - services/            # Firebase, push notification, device servisleri
    - styles/              # Tema ve stil tanımlamaları
    - utils/               # Yardımcı fonksiyonlar
```

## 👑 Admin Paneli ve Rol Yönetimi
- Yeni kullanıcılar varsayılan olarak "member" rolüyle kaydedilir.
- Admin'ler, uygulama içinden toplu bildirim gönderebilir.
- Kullanıcı rolleri Firestore'da saklanır ve AuthContext ile yönetilir.

## ⚠️ Notlar
- Uygulamanın native özelliklerini (push notification, arka plan işlemleri vb.) test etmek için EAS Build ile alınan IPA/AAB dosyasını gerçek cihazda çalıştırmanız gerekir.
- Ekstra bir backend veya sunucuya ihtiyaç yoktur; tüm işlemler Firebase ve Expo altyapısı ile bulutta gerçekleşir.

## Katkıda Bulunma
1. Bu depoyu fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inize push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans
Bu proje [MIT lisansı](LICENSE) altında lisanslanmıştır.

## İletişim
Hakan Tozkoparan - [@hakantozkoparan](https://github.com/hakantozkoparan)

Proje Linki: [https://github.com/hakantozkoparan/MedicineTracker](https://github.com/hakantozkoparan/MedicineTracker)

MedicineTracker/
  - app/                   # Expo Router tabanlı ana uygulama
  - components/            # Paylaşılan UI bileşenleri
  - src/
    - assets/              # Görseller, fontlar ve diğer statik dosyalar
    - components/          # UI bileşenleri
    - context/             # React context'leri
    - hooks/               # Özel React hook'ları
    - navigation/          # Navigasyon yapılandırması
    - screens/             # Uygulama ekranları
    - services/            # Firebase, RevenueCat gibi harici servisler
    - styles/              # Tema ve stil tanımlamaları
    - utils/               # Yardımcı fonksiyonlar
```

## Katkıda Bulunma

1. Bu depoyu fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inize push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje [MIT lisansı](LICENSE) altında lisanslanmıştır.

## İletişim

Hakan Tozkoparan - [@hakantozkoparan](https://github.com/hakantozkoparan)

Proje Linki: [https://github.com/hakantozkoparan/MedicineTracker](https://github.com/hakantozkoparan/MedicineTracker)
