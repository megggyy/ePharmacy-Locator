import React, { useState, useCallback, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert
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
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const { state } = useContext(AuthGlobal);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [comment, setComment] = useState('');
  const [replyExists, setReplyExists] = useState(false);
  const [existingReply, setExistingReply] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (state.user?.role !== "PharmacyOwner") return;

      const fetchFeedbacks = async () => {
        try {
          const response = await axios.get(`${baseURL}feedbacks/pharmacy/${state.user.userId}`);
          setFeedbacks(response.data);
          calculateAverageRating(response.data);
          setFilteredFeedbacks(response.data);
        } catch (error) {
          console.error("Error fetching feedback details:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchFeedbacks();
    }, [state.user.userId, state.user.role])
  );

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) {
      setAverageRating(0);
      return;
    }
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    setAverageRating((total / reviews.length).toFixed(1));
  };

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

  const openModal = async (review) => {
    setSelectedReview(review);
    setModalVisible(true);
    // setComment('');
    // setReplyExists(false);
    // setExistingReply(null);

    try {
      const response = await axios.get(`${baseURL}feedbacks/checkReply/${review._id}`);
      if (response.data.exists) {
        setReplyExists(true);
        setExistingReply(response.data.feedbacks[0]);
      } else {
        setReplyExists(false);
      }
    } catch (error) {
      console.error("Error checking for existing reply:", error);
      Alert.alert('Error', 'Failed to check for existing reply');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReview(null);
    setComment('');
    setReplyExists(false);
    setExistingReply(null);
    setIsEditing(false);
  };


  const handleCreate = async () => {
    if (!comment.trim()) {
      Alert.alert('Validation', 'Please enter a reply before submitting.');
      return;
    }

    const reviewData = {
      comment: comment,
    };

    const config = {
      headers: {
        "Content-Type": "application/json",
      }
    };

    try {
      let response;

      if (replyExists) {
        // Update existing reply
        response = await axios.put(
          `${baseURL}feedbacks/reply/${selectedReview._id}`,
          reviewData,
          config
        );
      } else {
        // Create new reply
        response = await axios.post(
          `${baseURL}feedbacks/reply/${selectedReview._id}`,
          reviewData,
          config
        );
      }

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', replyExists ? 'Updated successfully' : 'Replied successfully');
        closeModal();
        setIsEditing(false);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reply';
      console.error('Error replying:', errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };



  const handleEdit = () => {
    if (existingReply) {
      setComment(existingReply.comment);
      setIsEditing(true);
    }
  };

  const handleDelete = (reviewId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this reply?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(`${baseURL}feedbacks/reply-delete/${reviewId}`);
              if (response.status === 200) {
                Alert.alert('Success', 'Deleted successfully');
                closeModal();
              }
            } catch (error) {
              const errorMessage = error.response?.data?.message || error.message || 'Failed to delete';
              console.error('Error deleting:', errorMessage);
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/drawer/PharmacyOwnerDrawer')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Image source={require('@/assets/images/epharmacy-logo.png')} style={styles.logo} />
            <Text style={styles.title}>ePharmacy</Text>
          </View>

          <ScrollView>
            <View style={styles.reviewContainer}>
              <View style={styles.averageRatingContainer}>
                <Text style={styles.averageText}>Average Rating: </Text>
                <Text style={styles.averageScore}>{averageRating}</Text>
                <View style={styles.starsContainer}>{renderStars(Math.round(averageRating))}</View>
              </View>

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

              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map(feedback => (
                  <TouchableOpacity
                    key={feedback._id}
                    style={styles.reviewCard}
                    onPress={() => openModal(feedback)}
                  >
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>
                        {feedback.name ? feedback.customer.name : "Anonymous"}
                      </Text>
                      <View style={styles.starsContainer}>
                        {renderStars(feedback.rating)}
                      </View>
                    </View>

                    {feedback.comment && (
                      <Text style={styles.value}>{feedback.comment}</Text>
                    )}

                    {feedback.timestamp && (
                      <Text style={styles.timestamp}>
                        {new Date(feedback.timestamp).toLocaleString()}
                      </Text>
                    )}
                  </TouchableOpacity>

                ))
              ) : (
                <Text style={styles.noReviewsText}>No reviews available</Text>
              )}
            </View>
          </ScrollView>

          {/* Modal for Review Details */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {selectedReview && (
                  <>
                    <Text style={styles.modalTitle}>{selectedReview.name ? selectedReview.customer.name : "Anonymous"}</Text>
                    <View style={styles.starsContainer}>
                      {renderStars(selectedReview.rating)}
                    </View>
                    <Text style={styles.modalComment}>{selectedReview.comment}</Text>

                    {/* TextInput for reply */}
                    {replyExists && !isEditing ? (
                      <View style={styles.replyContainer}>
                        <Text style={styles.replyLabel}>Your Reply:</Text>

                        <View style={styles.replyBox}>
                          <Text style={styles.replyContent}>{existingReply.comment}</Text>
                          {existingReply.timestamp && (
                            <Text style={styles.replyTimestamp}>
                              {new Date(existingReply.timestamp).toLocaleString()}
                            </Text>
                          )}
                        </View>

                        <View style={styles.buttonRow}>
                          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                            <Text style={styles.editButtonText}>Edit</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(existingReply._id)}>
                            <Text style={styles.editButtonText}>Delete</Text>
                          </TouchableOpacity>
                        </View>

                      </View>
                    ) : (
                      <>
                        <TextInput
                          style={styles.replyInput}
                          placeholder="Type your reply here..."
                          value={comment}
                          onChangeText={setComment}
                          multiline
                          textAlignVertical="top"
                        />
                        <TouchableOpacity style={styles.modalSubmit} onPress={handleCreate} activeOpacity={0.8}>
                          <Text style={styles.buttonText}>{replyExists ? 'Update Reply' : 'Submit Reply'}</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    <TouchableOpacity style={styles.modalClose} onPress={closeModal} activeOpacity={0.8}>
                      <Text style={styles.modalTextClose}>Close</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },

  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'stretch',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },

  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 0,
  },

  modalComment: {
    fontSize: 16,
    marginBottom: 15,
    color: '#444',
    lineHeight: 20,
    textAlign: 'center',
  },

  replyInput: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: '100%',
    backgroundColor: '#f7f7f7',
    fontSize: 14,
  },

  modalSubmit: {
    backgroundColor: '#005b7f',
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 5,
    alignItems: 'center',
  },

  modalClose: {
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },

  modalTextClose: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },

  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  replyContainer: {
    marginTop: 5,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },

  replyBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },

  replyContent: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },

  editButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#005b7f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 0,
  },

  deleteButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'black',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 0,
  },

  editButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
  },
  replyLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },

  replyTimestamp: {
    fontSize: 12,
    marginBottom: 0,
    color: '#444',
    lineHeight: 20,
    textAlign: 'right',
  },
  timestamp: {
    fontSize: 12,
    marginBottom: 0,
    color: '#444',
    lineHeight: 20,
    textAlign: 'right',
  }
});

export default ListReviewsScreen;
