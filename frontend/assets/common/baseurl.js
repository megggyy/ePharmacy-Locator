import { Platform } from 'react-native'


let baseURL = '';

// {Platform.OS == 'ios'
// ? baseURL = 'http://192.168.68.110:4000/api/v1/'
// : baseURL = 'http://192.168.68.240:4000/api/v1/'
// }

if (Platform.OS === 'ios' || Platform.OS === 'android') {
    baseURL = 'http://192.168.68.106:4000/api/v1/';
} else {
    baseURL = 'http://192.168.68.240:4000/api/v1/';
}

// if (Platform.OS === 'ios' || Platform.OS === 'android') {
//     baseURL = 'https://epharmacylocator-backend.onrender.com/api/v1/';
// } else {
//     baseURL = 'http://192.168.68.207:4000/api/v1/';
// }

export default baseURL;