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
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque ab veniam dolores minus
            voluptas dolorem ipsam omnis unde rem, fugiat perferendis voluptates nulla odio
            consequuntur, ullam qui recusandae porro quisquam! Optio amet obcaecati minima velit
            ipsum labore, aspernatur ratione sed aliquid officiis voluptas quis quod numquam id
            harum voluptate quia consequuntur eos error illo sequi. Ullam quae in reprehenderit
            quas consequuntur recusandae quasi velit libero saepe! Voluptate magni quas laborum
            aspernatur a officiis. Tempore ab nesciunt esse cupiditate repellat soluta quasi
            dolorum velit dolores explicabo facilis nihil enim impedit doloremque voluptas sapiente
            fuga, aliquam ullam a repudiandae est quas aperiam.
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
    backgroundColor: '#005b7f',
    height: 100,
    paddingHorizontal: 15,
  },
  backButton: {
    paddingRight: 10,
    marginTop:30,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop:30,
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
});

export default PrivacyPolicyScreen;
