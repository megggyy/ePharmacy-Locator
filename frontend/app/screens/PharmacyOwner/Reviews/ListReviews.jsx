import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import { DataTable, Searchbar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useRouter } from 'expo-router';
import baseURL from "../../../../assets/common/baseurl";
import Spinner from "../../../../assets/common/spinner";
import AuthGlobal from '@/context/AuthGlobal';

const ListReviewsScreen = () => {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { state, dispatch } = useContext(AuthGlobal);

  useFocusEffect(
    React.useCallback(() => {
      const fetchFeedbacks = async () => {
        try {
          const response = await axios.get(`${baseURL}feedbacks/pharmacy/${state.user.userId}`);
          setFeedbacks(response.data);
        } catch (error) {
          console.error("Error fetching feedback details:", error);
        } finally {
          setLoading(false); // ✅ Ensure loading stops after fetch
        }
      };

      fetchFeedbacks();
    }, [state.user.userId])
  );


  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={20}
          color={i <= rating ? 'black' : 'darkgray'}
        />
      );
    }
    return stars;
  };


  return (
    <View style={styles.container}>
      {loading ? (
        <Spinner /> // Show the custom spinner component when loading
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/drawer/PharmacyOwnerDrawer')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Image
              source={require('@/assets/images/epharmacy-logo.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>ePharmacy</Text>
          </View>
          <ScrollView>
            <View style={styles.reviewContainer}>
              <View>
                {feedbacks.length > 0 ? (
                  feedbacks.map((feedback, index) => (
                    <View key={feedback._id} style={styles.reviewCard}>
                      {/* Customer Name and Rating in the Same Row */}
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>
                        {feedback.name ? feedback.customer?.name : "Anonymous"}
                        </Text>
                        <View style={styles.starsContainer}>
                          {renderStars(feedback.rating)}
                        </View>
                      </View>

                      {/* Show comment only if it's not empty */}
                      {feedback.comment && (
                        <>
                          <Text style={styles.value}>{feedback.comment}</Text>
                        </>
                      )}
                    </View>
                  ))
                ) : (
                  <Text />
                )}
              </View>
            </View >
          </ScrollView>
        </>
      )}
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#005b7f',
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  reviewContainer: {
    padding: 20
  },
  reviewCard: {
    padding: 20,
    backgroundColor: '#4A8691',
    borderRadius: 10,
    marginBottom: 20
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
    justifyContent: 'center',
    textAlign: 'center',
    marginVertical: 15
  },
  reviewCard: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: "row", // Aligns items in a row
    alignItems: "center", // Aligns vertically
    justifyContent: "space-between", // Spaces name and rating evenly
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  starsContainer: {
    flexDirection: "row",
    marginLeft: 10, // Space between name and rating
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  value: {
    fontSize: 15,
    color: "#555",
    marginTop: 5,
    fontStyle: "italic",
  },
});

export default ListReviewsScreen;
