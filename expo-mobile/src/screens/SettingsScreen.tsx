import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, logout } from '@/store/slices/authSlice';
import { setLanguage, setNotifications, setThemeMode, type ThemeMode, type Language } from '@/store/slices/settingsSlice';
import { updateMe } from '@/api/auth';
import { Screen } from '@/components/layout/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SettingRow } from '@/components/ui/SettingRow';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Reveal } from '@/components/ui/Reveal';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { useTheme, spacing, radius, fontSize, fontWeight, letterSpacing } from '@/theme';
import { useTranslation, LANGUAGES } from '@/i18n';

const APP_VERSION = '0.1.0';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const settings = useAppSelector((s) => s.settings);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [year, setYear] = useState(user?.year ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updateMe({ name, year });
      dispatch(setUser(updated));
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const roleLabel =
    user?.role === 'INSTRUCTOR' ? t('roleInstructor') : user?.role === 'ADMIN' ? t('roleAdmin') : t('roleStudent');

  return (
    <Screen title={t('settingsTitle')} subtitle={t('settingsSubtitle')}>
      <Reveal>
        <GlassCard padding={18} style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Avatar initials={user?.initials ?? '??'} size="lg" />
            <View style={styles.profileText}>
              <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>
                {user?.name ?? '—'}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textMuted }]} numberOfLines={1}>
                {user?.email ?? '—'}
              </Text>
              <View style={styles.profileMeta}>
                <Badge variant="primary">{roleLabel}</Badge>
                {user?.year ? <Text style={[styles.profileYear, { color: colors.textSubtle }]}>{user.year}</Text> : null}
              </View>
            </View>
            <Button
              title={editing ? t('cancel') : t('editProfile')}
              variant="secondary"
              size="sm"
              icon={editing ? 'X' : 'Pencil'}
              onPress={() => {
                setEditing((v) => !v);
                setName(user?.name ?? '');
                setYear(user?.year ?? '');
              }}
            />
          </View>

          {editing ? (
            <View style={styles.editor}>
              <Text style={[styles.fieldLabel, { color: colors.textSubtle }]}>{t('profile').toUpperCase()}</Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder={t('profile')}
                style={styles.editorField}
              />
              <Input
                value={year}
                onChangeText={setYear}
                placeholder={t('year')}
                style={styles.editorField}
              />
              <Button
                title={t('saveChanges')}
                icon="Check"
                fullWidth
                loading={saving}
                style={styles.saveButton}
                onPress={saveProfile}
              />
            </View>
          ) : null}

          {saved ? (
            <View style={[styles.savedBox, { backgroundColor: colors.primarySoft }]}>
              <Icon name="CircleCheck" size={15} color={colors.primary} />
              <Text style={[styles.savedText, { color: colors.primary }]}>{t('profileUpdated')}</Text>
            </View>
          ) : null}
        </GlassCard>
      </Reveal>

      <Reveal delay={70}>
        <SectionHeader title={t('appPreferences')} />
        <GlassCard padding={16} style={styles.sectionCard}>
          <SettingRow icon="Settings" label={t('theme')} detail={t('appearance')} last />
          <SegmentedControl<ThemeMode>
            value={settings.themeMode}
            onChange={(mode) => dispatch(setThemeMode(mode))}
            options={[
              { value: 'light', label: t('themeLight') },
              { value: 'dark', label: t('themeDark') },
              { value: 'system', label: t('themeSystem') },
            ]}
            style={styles.control}
          />

          <SettingRow icon="Languages" label={t('language')} detail={t('tagline')} last />
          <SegmentedControl<Language>
            value={settings.language}
            onChange={(lang) => dispatch(setLanguage(lang))}
            options={LANGUAGES.map((l) => ({ value: l.code, label: t(l.labelKey) }))}
            style={styles.controlLast}
          />

          <SettingRow
            icon="Bell"
            label={t('notifications')}
            detail={t('notificationsDesc')}
            toggle
            toggleValue={settings.notifications}
            onToggle={(value) => dispatch(setNotifications(value))}
            last
          />
        </GlassCard>
      </Reveal>

      <Reveal delay={140}>
        <SectionHeader title={t('support')} />
        <GlassCard padding={14} style={styles.sectionCard}>
          <SettingRow icon="HelpCircle" label={t('helpCenter')} detail={t('helpCenterDesc')} onPress={() => undefined} />
          <SettingRow icon="Send" label={t('contactUs')} detail={t('contactUsDesc')} onPress={() => undefined} />
          <SettingRow
            icon="Info"
            label={t('about')}
            detail={`${t('aboutDesc')} · ${t('version')} ${APP_VERSION}`}
            last
          />
        </GlassCard>
      </Reveal>

      <Reveal delay={200}>
        <SectionHeader title={t('account')} />
        <GlassCard padding={14}>
          <SettingRow
            icon="LogOut"
            label={t('signOut')}
            detail={t('signOutDesc')}
            danger
            last
            onPress={() => dispatch(logout())}
          />
        </GlassCard>
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: { marginBottom: spacing.xl },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  profileText: { flex: 1 },
  profileName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.tight },
  profileEmail: { fontSize: fontSize.sm, marginTop: 2 },
  profileMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  profileYear: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  editor: { marginTop: spacing.lg },
  fieldLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.micro, marginBottom: 8 },
  editorField: { marginBottom: spacing.sm + 2 },
  saveButton: { marginTop: spacing.md },
  savedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.md,
    padding: 12,
    marginTop: spacing.md,
  },
  savedText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  sectionCard: { marginBottom: spacing.xl },
  control: { marginBottom: spacing.lg },
  controlLast: { marginBottom: 4 },
});
