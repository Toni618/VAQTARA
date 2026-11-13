import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import fa from './fa.json';
import en from './en.json';

// Persian is the default language and requires RTL.
// RN applies forceRTL on the NEXT app launch, so we enable it at module load:
// the very first launch may render LTR once; every launch after that is RTL.
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: { fa: { translation: fa }, en: { translation: en } },
  lng: 'fa',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
