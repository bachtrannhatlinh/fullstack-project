import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ME } from '../graphql/queries';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: true,
  });

  const { data, loading, error, refetch } = useQuery(GET_ME, {
    skip: !authState.token,
    errorPolicy: 'all',
  });

  useEffect(() => {
    if (data?.me) {
      setAuthState(prev => ({
        ...prev,
        user: data.me,
        isAuthenticated: true,
        loading: false,
      }));
    } else if (error && authState.token) {
      // Token is invalid, clear it
      localStorage.removeItem('token');
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      });
    } else if (!authState.token) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
      }));
    }
  }, [data, error, authState.token]);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    setAuthState({
      user,
      token,
      isAuthenticated: true,
      loading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  const refreshUser = () => {
    if (authState.token) {
      refetch();
    }
  };

  return {
    ...authState,
    login,
    logout,
    refreshUser,
  };
};
