import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For the back icon
import { useRouter } from 'expo-router';

const ChangePasswordScreen = () => {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdatePassword = () => {
    // Logic to handle password update
    console.log('Updating password...');
  };

  return (
    <View style={styles.container}>
      {/* Back Button and Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Change Password</Text>
      </View>

      {/* Input Fields Section */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Old Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Old Password"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <Text style={styles.label}>New Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <Text style={styles.label}>Re-type Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-type Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      {/* Update Password Button */}
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePassword}>
        <Text style={styles.updateButtonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    backgroundColor: '#0B607E',
    paddingTop: 80,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  headerText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 20,
  },
  label: {
    color: '#666',
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#F4F4F4',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  updateButton: {
    backgroundColor: '#0B607E',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 420,
    marginBottom: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;
