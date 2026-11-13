import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import i18n from '../src/i18n';

export default function LanguageSelectScreen() {
  const { t, i18n: inst } = useTranslation();
  const setLang = (lng: 'fa' | 'en') => inst.changeLanguage(lng);
  const active = inst.language;
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>{t('brand')}</Text>
      <Text style={styles.tagline}>{t('tagline')}</Text>
      <Text style={styles.subtitle}>{t('selectLanguage')}</Text>
      {(['fa', 'en'] as const).map((l) => (
        <Pressable key={l} style={[styles.button, active === l && styles.buttonActive]} onPress={() => setLang(l)}>
          <Text style={styles.buttonText}>{l === 'fa' ? 'فارسی' : 'English'}</Text>
        </Pressable>
      ))}
      <Text style={styles.note}>{t('scaffoldNote')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05060d', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#e8ecff', fontSize: 40, fontWeight: '700', marginBottom: 6 },
  tagline: { color: '#8b5cf6', fontSize: 16, marginBottom: 32 },
  subtitle: { color: '#b9c2ff', fontSize: 18, marginBottom: 20 },
  button: { backgroundColor: '#141b3a', borderColor: '#2a3566', borderWidth: 1, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14, marginVertical: 8, minWidth: 220, alignItems: 'center' },
  buttonActive: { borderColor: '#8b5cf6', backgroundColor: '#1d1650' },
  buttonText: { color: '#fff', fontSize: 18 },
  note: { color: '#7f89b8', marginTop: 28, textAlign: 'center' },
});
