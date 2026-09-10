import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const LANGUAGES = ['en', 'fr', 'ar'] as const;
export type Language = typeof LANGUAGES[number];

interface LocaleState {
  language: Language;
}

const initialState: LocaleState = { language: 'en' };

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = localeSlice.actions;
export default localeSlice.reducer;
