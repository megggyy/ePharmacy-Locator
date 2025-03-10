import React, { useState, useCallback, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView
} from "react-native";
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
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(null); // Stores selected rating filter
  const [averageRating, setAverageRating] = useState(0);
  const { state } = useContext(AuthGlobal);

  useFocusEffect(
    useCallback(() => {
      const fetchFeedbacks = async () => {
        try {
          const response = await axios.get(`${baseURL}feedbacks/pharmacy/${state.user.userId}`);
          setFeedbacks(response.data);
          calculateAverageRating(response.data);
          setFilteredFeedbacks(response.data); // Initially show all reviews
        } catch (error) {
          console.error("Error fetching feedback details:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchFeedbacks();
      const interval = setInterval(fetchFeedbacks, 5000);

      return () => {
        clearInterval(interval);
        fetchFeedbacks();
        setLoading(true);
      };
    }, [state.user.userId])
  );

  // Calculate average rating
  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) {
      setAverageRating(0);
      return;
    }
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    setAverageRating((total / reviews.length).toFixed(1)); // Round to 1 decimal place
  };

  // Star rating filter
  const filterByStars = (stars) => {
    setSelectedFilter(stars);
    if (stars === null) {
      setFilteredFeedbacks(feedbacks);
    } else {
      setFilteredFeedbacks(feedbacks.filter(review => review.rating === stars));
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? 'star' : 'star-outline'}
        size={20}
        color={i < rating ? 'black' : 'darkgray'}
      />
    ));
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/drawer/PharmacyOwnerDrawer')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Image source={require('@/assets/images/epharmacy-logo.png')} style={styles.logo} />
            <Text style={styles.title}>ePharmacy</Text>
          </View>

          <ScrollView>
            <View style={styles.reviewContainer}>

              {/* Average Rating */}
              <View style={styles.averageRatingContainer}>
                <Text style={styles.averageText}>Average Rating: </Text>
                <Text style={styles.averageScore}>{averageRating}</Text>
                <View style={styles.starsContainer}>{renderStars(Math.round(averageRating))}</View>
              </View>

              {/* Star Rating Filter */}
              <View style={styles.filterContainer}>
                {[5, 4, 3, 2, 1].map(star => (
                  <TouchableOpacity
                    key={star}
                    style={[styles.filterButton, selectedFilter === star && styles.selectedFilter]}
                    onPress={() => filterByStars(selectedFilter === star ? null : star)}
                  >
                    <Text style={styles.filterText}>{star} ⭐</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Reviews List */}
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map(feedback => (
                  <View key={feedback._id} style={styles.reviewCard}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>
                        {feedback.customer?.name || "Anonymous"}
                      </Text>
                      <View style={styles.starsContainer}>
                        {renderStars(feedback.rating)}
                      </View>
                    </View>
                    {feedback.comment && <Text style={styles.value}>{feedback.comment}</Text>}
                  </View>
                ))
              ) : (
                <Text style={styles.noReviewsText}>No reviews available</Text>
              )}

            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#005b7f',
    paddingTop: 20,
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
  averageRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  averageText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  averageScore: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#005b7f",
    marginHorizontal: 5,
  },
  starsContainer: {
    flexDirection: "row",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: "#D3D3D3",
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  selectedFilter: {
    backgroundColor: "#005b7f",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  reviewCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  value: {
    fontSize: 15,
    color: "#555",
    marginTop: 5,
    fontStyle: "italic",
  },
  noReviewsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
});

export default ListReviewsScreen;
