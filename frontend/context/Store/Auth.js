// Auth.js
import React, { useEffect, useReducer, useState } from "react";
import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from "../Reducers/Auth.reducer";
import { setCurrentUser } from "../Actions/Auth.actions";
import AuthGlobal from './AuthGlobal';

const Auth = (props) => {
    const [stateUser, dispatch] = useReducer(authReducer, {
        isAuthenticated: null,
        user: {}
    });
    const [showChild, setShowChild] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            setShowChild(true);
            const token = await AsyncStorage.getItem('jwt'); // Correct usage to get JWT
            if (token) {
                const decoded = jwtDecode(token);
                dispatch(setCurrentUser(decoded)); // Dispatch the user information
            }
        };
        checkAuth();

        return () => setShowChild(false);
    }, []);

    if (!showChild) {
        return null; 
    } else {
        return (
            <AuthGlobal.Provider value={{ stateUser, dispatch }}>
                {props.children}
            </AuthGlobal.Provider>
        );
    }
};

export default Auth;
