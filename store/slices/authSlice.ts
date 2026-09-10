import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/medical';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const MOCK_STUDENT: User = {
  id: 'u-1',
  name: 'Aya Benali',
  email: 'Aya.benali@tiryaq.com',
  role: 'STUDENT',
  initials: 'AB',
  year: 'MS-V',
};

const MOCK_INSTRUCTOR: User = {
  id: 'u-2',
  name: 'Dr. Amine Haddad',
  email: 'amine.haddad@tiryaq.com',
  role: 'INSTRUCTOR',
  initials: 'AH',
  specialty: 'Cardiology',
};

const MOCK_ADMIN: User = {
  id: 'u-3',
  name: 'Admin User',
  email: 'admin@tiryaq.com',
  role: 'ADMIN',
  initials: 'AU',
};

export const MOCK_USERS = { student: MOCK_STUDENT, instructor: MOCK_INSTRUCTOR, admin: MOCK_ADMIN };

const initialState: AuthState = {
  user: MOCK_STUDENT,
  isAuthenticated: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
    switchRole(state, action: PayloadAction<'STUDENT' | 'INSTRUCTOR' | 'ADMIN'>) {
      if (action.payload === 'STUDENT') state.user = MOCK_STUDENT;
      else if (action.payload === 'INSTRUCTOR') state.user = MOCK_INSTRUCTOR;
      else state.user = MOCK_ADMIN;
    },
  },
});

export const { setUser, logout, switchRole } = authSlice.actions;
export default authSlice.reducer;
