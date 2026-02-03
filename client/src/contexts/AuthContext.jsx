import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null
      };
    case 'REGISTER_START':
      return { ...state, loading: true, error: null };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null
      };
    case 'REGISTER_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return; // Prevent multiple initializations

    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      console.log('Init auth - Token exists:', !!token);
      console.log('Init auth - User exists:', !!userStr);

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('Parsed user:', user);

          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token }
          });

          // Optionally validate token in background
          try {
            const response = await authAPI.getProfile();
            console.log('Token validation successful:', response.data);
            dispatch({
              type: 'UPDATE_USER',
              payload: response.data.user
            });
          } catch (error) {
            // Token might be expired, but keep user logged in for now
            console.warn('Token validation failed, but keeping session:', error);
            // For now, let's just continue without validation
          }
        } catch (error) {
          // Only remove if user data is corrupted
          console.error('User data corrupted:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      setIsInitialized(true);
    };

    initAuth();
  }, [isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    if (state.token && state.user) {
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));
      return;
    }

    // Only clear when we are fully initialized and truly logged out.
    //const existingToken = localStorage.getItem('token');
    //const existingUser = localStorage.getItem('user');

    // This condition is broken — after logout, state has no token/user,
    // but localStorage was ALREADY cleared above, so this never executes
    /* if (!state.token && !state.user && !existingToken && !existingUser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } */
  }, [state.token, state.user, isInitialized]);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.login(credentials);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data
      });
      return response.data;
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.message || 'Login failed'
      });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      const response = await authAPI.register(userData);
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: response.data
      });
      return response.data;
    } catch (error) {
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: error.response?.data?.message || 'Registration failed'
      });
      throw error;
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Dispatch logout action
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    isInitialized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
