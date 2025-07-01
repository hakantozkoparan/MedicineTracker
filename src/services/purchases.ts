
// RevenueCat API anahtarları
const REVENUECAT_API_KEYS = {
  ios: 'YOUR_IOS_API_KEY',
  android: 'YOUR_ANDROID_API_KEY',
};

// RevenueCat'i başlat (Expo Go'da mock edildi)
export const initPurchases = async (userId: string) => {
  console.log('RevenueCat initialized in mock mode for Expo Go');
  return true;
};

// Mevcut paketleri getir (Expo Go'da mock edildi)
export const getOfferings = async () => {
  console.log('Getting mock offerings for Expo Go');
  return [
    {
      identifier: 'mock_monthly',
      offeringIdentifier: 'premium',
      product: {
        identifier: 'mock_monthly',
        description: 'Aylık Premium Abonelik',
        title: 'Aylık Premium',
        price: 9.99,
        priceString: '₺9,99',
      }
    },
    {
      identifier: 'mock_yearly',
      offeringIdentifier: 'premium',
      product: {
        identifier: 'mock_yearly',
        description: 'Yıllık Premium Abonelik',
        title: 'Yıllık Premium',
        price: 99.99,
        priceString: '₺99,99',
      }
    }
  ];
};

// Satın alma işlemi (Expo Go'da mock edildi)
export const purchasePackage = async (pack: any) => {
  console.log('Mock purchase for Expo Go:', pack.identifier);
  return {
    entitlements: {
      active: {
        premium: {
          isActive: true,
          willRenew: true,
          expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    }
  };
};

// Abonelik durumunu kontrol et (Expo Go'da mock edildi)
export const checkPremiumStatus = async () => {
  console.log('Checking mock premium status for Expo Go');
  return false;
};

// Kullanıcı kimliğini güncelle (Expo Go'da mock edildi)
export const updatePurchasesUserId = async (userId: string) => {
  console.log('Updated mock user ID for Expo Go:', userId);
  return true;
};

// Kullanıcı çıkışı (Expo Go'da mock edildi)
export const logOutPurchases = async () => {
  console.log('Logged out mock RevenueCat for Expo Go');
  return true;
}; 