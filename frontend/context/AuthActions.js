import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Toast from "react-native-toast-message"
import baseURL from "../assets/common/baseurl"

export const SET_CURRENT_USER = "SET_CURRENT_USER";

export const loginUser = (user, dispatch) => {
    fetch(`${baseURL}users/login`, {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
    .then((res) => {
        return res.json(); // Parse the JSON response
    })
    .then((data) => {
        if (data.token) {
            const token = data.token;
            AsyncStorage.setItem("jwt", token); 
            const decoded = jwtDecode(token);
            dispatch(setCurrentUser(decoded)); 
        } else {
            console.log("No token returned, logging out.");
            logoutUser(dispatch);
        }
    })
    .catch((err) => {
        console.error("Fetch Error:", err);
        Toast.show({
            topOffset: 60,
            type: "error",
            text1: "PLEASE PROVIDE CORRECT CREDENTIALS",
            text2: ""
        });
        logoutUser(dispatch);
    });
};

export const setCurrentUser = (decoded) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded,
    };
};


export const getUserProfile = (id) => {
    fetch(`${baseURL}users/${id}`, {
        method: "GET",
        body: JSON.stringify(user),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    })
    .then((res) => res.json())
    .then((data) => console.log(data));
}

export const logoutUser = (dispatch) => {
    AsyncStorage.removeItem("jwt");
    dispatch(setCurrentUser({}));
    dispatch(resetFormFields()); 
}

export const RESET_FORM_FIELDS = "RESET_FORM_FIELDS";

export const resetFormFields = () => {
    return {
        type: RESET_FORM_FIELDS
    }
}
