import React, { createContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';

// Actions
const SET_CURRENT_USER = 'SET_CURRENT_USER';
const LOGOUT_USER = 'LOGOUT_USER';

// Initial State
const initialState = {
  isAuthenticated: false,
  user: {},
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: !!action.payload,
        user: action.payload || {},
      };
    case LOGOUT_USER:
      return initialState;
    default:
      return state;
  }
};

// Context
const AuthGlobal = createContext({
  state: initialState,
  dispatch: () => null,
  logout: () => {},
});

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const token = await AsyncStorage.getItem('jwt');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          dispatch({ type: SET_CURRENT_USER, payload: decoded });
        } catch (error) {
          console.error('Token decoding failed:', error);
          logout(); 
        }
      }
    };
    loadUserFromStorage();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('jwt');
    dispatch({ type: LOGOUT_USER });
  };

  return (
    <AuthGlobal.Provider value={{ state, dispatch, logout }}>
      {children}
    </AuthGlobal.Provider>
  );
};

export default AuthGlobal;
