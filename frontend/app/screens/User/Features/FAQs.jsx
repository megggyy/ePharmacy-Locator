import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import for back arrow icon
import { useRouter } from 'expo-router';

const FAQScreen = () => {
  const router = useRouter();

  // Updated FAQ data
  const faqData = [
    { 
      question: 'What is the ePharmacy Locator app?', 
      answer: 'The ePharmacy Locator app helps users find pharmacies near them, check medication availability, and scan prescriptions for better accessibility.' 
    },
    { 
      question: 'How does the prescription scanning feature work?', 
      answer: 'You can take a photo of your prescription, and our system will extract the text and identify the medicines listed. You can then check which pharmacies have them in stock.' 
    },
    { 
      question: 'How are pharmacies verified?', 
      answer: 'Pharmacies listed in the app go through an approval process. The admin validates if the pharmacy is registered with the FDA before it appears in search results.' 
    },
    { 
      question: 'Is my personal information secure?', 
      answer: 'Yes, your personal data and prescription scans are encrypted and stored securely. We follow strict data privacy policies to protect your information.' 
    },
    { 
      question: 'Can I search for medicines by name?', 
      answer: 'Yes! You can enter a medicine name in the search bar to check which pharmacies near you have it in stock.' 
    },
    { 
      question: 'Can I buy medicines directly through the app?', 
      answer: 'No, the app only helps you locate pharmacies that have the medicine you need. You will need to visit the pharmacy to purchase medications.' 
    },
    { 
      question: 'Does the app work on all devices?', 
      answer: 'The ePharmacy Locator is optimized for smartphones, laptops, and computers. However, some older devices may experience minor compatibility issues.' 
    },
    { 
      question: 'How can I contact support?', 
      answer: 'You can reach our support team through the contact form in the app or via email provided in the settings section.' 
    }
  ];

  // State to handle expanded answers
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index); // Toggle the selected FAQ
  };

  return (
    <View style={styles.container}>
      {/* Top bar with back arrow and title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>FAQs</Text>
      </View>

      {/* Scrollable FAQ content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {faqData.map((faq, index) => (
          <View key={index} style={styles.faqContainer}>
            <TouchableOpacity onPress={() => toggleExpand(index)}>
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>{faq.question}</Text>
                <Ionicons 
                  name={expandedIndex === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="gray" 
                />
              </View>
            </TouchableOpacity>
            {expandedIndex === index && (
              <View style={styles.answerContainer}>
                <Text style={styles.answerText}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}
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
  faqContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  answerContainer: {
    marginTop: 10,
  },
  answerText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});

export default FAQScreen;
