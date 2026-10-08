import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  notificationsVisible: boolean;
}

const initialState: UIState = {
  sidebarOpen: false,
  notificationsVisible: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    toggleNotificationsVisible(state) {
      state.notificationsVisible = !state.notificationsVisible;
    },
    setNotificationsVisible(state, action) {
      state.notificationsVisible = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleNotificationsVisible,
  setNotificationsVisible,
} = uiSlice.actions;
export default uiSlice.reducer;
