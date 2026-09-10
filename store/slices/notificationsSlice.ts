import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: [
    { id: 'n-1', title: 'New live session', body: 'Dr. Haddad is going live in 30 minutes — Cardiology: ECG Interpretation.', type: 'info', read: false, createdAt: '5 min ago' },
    { id: 'n-2', title: 'Review due', body: 'You have 4 flashcards ready for review.', type: 'info', read: false, createdAt: '1 hr ago' },
    { id: 'n-3', title: 'Streak at risk', body: 'Study for 10 minutes to protect your 14-day streak.', type: 'warning', read: true, createdAt: '3 hr ago' },
  ],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markRead(state, action: PayloadAction<string>) {
      const n = state.items.find((i) => i.id === action.payload);
      if (n) n.read = true;
    },
    markAllRead(state) {
      state.items.forEach((n) => { n.read = true; });
    },
    addNotification(state, action: PayloadAction<Omit<Notification, 'id' | 'read' | 'createdAt'>>) {
      state.items.unshift({ ...action.payload, id: `n-${Date.now()}`, read: false, createdAt: 'Just now' });
    },
  },
});

export const { markRead, markAllRead, addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
