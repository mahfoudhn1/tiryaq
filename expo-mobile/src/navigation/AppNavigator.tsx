import React from 'react';
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAppSelector } from '@/store/hooks';
import { useTheme, radius, fontSize, fontWeight, letterSpacing, layout, spacing } from '@/theme';
import { useTranslation } from '@/i18n';
import { useReduceMotion } from '@/hooks/useA11y';
import { GlassSurface } from '@/components/ui/GlassCard';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';

import LoginScreen from '@/screens/LoginScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import FlashcardsScreen from '@/screens/FlashcardsScreen';
import FlashcardReviewScreen from '@/screens/FlashcardReviewScreen';
import CasesScreen from '@/screens/CasesScreen';
import CaseDetailScreen from '@/screens/CaseDetailScreen';
import CoursesScreen from '@/screens/CoursesScreen';
import CourseDetailScreen from '@/screens/CourseDetailScreen';
import QBankScreen from '@/screens/QBankScreen';
import QuizScreen from '@/screens/QuizScreen';
import AnalyticsScreen from '@/screens/AnalyticsScreen';
import LiveScreen from '@/screens/LiveScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import InstructorDashboardScreen from '@/screens/instructor/InstructorDashboardScreen';
import AdminDashboardScreen from '@/screens/admin/AdminDashboardScreen';

export type StudentTabParamList = {
  DashboardTab: undefined;
  CoursesTab: undefined;
  FlashcardsTab: undefined;
  CasesTab: undefined;
  QBankTab: undefined;
  AnalyticsTab: undefined;
  SettingsTab: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  StudentTabs: undefined;
  InstructorDashboard: undefined;
  AdminDashboard: undefined;
  CaseDetail: { id: string };
  CourseDetail: { id: string };
  FlashcardReview: { deckId?: string } | undefined;
  QuizSession: undefined;
  LiveSessionDetail: { id: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<StudentTabParamList>();

interface TabDef {
  name: keyof StudentTabParamList;
  component: React.ComponentType;
  icon: IconName;
  label: string;
}

interface TabItemProps {
  focused: boolean;
  icon: IconName;
  label: string;
  isRTL: boolean;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
}

function TabItem({
  focused,
  icon,
  label,
  isRTL,
  onPress,
  onLongPress,
  accessibilityLabel,
}: TabItemProps) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const press = (to: number) => {
    if (reduceMotion) {
      scale.set(to);
      return;
    }
    scale.set(withTiming(to, { duration: to === 1 ? 160 : 110 }));
  };

  const tint = focused ? colors.primary : colors.textSubtle;

  return (
    <Animated.View
      style={[styles.tabItem, { flex: focused ? 2.5 : 1 }, animatedStyle]}
      layout={reduceMotion ? undefined : LinearTransition.duration(220)}
    >
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={() => press(0.94)}
        onPressOut={() => press(1)}
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={accessibilityLabel ?? label}
        style={[
          styles.tabButton,
          isRTL && styles.rowReverse,
          focused && { backgroundColor: colors.primarySoft, borderRadius: radius.full },
        ]}
      >
        <Icon name={icon} size={22} color={tint} strokeWidth={focused ? 2.5 : 2} />
        {focused ? (
          <Text numberOfLines={1} style={[styles.tabLabel, { color: colors.primary }]}>
            {label}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

function FloatingTabBar({ state, descriptors, navigation, tabs }: BottomTabBarProps & { tabs: TabDef[] }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isRTL } = useTranslation();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.tabBarWrap,
        {
          paddingHorizontal: layout.tabBarInset,
          paddingBottom: insets.bottom + layout.tabBarInset / 2,
        },
      ]}
    >
      <View
        style={[
          styles.tabBarShadow,
          {
            backgroundColor: colors.tabBar,
            shadowColor: colors.tabShadow,
            shadowOpacity: isDark ? 0.45 : 0.14,
          },
        ]}
      >
        <GlassSurface padding={0} intensity={55} style={styles.tabBar}>
          <View style={[styles.tabBarRow, isRTL && styles.rowReverse]}>
            {state.routes.map((route, index) => {
              const tab = tabs.find((entry) => entry.name === route.name) ?? tabs[index];
              if (!tab) {
                return null;
              }
              const focused = state.index === index;
              const { options } = descriptors[route.key];

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({ type: 'tabLongPress', target: route.key });
              };

              return (
                <TabItem
                  key={route.key}
                  focused={focused}
                  icon={tab.icon}
                  label={tab.label}
                  isRTL={isRTL}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  accessibilityLabel={options.tabBarAccessibilityLabel ?? options.title}
                />
              );
            })}
          </View>
        </GlassSurface>
      </View>
    </View>
  );
}

