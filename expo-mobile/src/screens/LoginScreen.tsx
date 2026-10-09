import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { login, demoLogin } from '@/api/auth';
import type { UserRole } from '@/types/medical';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TiryaqLogo } from '@/components/brand/TiryaqLogo';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Reveal } from '@/components/ui/Reveal';
import { ScreenBackground } from '@/components/layout/ScreenBackground';
import { useTheme, spacing, radius, fontSize, fontWeight, letterSpacing, statusSoftTints } from '@/theme';
import { useTranslation } from '@/i18n';

const DEMO_ACCOUNTS: { role: UserRole; email: string; labelKey: 'roleStudent' | 'roleInstructor' | 'roleAdmin' }[] = [
  { role: 'STUDENT', email: 'Aya.Zmt@tiryaq.com', labelKey: 'roleStudent' },
  { role: 'INSTRUCTOR', email: 'amine.haddad@tiryaq.com', labelKey: 'roleInstructor' },
  { role: 'ADMIN', email: 'admin@tiryaq.com', labelKey: 'roleAdmin' },
];

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [role, setRole] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState('password');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const select = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setRole(account.role);
    setEmail(account.email);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const auth = email ? await login(email, password) : await demoLogin(role);
      dispatch(setUser(auth.user));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Reveal>
            <LinearGradient
              colors={colors.hero}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <View
                pointerEvents="none"
                style={[styles.heroOrbLarge, { backgroundColor: colors.heroSurface }]}
              />
              <View
                pointerEvents="none"
                style={[styles.heroOrbSmall, { backgroundColor: colors.heroBorder }]}
              />
              <LinearGradient
                colors={colors.heroShine}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                pointerEvents="none"
                style={StyleSheet.absoluteFill}
              />

              <Text style={[styles.heroKicker, { color: colors.onHeroFaint }]}>
                {t('tagline').toUpperCase()}
              </Text>
              <Text style={[styles.heroTitle, { color: colors.onHero }]}>{t('loginHeroTitle')}</Text>
              <Text style={[styles.heroSubtitle, { color: colors.onHeroMuted }]}>
                {t('loginHeroSubtitle')}
              </Text>
              <View style={styles.heroStats}>
                {[
                  { value: '82%', label: t('cardiologyMastery') },
                  { value: '12', label: t('dayStreak') },
                  { value: '4.8', label: t('learnerRating') },
                ].map((stat) => (
                  <View
                    key={stat.label}
                    style={[
                      styles.heroStat,
                      { backgroundColor: colors.heroSurface, borderColor: colors.heroBorder },
                    ]}
                  >
                    <Text style={[styles.heroStatValue, { color: colors.onHero }]}>
                      {stat.value}
                    </Text>
                    <Text style={[styles.heroStatLabel, { color: colors.onHeroFaint }]}>
                      {stat.label}
                    </Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Reveal>

          <Reveal delay={90} style={styles.form}>
            <GlassCard variant="elevated" padding={22}>
              <TiryaqLogo size={52} />
              <Text style={[styles.title, { color: colors.text }]}>{t('welcomeBack')}</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('loginSubtitle')}</Text>

              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                {t('demoAccount').toUpperCase()}
              </Text>

              {DEMO_ACCOUNTS.map((account) => {
                const active = role === account.role;
                return (
                  <Pressable
                    key={account.role}
                    onPress={() => select(account)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active ? colors.primarySoft : colors.glass,
                      },
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.radio,
                        { borderColor: active ? colors.primary : colors.textSubtle },
                      ]}
                    >
                      {active ? (
                        <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />
                      ) : null}
                    </View>
                    <Text style={[styles.optionLabel, { color: colors.text }]}>
                      {t(account.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}

              <Input
                label={t('emailAddress')}
                icon="Mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="you@tiryaq.com"
                style={styles.field}
              />

              <Input
                label={t('password')}
                icon="Lock"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                style={styles.field}
              />

              {error ? (
                <View
                  style={[
                    styles.errorBox,
                    {
                      backgroundColor: statusSoftTints.red[isDark ? 'dark' : 'light'],
                      borderColor: colors.danger,
                    },
                  ]}
                >
                  <Icon name="CircleAlert" size={15} color={colors.danger} />
                  <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                </View>
              ) : null}

              <Button
                title={submitting ? t('signingIn') : t('continueToApp')}
                onPress={submit}
                loading={submitting}
                size="lg"
                fullWidth
                iconRight="ArrowRight"
                style={styles.submit}
              />
            </GlassCard>
          </Reveal>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: spacing.xxl },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: 54,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroOrbLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -90,
    right: -70,
  },
  heroOrbSmall: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    bottom: -50,
    left: -30,
  },
  heroKicker: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.wide + 0.2,
  },
  heroTitle: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.display,
    marginTop: 12,
    lineHeight: 38,
  },
  heroSubtitle: { fontSize: fontSize.md, lineHeight: 21, marginTop: 12 },
  heroStats: { flexDirection: 'row', gap: 10, marginTop: 22 },
  heroStat: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 12,
  },
  heroStatValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  heroStatLabel: { fontSize: fontSize.xs, marginTop: 3 },
  form: { marginHorizontal: spacing.lg, marginTop: -34 },
  brandMark: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 26,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.title,
    marginTop: 16,
  },
  subtitle: { fontSize: fontSize.md, lineHeight: 20, marginTop: 6 },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.micro,
    marginTop: 22,
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  optionPressed: { opacity: 0.85 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  optionLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  field: { marginTop: spacing.md },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 14,
  },
  errorText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, flex: 1 },
  submit: { marginTop: 20 },
});
