import React, { createContext, useReducer, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthGlobal = createContext({
  state: {
    isAuthenticated: false,
    user: {},
  },
  dispatch: () => null,
  logout: () => {},
});

const SET_CURRENT_USER = 'SET_CURRENT_USER';
const LOGOUT_USER = 'LOGOUT_USER';

const initialState = {
  isAuthenticated: false,
  user: {},
};

const authReducer = (state, action) => {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: !!action.payload, // Convert payload to boolean
        user: action.payload || {}, // Set user to decoded payload or empty object
      };
    case LOGOUT_USER:
      return initialState; // Reset state to initial
    default:
      return state; // Return current state by default
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const token = await AsyncStorage.getItem('jwt');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          dispatch({ type: SET_CURRENT_USER, payload: decoded }); // Set user state based on decoded token
        } catch (error) {
          console.error('Token decoding error:', error);
          logout(); // Logout if token decoding fails
        }
      }
    };
    loadUserFromStorage();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('jwt');
    dispatch({ type: LOGOUT_USER }); // Reset state on logout
  };

  return (
    <AuthGlobal.Provider value={{ state, dispatch, logout }}>
      {children}
    </AuthGlobal.Provider>
  );
};

export default AuthGlobal;
