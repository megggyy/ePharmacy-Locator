import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

const RoleSelectionScreen = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Upper section for the logo and text */}
      <View style={styles.upperSection}>
        <Image source={require('@/assets/images/epharmacy-logo.png')} style={styles.icon} />
        <Text style={styles.appName}>ePharmacy</Text>
        <Text style={styles.question}>Are you?</Text>
      </View>

      {/* Lower section for buttons */}
      <View style={styles.lowerSection}>
        {/* <TouchableOpacity style={styles.button} onPress={() => router.push('/')}>
          <Text style={styles.buttonText}>Employee</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/User/Account/CustomerSignupScreen')}>
          <Text style={styles.buttonText}>Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/PharmacyOwner/Account/CheckLicense')}>
          <Text style={styles.buttonText}>Pharmacy Owner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F6580',
    justifyContent: 'center',
  },
  upperSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  question: {
    fontSize: 18,
    color: '#fff',
    marginTop: 10,
  },
  lowerSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginVertical: 10,
    width: '70%',
  },
  buttonText: {
    color: '#00A896',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
