import { clearAccessToken } from '@/features/auth/token';
import { useAuthStore } from '@/features/auth/store';

const clearAuth = () => {
  clearAccessToken();
  useAuthStore.getState().clearUser();
};

export { clearAuth };
