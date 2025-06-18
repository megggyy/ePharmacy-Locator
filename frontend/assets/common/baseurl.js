import { Platform } from 'react-native'


let baseURL = '';


if (Platform.OS === 'ios' || Platform.OS === 'android') {
    baseURL = 'http://172.16.70.94:4000/api/v1/';
} else {
    baseURL = 'http://172.16.70.94:4000/api/v1/';
}

// if (Platform.OS === 'ios' || Platform.OS === 'android') {
//     baseURL = 'https://epharmacylocator-backend.onrender.com/api/v1/';
// } else {
//     baseURL = 'http://192.168.0.111:4000/api/v1/';
// }

if (Platform.OS === 'ios' || Platform.OS === 'android') {
    baseURL = 'https://epharmacylocator-backend.onrender.com/api/v1/';
} else {
    baseURL = 'https://epharmacylocator-backend.onrender.com/api/v1/';
}

export default baseURL;

//   baseURL = 'https://epharmacylocator-backend.onrender.com/api/v1/';
// http://192.168.0.111:4000/api/v1/