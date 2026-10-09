import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TiryaqLogo } from '@/components/brand/TiryaqLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenBackground } from '@/components/layout/ScreenBackground';
import { useTheme, fontSize, fontWeight, radius, spacing } from '@/theme';
import { useTranslation } from '@/i18n';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <TiryaqLogo size={240} />
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              {t('tagline').toUpperCase()}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>{t('welcomeBack')}</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {t('loginSubtitle')}
            </Text>

            <View style={styles.fields}>
              <Input
                label={t('emailAddress')}
                icon="Mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder={t('emailAddress')}
                returnKeyType="next"
                style={styles.field}
              />
              <Input
                label={t('password')}
                icon="Lock"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder={t('password')}
                returnKeyType="done"
                style={styles.field}
              />
            </View>

            <Button
              title={t('continueToApp')}
              size="lg"
              fullWidth
              iconRight="ArrowRight"
              style={styles.loginButton}
            />

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerLabel, { color: colors.textSubtle }]}>OR</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              style={({ pressed }) => [
                styles.googleButton,
                {
                  backgroundColor: colors.glassFallback,
                  borderColor: colors.border,
                  opacity: pressed ? 0.78 : 1,
                },
              ]}
            >
              <View style={styles.googleMark}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={[styles.googleLabel, { color: colors.text }]}>Continue with Google</Text>
            </Pressable>

            <Text style={[styles.footer, { color: colors.textSubtle }]}>
              {t('loginSubtitle')}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  content: { width: '100%', maxWidth: 440, alignSelf: 'center', alignItems: 'center' },
  eyebrow: {
    marginTop: spacing.lg,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1.6,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: 30,
    fontWeight: fontWeight.heavy,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: fontSize.md,
    lineHeight: 22,
    textAlign: 'center',
  },
  fields: { width: '100%', marginTop: spacing.xl },
  field: { marginTop: spacing.md },
  loginButton: { width: '100%', marginTop: spacing.xl },
  dividerRow: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.lg },
  divider: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, letterSpacing: 1 },
  googleButton: {
    width: '100%',
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.full,
  },
  googleMark: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  googleG: { color: '#4285F4', fontSize: 20, fontWeight: '700' },
  googleLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  footer: { marginTop: spacing.xl, fontSize: fontSize.xs, textAlign: 'center' },
});
