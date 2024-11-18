import React, { useState, useContext } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'; 
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AuthGlobal from '../../../context/AuthGlobal';
import { loginUser } from '../../../context/AuthActions';
import { useRouter } from 'expo-router';
import Toast from "react-native-toast-message";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Add this import

const LoginScreen = () => {
  const { state, dispatch } = useContext(AuthGlobal); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const router = useRouter();

  // const handleSubmit = async () => {
  //   const user = { email: email.trim(), password: password.trim() };
  //   await loginUser(user, dispatch);
  //   if (state.isAuthenticated) {
  //     router.push('../../(tabs)');
  //   } else {
  //     Toast.show({
  //       topOffset: 60,
  //       type: "error",
  //       text1: "PLEASE PROVIDE CORRECT CREDENTIALS!"
  //     });
  //   }
  // };

  const handleSubmit = async () => {
    const user = { email: email.trim(), password: password.trim() };
    const response = await loginUser(user, dispatch);

    if (response.success) {
        router.push('../../(tabs)');
    } else {
        switch (response.message) {
            case "EMAIL_NOT_FOUND":
                Toast.show({
                    topOffset: 60,
                    type: "error",
                    text1: "EMAIL IS NOT EXISTING",
                    text2: "PLEASE CHECK YOUR EMAIL AND TRY AGAIN.",
                });
                break;
            case "INCORRECT_PASSWORD":
                Toast.show({
                    topOffset: 60,
                    type: "error",
                    text1: "INCORRECT PASSWORD",
                    text2: "PLEASE CHECK YOUR PASSWORD AND TRY AGAIN.",
                });
                break;
            case "NETWORK_ERROR":
                Toast.show({
                    topOffset: 60,
                    type: "error",
                    text1: "NETWORK ERROR",
                    text2: "UNABLE TO CONNECT TO THE SERVER. PLEASE TRY AGAIN LATER",
                });
                break;
            default:
                Toast.show({
                    topOffset: 60,
                    type: "error",
                    text1: "LOGIN FAILED",
                    text2: "AN UNEXPECTED ERROR OCUURED. PLEASE TRY AGAIN LATER.",
                });
        }
    }
};

  AsyncStorage.getAllKeys((err, keys) => {
    AsyncStorage.multiGet(keys, (error, stores) => {
      stores.map((result, i, store) => {
        console.log({ [store[i][0]]: store[i][1] });
        return true;
      });
    });
  });

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <View style={styles.upperSection}>
        <Image source={require('@/assets/images/epharmacy-logo.png')} style={styles.icon} />
        <Text style={styles.appName}>ePharmacy</Text>
      </View>
      <View style={styles.lowerSection}>
        <Text style={styles.welcomeBackText}>Welcome back!</Text>
        <Text style={styles.subText}>Log in to your account</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Email Address" 
          placeholderTextColor="#AAB4C1" 
          value={email} 
          onChangeText={setEmail} 
        />
        <View style={styles.passwordContainer}>
          <TextInput 
            style={[styles.inputPass, { flex: 1 }]} 
            placeholder="Password" 
            placeholderTextColor="#AAB4C1" 
            secureTextEntry={!showPassword} 
            value={password} 
            onChangeText={setPassword} 
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Icon 
              name={showPassword ? "eye-off" : "eye"} 
              size={24} 
              color="#AAB4C1" 
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
        <Text style={styles.signupText}>
          Don’t have an account?{' '}
          <Text style={styles.signupLink} onPress={() => router.push('/screens/Auth/SignupRoleScreen')}>
            Signup
          </Text>
        </Text>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  upperSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A6A83',
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  lowerSection: {
    flex: 3,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  welcomeBackText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#B0B0B0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    fontSize: 16,
  },
  inputPass: {
    paddingLeft: 12,
    borderRadius: 8,
    marginVertical: 10,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B0B0B0',
    borderRadius: 8,
    marginVertical: 10,
    paddingRight: 10,
  },
  eyeIcon: {
    padding: 9,
    paddingRight: 5,
  },
  loginButton: {
    backgroundColor: '#4A8691',
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },
  forgotText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
  },
  signupText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  signupLink: {
    color: '#357B8E',
    fontWeight: '600',
  },
});

export default LoginScreen;
