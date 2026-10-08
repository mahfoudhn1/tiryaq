import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'fr' | 'ar';

export interface SettingsState {
  themeMode: ThemeMode;
  language: Language;
  notifications: boolean;
  hydrated: boolean;
}

const initialState: SettingsState = {
  themeMode: 'system',
  language: 'en',
  notifications: true,
  hydrated: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    hydrateSettings(state, action: PayloadAction<Partial<SettingsState>>) {
      Object.assign(state, action.payload, { hydrated: true });
    },
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload;
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    setNotifications(state, action: PayloadAction<boolean>) {
      state.notifications = action.payload;
    },
  },
});

export const { hydrateSettings, setThemeMode, setLanguage, setNotifications } =
  settingsSlice.actions;

export default settingsSlice.reducer;
