import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import for back arrow icon
import { useRouter } from 'expo-router';

const PrivacyPolicyScreen = () => {
    const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Top bar with back arrow and title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.contentText}>
            <Text style={styles.sectionTitle}>1. Introduction</Text>{'\n'}
            Welcome to the ePharmacy Locator System. Your privacy is important to us. This policy outlines how we collect, store, and protect your information, including prescription data.{"\n\n"}
            
            <Text style={styles.sectionTitle}>2. Information We Collect</Text>{'\n'}
            We collect the following types of information when you use our service:{"\n"}
            - Personal Information (e.g., name, email, contact details){"\n"}
            - Location data to find nearby pharmacies (only with your permission){"\n"}
            - Uploaded prescriptions, including images and scanned text {"\n"}
            {/* - Pharmacy searches and interactions within the system{"\n\n"} */}
            
            <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>{'\n'}
            Your data is used to:{"\n"}
            - Provide accurate pharmacy and medication availability information.{"\n"}
            - Store and retrieve uploaded prescriptions for easy access.{"\n"}
            - Improve user experience and system functionality.{"\n"}
            {/* - Ensure security and compliance with medical data protection laws.{"\n\n"} */}
            
            <Text style={styles.sectionTitle}>4. Prescription Storage and Security</Text>{'\n'}
            - Uploaded prescriptions are securely stored in an encrypted database.{"\n"}
            {/* - Only authorized users (you and verified pharmacies) can access your prescription data.{"\n"} */}
            - We do not share prescription data with third parties without user consent.{"\n\n"}
            
            <Text style={styles.sectionTitle}>5. Data Retention</Text>{'\n'}
            - Prescription records are stored only as long as necessary for service fulfillment.{"\n"}
            - Users can request deletion of their data at any time.{"\n\n"}
            
            <Text style={styles.sectionTitle}>6. Your Rights and Choices</Text>{'\n'}
            - You have the right to access, or modify your personal information.{"\n"}
            - You can manage location permissions in your device settings.{"\n"}
            - If you have concerns about your privacy, contact our support team.{"\n\n"}
            
            <Text style={styles.sectionTitle}>7. Contact Information</Text>{'\n'}
            For any privacy-related questions or requests, please contact us at: epharmacylocator4@gmail.com{"\n\n"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B607E',
    height: 75,
    paddingHorizontal: 15,
  },
  backButton: {
    paddingRight: 10,
    marginTop: 0,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 0,
  },
  contentContainer: {
    padding: 16,
  },
  textContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  contentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default PrivacyPolicyScreen;
