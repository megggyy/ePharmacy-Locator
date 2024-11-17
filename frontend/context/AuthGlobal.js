import React, { createContext, useReducer, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import isEmpty from "../assets/common/is-empty"
import { SET_CURRENT_USER } from "./AuthActions";

// Actions;
const LOGOUT_USER = 'LOGOUT_USER';

// Initial State
const initialState = {
  isAuthenticated: false,
  user: {},
  userProfile: {}
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload || {}, // Ensure user is an object, even if null or undefined
        userProfile: action.userProfile || {} // Ensure userProfile is an object, even if null or undefined
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
  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    setShowChild(true);
    if (AsyncStorage.jwt) {
        const decoded = AsyncStorage.jwt ? AsyncStorage.jwt : "";
        if (setShowChild) {
            dispatch(SET_CURRENT_USER(jwtDecode(decoded)))
        }
    }
    return () => setShowChild(false);
}, [])


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
