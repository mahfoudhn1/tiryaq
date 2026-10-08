import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/medical';
import { clearTokens } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Called after a successful login/registration response from the API. */
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      clearTokens();
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
