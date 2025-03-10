import React, { useEffect, useState, useContext } from 'react';
import { Switch, View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import AuthGlobal from '@/context/AuthGlobal';
import baseURL from '@/assets/common/baseurl';
import { LinearGradient } from 'expo-linear-gradient';
import StarRating from "@/assets/common/starRating";
import Spinner from "@/assets/common/spinner";
import Toast from 'react-native-toast-message';

const PharmacyDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [medicationData, setMedicationData] = useState([]);
  const [category, setCategory] = useState('');
  const [isCategory, setIsCategory] = useState({});
  const [feedbacks, setFeedbacks] = useState([]);
  const [updateFeedback, setUpdateFeedback] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('false');
  const [editingReview, setEditingReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(true);
  const [shareCustomerInfo, setShareCustomerInfo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shop');
  const [search, setSearch] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [categories, setCategories] = useState([]);

  const [error, setError] = useState('');
  const { state } = useContext(AuthGlobal);

  console.log(state)
  useEffect(() => {
    console.log("Fetching pharmacy with ID:", id);
    const fetchPharmacyDetails = async () => {
      try {
        const response = await axios.get(`${baseURL}pharmacies/${id}`);
        setPharmacy(response.data);
      } catch (error) {
        // console.error("Error fetching pharmacy details:", error);
      }
    };

    const fetchMedicineStocks = async () => {
      try {
        const response = await axios.get(`${baseURL}medicine/features/${id}`);
        setMedicationData(response.data || []); // Ensure it's always an array
      } catch (error) {
        console.error("Error fetching medicine stocks:", error);
      }
    };

    const fetchCategoriesWithMedicines = async () => {
      try {
        const response = await axios.get(`${baseURL}medicine/features/${id}`);
        const stockData = response.data || [];
        const categoryMap = {};

        stockData.forEach((stockItem) => {
          const medicine = stockItem.medicine;
          if (medicine && Array.isArray(medicine.category)) {
            medicine.category.forEach((cat) => {
              if (cat.name) {
                categoryMap[cat.name] = (categoryMap[cat.name] || 0) + 1;
              }
            });
          }
        });

        const categoryList = Object.keys(categoryMap).map((categoryName) => ({
          name: categoryName,
          count: categoryMap[categoryName],
        }));

        setCategories(categoryList);
        console.log("Stock data:", stockData);
        console.log("Extracted categories:", categoryList);
      } catch (error) {
        console.error('Error fetching medicine categories:', error);
      }
    };

    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(`${baseURL}feedbacks/${id}`);
        setFeedbacks(response.data);
      } catch (error) {
        // console.error("Error fetching pharmacy details:", error);
      }
    };

  
    const fetchData = () => {
      Promise.all([
        fetchPharmacyDetails(),
        fetchMedicineStocks(),
        fetchCategoriesWithMedicines(),
        fetchFeedbacks(),

      ]).finally(() => setLoading(false));
    };
    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [id]);

  useEffect(() => {
    if (medicationData.length > 0) {
      const firstMedicine = medicationData[0].medicine;
      if (firstMedicine?.category) {
        const newCategory = Array.isArray(firstMedicine.category)
          ? firstMedicine.category.map((cat) => cat.name).join('/ ')
          : firstMedicine.category?.name || 'No Category';

        setCategory(newCategory);
      }
    }
  }, [medicationData]);

  useEffect(() => {
    const fetchCustomerFeedbacks = async () => {
      if (!state.user?.userId) {
        setShowReviewForm(false); // Hide the review form
        return;
      }

      try {
        const response = await axios.get(`${baseURL}feedbacks/customer/${state.user.userId}`);

        if (response.data?.exists) {
          setShowReviewForm(false);
        } else {
          setShowReviewForm(true);
        }
      } catch (error) {
        console.error("Error fetching customer feedback:", error?.response?.data || error.message);
      }
    };
    fetchCustomerFeedbacks()

  }, []);

  const handleCategoryClick = (category) => {
    if (!id) {
      console.error("Pharmacy ID is missing!");
      return;
    }

    if (!category?.name) {
      console.error("Category name is missing!");
      return;
    }

    const route = `/screens/User/Features/FilterMedicinesByCategoryPerPharmacy?category=${encodeURIComponent(category.name)}&pharmacyId=${id}`;
    console.log("Navigating to:", route);
    router.push(route);
  };

  // Filter medicines based on search input
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredMedicines(medicationData);
    } else {
      const filtered = medicationData.filter((medication) =>
        medication.medicine?.brandName?.toLowerCase().includes(search.toLowerCase()) ||
        medication.medicine?.genericName?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredMedicines(filtered);
    }
  }, [search, medicationData]);

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

  const addReview = (pharmacyId) => {
    const reviewData = {
      customer: state.user.userId,
      comment: comment,
      rating: rating,
      pharmacy: pharmacyId,
      name: shareCustomerInfo,
    };

    const config = {
      headers: {
        "Content-Type": "application/json",
      }
    };

    axios.post(`${baseURL}feedbacks/create`, reviewData, config)
      .then((res) => {
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Review Added',
          visibilityTime: 4000,
          autoHide: true,
        });

        setRating(0);      // Reset rating
        setComment('');    // Reset comment
        setShowReviewForm(false); // Hide the review form
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: "ERROR!",
          text2: "PLEASE TRY AGAIN"
        });
      });
  };

  const updateReviewForm = async (feedbackId) => {
    try {
      const response = await axios.get(`${baseURL}feedbacks/updateFetch/${feedbackId}`);
      setUpdateFeedback(response.data); // Update state
      setRating(response.data.rating); // Ensure rating is set
      setComment(response.data.comment);
      setShareCustomerInfo(response.data.name);
      setEditingReview(true);// Set toggle based on name visibility
      setShowReviewForm(true);
    } catch (error) {
      console.error("Error fetching review for update:", error);
    }
  };


  const deleteReview = async (reviewId) => {
    try {
      const response = await axios.delete(`${baseURL}feedbacks/delete/${reviewId}`);
      if (response.status === 200) {
        Toast.show({ type: "success", text1: "REVIEW DELETED" });
        setShowReviewForm(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
      Toast.show({ type: "error", text1: "ERROR!", text2: "FAILED TO DELETE REVIEW" });
    }
  };

  const updateReview = async () => {

    const updatedData = {
      rating: rating,
      comment: comment,
      name: shareCustomerInfo, // Ensure 'name' field is sent
    };
    try {
      await axios.put(`${baseURL}feedbacks/update/${updateFeedback._id}`, updatedData);
      Toast.show({ type: "success", text1: "Review Updated" });

      // Reset form
      setShowReviewForm(false);
      setEditingReview(null);
      setRating(0);
      setComment("");

    } catch (error) {
      console.error("Error updating review:", error);
      Toast.show({ type: "error", text1: "ERROR!", text2: "Failed to update review" });
    }
  };


  const calculateAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    return (total / feedbacks.length).toFixed(1); // Keep 1 decimal place
  };

  if (loading) {
    return (
      <Spinner />
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
      </View>
    );
  }
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0B607E" />
      </View>
    );
  }

  const renderMedicines = () => (
    <View style={styles.medicineContainer}>
      {filteredMedicines.length > 0 ? (
        filteredMedicines.map((medication, index) => {
          const medDetails = medication.medicine || {};
          const categoryNames = medDetails.category
            ? medDetails.category.map(cat => cat.name).join(' / ')
            : 'No Category';
          const totalStock = medication.expirationPerStock?.reduce(
            (sum, stockItem) => sum + stockItem.stock,
            0
          ) || 0;

          return (
            <TouchableOpacity
              key={index}
              style={styles.medicineCard}
              onPress={() =>
                router.push(
                  `/screens/User/Features/ViewPharmacyMedicine?id=${medication._id}&pharmacyId=${id}`
                )
              }
            >
              {/* Medicine Header */}
              <View style={styles.medicineHeader}>
                <Text style={styles.medicineName}>{medDetails.brandName || 'Unknown'}</Text>
                <Text style={styles.medicineStock}>
                  {totalStock > 0 ? `${totalStock} in stock` : 'Out of Stock'}
                </Text>
              </View>

              {/* Generic Name */}
              <Text style={styles.genericName}>{medDetails.genericName || 'Unknown'}</Text>

              {/* Medicine Details */}
              <View style={styles.medicineDetails}>
                <Text style={styles.detailText}>💊 Dosage: {medDetails.dosageStrength || 'N/A'}</Text>
                <Text style={styles.detailText}>📌 Form: {medDetails.dosageForm || 'N/A'}</Text>
                <Text style={styles.detailText}>📂 Classification: {medDetails.classification || 'N/A'}</Text>
                <Text style={styles.detailText}>📋 Category: {categoryNames}</Text>
              </View>

              {/* Last Updated */}
              <Text style={styles.lastUpdated}>
                (Stock updated on {medication.timeStamps ? new Date(medication.timeStamps).toLocaleString() : 'No Date'})
              </Text>
            </TouchableOpacity>
          );
        })
      ) : (
        <Text style={styles.noMedicinesText}>No medicines available.</Text>
      )}
    </View>
  );



  const renderCategories = () => (
    <View style={styles.categoryContainer}>
      {categories.length > 0 ? (
        categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryCard}
            onPress={() => handleCategoryClick(category)}
          >
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryCount}>{category.count}</Text>
          </TouchableOpacity>

        ))
      ) : (
        <Text style={styles.noCategoriesText}>No categories available.</Text>
      )}
    </View>
  );

  const renderReviews = () => (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      extraScrollHeight={100} // Adjust scrolling when keyboard is open
      keyboardShouldPersistTaps="handled"
    >
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
                {feedback.comment && <Text style={styles.value}>{feedback.comment}</Text>}

                {/* Show Edit & Delete buttons if the logged-in user is the feedback owner */}
                {feedback.customer?._id === state.user?.userId && (
                  <View style={styles.updateContainer}>
                    <TouchableOpacity onPress={() => updateReviewForm(feedback._id)}>
                      <Ionicons name="pencil" size={20} color="#4A8691" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteReview(feedback._id)}>
                      <Ionicons name="trash" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text></Text>
          )}
        </View>

        {showReviewForm && (
          <>
            <Text style={styles.headerText}>
              {editingReview ? "EDIT YOUR REVIEW" : "RATE THIS PHARMACY"}
            </Text>
            <View style={styles.addReview}>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>RATING:</Text>
                <StarRating
                  maxStars={5}
                  rating={parseInt(rating) || 0} // Ensure rating is correctly set
                  onChangeRating={(newRating) => setRating(newRating.toString())} // Keep rating updated
                />

              </View>
              <Text style={styles.ratingLabel}>COMMENT:</Text>
              <TextInput
                value={comment}
                onChangeText={(text) => setComment(text)}
                style={styles.input}
              />

              {/* ✅ Add back the toggle switch */}
              <View style={styles.switchContainer}>
                <Text style={styles.ratingLabel}>SHARE MY INFO</Text>
                <Switch
                  value={shareCustomerInfo}
                  onValueChange={setShareCustomerInfo}
                  trackColor={{ false: "#ccc", true: "#000" }} // Change track color
                  thumbColor={shareCustomerInfo ? "#fff" : "#888"} // Change thumb color
                />
              </View>

              <TouchableOpacity
                onPress={editingReview ? updateReview : () => addReview(pharmacy._id)}
                style={styles.confirmButton}
              >
                <Text style={{ color: "white", textAlign: "center", fontSize: 20 }}>
                  {editingReview ? "UPDATE" : "ADD"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </View>

    </KeyboardAwareScrollView>

  );

  const renderContent = () => {
    if (activeTab === 'shop') {
      return (
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Pharmacy Details</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#555" />
            <Text style={styles.infoTextShop}>{pharmacy.userInfo.street} {pharmacy.userInfo.barangay}, {pharmacy.userInfo.city}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#555" />
            <Text style={styles.infoTextShop}>{pharmacy.userInfo.contactNumber}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#555" />
            <Text style={styles.infoTextShop}>
              {`${pharmacy.businessDays} (${pharmacy?.openingHour || 'N/A'} - ${pharmacy?.closingHour || 'N/A'})`}
            </Text>
          </View>

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: parseFloat(pharmacy.location.latitude),
                longitude: parseFloat(pharmacy.location.longitude),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation
            >
              <Marker
                coordinate={{
                  latitude: parseFloat(pharmacy.location.latitude),
                  longitude: parseFloat(pharmacy.location.longitude),
                }}
                title={pharmacy.userInfo.name}
              />
            </MapView>
          </View>

        </View>


      );
    } else if (activeTab === 'products') {
      return renderMedicines();
    } else if (activeTab === 'categories') {
      return renderCategories();
    } else {
      return renderReviews();
    }
  };



  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#005b7f', '#14967f']} // Adjust colors if needed
        start={{ x: 0, y: 0 }} // Top
        end={{ x: 0, y: 1 }} // Bottom
        style={styles.topSection}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />
            <TextInput
              placeholder="Search in pharmacy"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
        </View>

        <View style={styles.pharmacyHeader}>
          <Image
            style={styles.pharmacyImage}
            source={
              pharmacy?.images?.[0]
                ? { uri: pharmacy.images[0] }
                : require('@/assets/images/sample.jpg')
            }
          />
          <View style={styles.pharmacyInfo}>
            <Text style={styles.pharmacyName}>
              {pharmacy.userInfo.name}
              {feedbacks.length > 0 ? ` (${calculateAverageRating()} ★)` : " (No Rating)"}
            </Text>
            <Text style={styles.businessHours}>📅 {pharmacy.businessDays || 'Not Available'}</Text>
            <Text style={styles.businessHours}>⏰ {pharmacy.openingHour} - {pharmacy.closingHour}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs Section */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setActiveTab('shop')} style={[styles.tab, activeTab === 'shop' && styles.activeTab]}>
          <Text style={styles.tabText}>Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('products')} style={[styles.tab, activeTab === 'products' && styles.activeTab]}>
          <Text style={styles.tabText}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('categories')} style={[styles.tab, activeTab === 'categories' && styles.activeTab]}>
          <Text style={styles.tabText}>Categories</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('feedbacks')} style={[styles.tab, activeTab === 'feedbacks' && styles.activeTab]}>
          <Text style={styles.tabText}>Reviews</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>{renderContent()}</ScrollView>
    </View>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  topSection: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    height: '29%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    marginRight: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    flex: 1,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  medicineContainer: {
    padding: 16,
  },
  medicineCard: {
    width: '100%', // Full width for better readability
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4, // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005b7f',
  },
  medicineStock: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B607E',
  },
  genericName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
    marginBottom: 8,
  },
  medicineDetails: {
    marginTop: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  lastUpdated: {
    fontSize: 12,
    color: 'red',
    marginTop: 10,
    textAlign: 'right',
  },
  noMedicinesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginTop: 20,
  },
  pharmacyImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    marginTop: 10,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    flexWrap: 'wrap', // Allow content to be displayed properly
  },
  pharmacyInfo: { flex: 1 },
  pharmacyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  businessHours: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  infoText: { fontSize: 14, color: 'white' },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  tab: { paddingVertical: 10 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#0B607E' },
  tabText: { fontSize: 16, color: '#555' },
  infoContainer: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoTextShop: { marginLeft: 8, fontSize: 16, color: '#555' },
  mapContainer: { marginTop: 20, height: 250, borderRadius: 10, overflow: 'hidden' },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // categories tab
  categoryContainer: {
    padding: 16,
  },
  categoryCard: {
    width: '100%', // Full width
    flexDirection: 'row',
    justifyContent: 'space-between', // Category name on left, count on right
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0B607E',
  },
  categoryCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  valueT: {
    textAlign: 'right',
    fontSize: 12
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
  reviewContainer: {
    padding: 20
  },
  addReview: {
    padding: 20,
    backgroundColor: '#4A8691',
    borderRadius: 10
  },
  reviewSection: {
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15
  },
  ratingLabel: {
    marginRight: 10,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  confirmButton: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 8,
    marginVertical: 10,
    marginBottom: 5,

    alignItems: 'center',
  },
  updateContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 5,
    marginTop: 20
  },
});

export default PharmacyDetails;