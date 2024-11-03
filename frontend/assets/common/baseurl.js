import { Platform } from 'react-native'


let baseURL = '';

// {Platform.OS == 'ios'
// ? baseURL = 'http://192.168.1.24:4000/api/v1/'
// : baseURL = 'http://192.168.1.240:4000/api/v1/'
// }

{Platform.OS == 'ios'
    ? baseURL = 'http://192.168.68.104:4000/api/v1/'
    : baseURL = 'http://192.168.68.204:4000/api/v1/'
    }
export default baseURL;