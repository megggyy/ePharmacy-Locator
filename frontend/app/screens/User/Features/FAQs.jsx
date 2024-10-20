import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import for back arrow icon
import { useRouter } from 'expo-router';

const FAQScreen = () => {
  const router = useRouter();
  
  // Sample FAQ data
  const faqData = [
    { question: 'What is this app about?', answer: 'This app is designed to help users easily locate pharmacies, view available medications, and scan prescriptions for better convenience.' },
    { question: 'How do I use the app?', answer: 'You can search for pharmacies by location, scan your prescription to find matching pharmacies, and directly contact or visit them.' },
    { question: 'Is my data safe?', answer: 'Yes, we take your privacy and data security very seriously. All personal information is encrypted and protected.' },
    { question: 'How can I contact support?', answer: 'You can reach out to our support team via the contact form on the app or through our customer support email provided in the app.' }
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
    backgroundColor: '#005b7f',
    height: 100,
    paddingHorizontal: 15,
  },
  backButton: {
    paddingRight: 10,
    marginTop: 30,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
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
