import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '@/types/medical';

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      state.items.unshift(action.payload);
    },
    markAllRead(state) {
      state.items.forEach((n) => (n.read = true));
    },
    markRead(state, action: PayloadAction<string>) {
      const notification = state.items.find((n) => n.id === action.payload);
      if (notification) notification.read = true;
    },
  },
});

export const { addNotification, markAllRead, markRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
