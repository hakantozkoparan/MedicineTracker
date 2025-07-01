# MedicineTracker 💊

MedicineTracker, kullanıcıların ilaçlarını takip etmelerine, hatırlatmalar almalarına ve sağlık bilgilerini yönetmelerine olanak tanıyan bir mobil uygulamadır.

## Özellikler

- 🔐 Firebase kimlik doğrulama (Giriş, Kayıt, Şifre sıfırlama)
- 💰 RevenueCat ile abonelik yönetimi
- 🔔 İlaç hatırlatıcıları
- 📊 İlaç kullanım takibi
- 👤 Kullanıcı profil yönetimi
- 🌓 Karanlık/Aydınlık tema desteği
- 📱 iOS ve Android platformları için destek

## Teknolojiler

- React Native
- Expo
- Firebase Authentication
- RevenueCat
- TypeScript

## Kurulum

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/hakantozkoparan/MedicineTracker.git
   cd MedicineTracker
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Uygulamayı başlatın:
   ```bash
   npx expo start
   ```

## Uygulama Yapısı

```
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
