import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';

export const AuthProvider = ({ children }) => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
};
