import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Toast from "react-native-toast-message"
import baseURL from "../../assets/common/baseurl"

export const SET_CURRENT_USER = "SET_CURRENT_USER";

export const loginUser = (user, dispatch) => {
    console.log('Attempting to log in user:', user);
    fetch(`${baseURL}users/login`, {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
    .then((res) => {
        console.log("Response Status:", res.status); // Log the HTTP status code
        return res.json(); // Parse the JSON response
    })
    .then((data) => {
        console.log("Parsed Data:", data); // Log the parsed data
        if (data.token) {
            const token = data.token;
            AsyncStorage.setItem("jwt", token); // Save token to AsyncStorage
            const decoded = jwtDecode(token); // Decode the token to get user info
            dispatch(setCurrentUser(decoded)); // Dispatch action to set current user
        } else {
            // If no token is returned, treat it as an authentication failure
            console.log("No token returned, logging out.");
            logoutUser(dispatch);
        }
    })
    .catch((err) => {
        console.error("Fetch Error:", err);
        Toast.show({
            topOffset: 60,
            type: "error",
            text1: "Please provide correct credentials",
            text2: ""
        });
        logoutUser(dispatch);
    });
};

// Helper function to set current user
export const setCurrentUser = (decoded) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded, // Pass only decoded information
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
