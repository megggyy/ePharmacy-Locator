import { SET_CURRENT_USER } from "../Actions/Auth.actions"
import isEmpty from "../../assets/common/is-empty"
const initialState = {
    isAuthenticated: false,
    user: {},
    userProfile: {}
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_CURRENT_USER: 
            return {
                ...state,
                isAuthenticated: !isEmpty(action.payload),
                user: action.payload || {}, // Ensure user is an object, even if null or undefined
                userProfile: action.userProfile || {} // Ensure userProfile is an object, even if null or undefined
            };
        default:
            return state;
    }
}