function StudentTabs() {
  const { t } = useTranslation();

  const tabs: TabDef[] = [
    { name: 'DashboardTab', component: DashboardScreen, icon: 'LayoutDashboard', label: t('navDashboard') },
    { name: 'CoursesTab', component: CoursesScreen, icon: 'BookOpen', label: t('navCourses') },
    { name: 'FlashcardsTab', component: FlashcardsScreen, icon: 'Brain', label: t('navFlashcards') },
    { name: 'CasesTab', component: CasesScreen, icon: 'Stethoscope', label: t('navCases') },
    { name: 'QBankTab', component: QBankScreen, icon: 'ClipboardCheck', label: t('navQbank') },
    { name: 'AnalyticsTab', component: AnalyticsScreen, icon: 'BarChart3', label: t('navAnalytics') },
    { name: 'SettingsTab', component: SettingsScreen, icon: 'Settings', label: t('settings') },
  ];

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} tabs={tabs} />}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{ title: tab.label }}
        />
      ))}
    </Tab.Navigator>
  );
}

function TopBar() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const canGoBack = navigation.canGoBack();

  const roleLabel =
    user?.role === 'INSTRUCTOR'
      ? t('instructorPortal')
      : user?.role === 'ADMIN'
        ? t('adminConsole')
        : t('navDashboard');

  return (
    <GlassSurface square padding={0} intensity={60} style={styles.topBar}>
      <View style={styles.topBarInner}>
        <View style={styles.brandRow}>
          {canGoBack ? (
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityLabel={t('goBack')}
              style={({ pressed }) => [
                styles.iconButton,
                { backgroundColor: colors.primarySoft },
                pressed && styles.pressed,
              ]}
            >
              <Icon name="ArrowLeft" size={18} color={colors.text} />
            </Pressable>
          ) : (
            <View style={[styles.brandMark, { backgroundColor: colors.primary }]}>
              <Icon name="HeartPulse" size={17} color={colors.onPrimary} strokeWidth={2.4} />
            </View>
          )}
          <View style={styles.brandText}>
            <Text style={[styles.logoText, { color: colors.text }]}>{t('appName')}</Text>
            <Text style={[styles.logoSub, { color: colors.primary }]} numberOfLines={1}>
              {canGoBack ? roleLabel : t('tagline').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.topActions}>
          {user?.role !== 'ADMIN' ? (
            <Pressable
              onPress={() => navigation.navigate('LiveSessionDetail', { id: '' })}
              accessibilityLabel={t('liveTitle')}
              style={({ pressed }) => [
                styles.iconButton,
                { backgroundColor: colors.primarySoft },
                pressed && styles.pressed,
              ]}
            >
              <Icon name="Video" size={17} color={colors.text} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            accessibilityLabel={t('settings')}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: colors.primarySoft },
              pressed && styles.pressed,
            ]}
          >
            <Icon name="Settings" size={17} color={colors.text} />
          </Pressable>
          {user ? <Avatar initials={user.initials} size="sm" /> : null}
        </View>
      </View>
      <View pointerEvents="none" style={[styles.hairline, { backgroundColor: colors.border }]} />
    </GlassSurface>
  );
}

export function AppNavigator() {
  const { colors } = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <TopBar />,
        headerShadowVisible: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {!isAuthenticated || !user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : user.role === 'INSTRUCTOR' ? (
        <>
          <Stack.Screen name="InstructorDashboard" component={InstructorDashboardScreen} />
          <Stack.Screen name="LiveSessionDetail" component={LiveScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      ) : user.role === 'ADMIN' ? (
        <>
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="StudentTabs" component={StudentTabs} options={{ headerShown: false }} />
          <Stack.Screen name="CaseDetail" component={CaseDetailScreen} />
          <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
          <Stack.Screen name="FlashcardReview" component={FlashcardReviewScreen} />
          <Stack.Screen name="QuizSession" component={QuizScreen} />
          <Stack.Screen name="LiveSessionDetail" component={LiveScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  topBar: {
    borderWidth: 0,
    borderBottomWidth: 0,
    flexGrow: 0,
  },
  topBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.topBarHeight,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  hairline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2, flex: 1 },
  brandText: { flex: 1 },
  brandMark: {
    width: layout.minTouch,
    height: layout.minTouch,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 17, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.tight, lineHeight: 19 },
  logoSub: { fontSize: fontSize.xs - 2, fontWeight: fontWeight.bold, letterSpacing: letterSpacing.wide, marginTop: 1 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconButton: {
    width: layout.minTouch,
    height: layout.minTouch,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  tabBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBarShadow: {
    borderRadius: radius.pill,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
  },
  tabBar: { borderRadius: radius.pill },
  tabBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    gap: 2,
  },
  rowReverse: { flexDirection: 'row-reverse' },
  tabItem: {
    minHeight: layout.minTouch,
    justifyContent: 'center',
  },
  tabButton: {
    flex: 1,
    minHeight: layout.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: spacing.xs,
  },
  tabLabel: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
});
