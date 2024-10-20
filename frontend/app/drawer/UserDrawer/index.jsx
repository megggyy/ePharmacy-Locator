import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Sidebar() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={require('@/assets/images/sample.jpg')} // Replace with actual image
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>Shanai Meg G. Honrado</Text>
      </View>

      {/* Menu Section */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/screens/User/Profile/EditProfileScreen')}>
          <FontAwesome5 name="user-edit" size={25} color="#5A5A5A" />
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/screens/User/Features/SuggestedMedicine')}>
          <FontAwesome5 name="prescription-bottle" size={25} color="#5A5A5A" />
          <Text style={styles.menuText}>Suggested Medicine</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/screens/User/Features/Maps')}>
          <FontAwesome5 name="map-marker-alt" size={25} color="#5A5A5A" />
          <Text style={styles.menuText}>Maps</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/screens/User/Features/Settings')}>
          <FontAwesome5 name="cog" size={25} color="#5A5A5A" />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/account')}>
          <FontAwesome5 name="sign-out-alt" size={25} color="#5A5A5A" />
          <Text style={styles.menuText}>Log out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/screens/Admin/dashboard')}>
          <FontAwesome5 name="sign-out-alt" size={25} color="#5A5A5A" />
          <Text style={styles.menuText}>Test sa admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#0B607E', // Keep the header background blue
    paddingTop: 100,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75, // Circular image
    marginBottom: 10,
  },
  profileName: {
    color: 'white', // Keep the profile name white
    fontSize: 25,
    fontWeight: 'bold',
  },
  menuSection: {
    marginTop: 20,
    backgroundColor: 'white', // White background for the menu section
    paddingHorizontal: 20,
    flex: 1, // To take up the remaining space
    borderTopLeftRadius: 20, // Rounded corners for a nice look
    borderTopRightRadius: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuText: {
    fontSize: 18,
    marginLeft: 15,
    color: '#5A5A5A', // Dark text color for better contrast on white background
  },
});
