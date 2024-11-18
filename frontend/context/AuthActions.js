import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Toast from "react-native-toast-message"
import baseURL from "../assets/common/baseurl"

export const SET_CURRENT_USER = "SET_CURRENT_USER";

// export const loginUser = (user, dispatch) => {
//     fetch(`${baseURL}users/login`, {
//         method: "POST",
//         body: JSON.stringify(user),
//         headers: {
//             Accept: "application/json",
//             "Content-Type": "application/json",
//         },
//     })
//     .then((res) => res.json())
//     .then((data) => {
//         if (data.token) {
//             const token = data.token;
//             AsyncStorage.setItem("jwt", token); // Store JWT in AsyncStorage
//             const decoded = jwtDecode(token); // Decode the JWT token
//             dispatch(setCurrentUser(decoded, user)); // Dispatch the decoded user data to store
//         } else {
//             console.log("No token returned, logging out.");
//             logoutUser(dispatch);
//         }
//     })
//     .catch((err) => {
//         console.log(state)
//         Toast.show({
//             topOffset: 60,
//             type: "error",
//             text1: "PLEASE PROVIDE CORRECT CREDENTIALS",
//         });
//         logoutUser(dispatch); // Ensure logout in case of failure
//     });
// };

export const loginUser = async (user, dispatch) => {
    try {
        const response = await fetch(`${baseURL}users/login`, {
            method: "POST",
            body: JSON.stringify(user),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();

        if (response.ok && data.success) {
            // Successful login
            const token = data.token;
            await AsyncStorage.setItem("jwt", token); // Store JWT in AsyncStorage
            const decoded = jwtDecode(token); // Decode the JWT token
            dispatch(setCurrentUser(decoded, user)); // Dispatch the decoded user data to store
            return { success: true };
        } else {
            // Return error message for handling in LoginScreen
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: "NETWORK_ERROR" };
    }
};


export const setCurrentUser = (decoded, user) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded,
        userProfile: user
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
