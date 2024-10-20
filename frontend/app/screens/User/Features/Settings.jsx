import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Importing Ionicons for back button icon
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Settings</Text>
      </View>

      {/* Settings Options */}
      <TouchableOpacity style={styles.option} onPress={() => router.push('/screens/User/Features/FAQs')}>
        <Text style={styles.optionText}>FAQs</Text>
        <Ionicons name="chevron-forward" size={20} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => router.push('/screens/User/Features/PrivacyPolicy')}>
        <Text style={styles.optionText}>Privacy Policy</Text>
        <Ionicons name="chevron-forward" size={20} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#005b7f',
    paddingTop: 60, // Status bar height
    paddingBottom: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  option: {
    backgroundColor: 'white',
    padding: 15,
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3, // Shadow effect for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  optionText: {
    fontSize: 16,
    color: 'black',
  },
});
