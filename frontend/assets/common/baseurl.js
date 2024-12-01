import { Platform } from 'react-native'


let baseURL = '';

// {Platform.OS == 'ios'
// ? baseURL = 'http://192.168.1.24:4000/api/v1/'
// : baseURL = 'http://192.168.1.240:4000/api/v1/'
// }

{Platform.OS == 'ios'
    ? baseURL = 'http://192.168.68.100:4000/api/v1/'
    : baseURL = 'http://192.168.68.207:4000/api/v1/'
    }
export default baseURL;