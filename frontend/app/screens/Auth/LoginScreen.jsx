// LoginScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import AuthGlobal from '../../../context/Store/AuthGlobal'
import { loginUser } from '../../../context/Actions/Auth.actions'

const LoginScreen = () => {
  const context = useContext(AuthGlobal);
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");

  // useEffect(() => {
  //   if (context.stateUser.isAuthenticated) {
  //     navigation.navigate("HomeScreen");
  //   }
  // }, [context.stateUser.isAuthenticated]);

  const handleSubmit = () => {
    const user = { email, password };

    if (email === "" || password === "") {
      setError("INCORRECT PASSWORD OR EMAIL");
    } else {
      loginUser(user, context.dispatch);
      console.log("error");
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.upperSection}>
        <Image source={require('@/assets/images/epharmacy-logo.png')} style={styles.icon} />
        <Text style={styles.appName}>ePharmacy</Text>
      </View>
      <View style={styles.lowerSection}>
        <Text style={styles.welcomeBackText}>Welcome back!</Text>
        <Text style={styles.subText}>Log in to your account</Text>
        <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#AAB4C1" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#AAB4C1" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.loginButton} onPress={() => handleSubmit()}>
          <Text style={styles.buttonText} >Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
        <Text style={styles.signupText}>
          Don’t have an account? <Text style={styles.signupLink} onPress={() => router.push('/screens/Auth/SignupRoleScreen')}>Signup</Text>
        </Text>
      </View>
    </View>
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
