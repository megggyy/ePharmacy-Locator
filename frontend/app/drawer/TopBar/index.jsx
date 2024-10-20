import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const TopBar = () => {
  const router = useRouter();

  return (
    <View style={styles.topSection}>
    {/* Header with Location and Icons */}
    <View style={styles.header}>
      <Ionicons name="menu" style={styles.menuIcon} onPress={() => router.push('/drawer/UserDrawer')}/>        
      <View style={styles.locationWrapper}>
        <Text style={styles.location}>7A Alley</Text>
        <Text style={styles.location}>Taguig</Text>
      </View>  
      <View style={styles.iconsWrapper}>
        <Ionicons name="cloud-upload" style={styles.icon} onPress={() => router.push('/screens/User/Features/PrescriptionUpload')} />
      </View>
    </View>
      {/* Search Bar */}
      <TextInput style={styles.searchBar} placeholder="Search..."  placeholderTextColor="#AAB4C1"/>
    </View>
  );
};

const styles = StyleSheet.create({
    topSection: { 
        paddingHorizontal: 16,
        paddingBottom: 10, 
        borderBottomLeftRadius: 25, 
        borderBottomRightRadius: 25, 
      },
      header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: 10,
      },
      locationWrapper: { flex: 1, marginLeft: 10 },
      location: { fontSize: 16, color: '#fff' },

  menuIcon: {
    fontSize: 30,
    color: '#fff',
  },
  icon: { fontSize: 20, marginHorizontal: 10, color: '#fff'  },
  searchBar: { marginVertical: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
});

export default TopBar;
