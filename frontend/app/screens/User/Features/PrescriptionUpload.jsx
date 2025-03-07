import React, { useState, useEffect, useRef, useContext } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Animated, FlatList, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import baseURL from "@/assets/common/baseurl";
import AuthGlobal from "@/context/AuthGlobal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImageEditor } from "expo-crop-image";


const PrescriptionUploadScreen = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCropNote, setShowCropNote] = useState(true);
  const { state } = useContext(AuthGlobal); 
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const router = useRouter();
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [agreedToStore, setAgreedToStore] = useState(null);

  
  // Get userId from authentication state
  const userId = state?.user?.userId; 

  useEffect(() => {
    fetchCustomerId();
  }, [userId]);

  const fetchCustomerId = async () => {
    if (!userId) {
      console.error("User ID is missing");
      return;
    }
    
    try {
      const token = await AsyncStorage.getItem("jwt");
      const response = await axios.get(`${baseURL}customers/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomerId(response.data.customerId);
    } catch (error) {
      console.error("Error fetching customer ID:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (!customerId) return;
  
    const checkConsent = async () => {
      try {
        const response = await axios.get(`${baseURL}customers/customers/${customerId}`);
        const consent = response.data?.consentGiven;
  
        if (consent === null || consent === undefined) {
          setShowPrivacyNotice(true);
        } else {
          setAgreedToStore(consent);
        }
      } catch (error) {
        console.error("Error fetching consent:", error.response?.data || error.message);
      }
    };
  
    checkConsent();
  }, [customerId]);
  
  
  
  const fetchPrescriptions = async () => {
    if (!customerId) return;
  
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}customers/${customerId}/prescriptions`);
      
      // Filter unique prescriptions based on image URL
      const uniquePrescriptions = [];
      const seenUrls = new Set();
  
      response.data.prescriptions.forEach((prescription) => {
        if (!seenUrls.has(prescription.originalImageUrl)) {
          seenUrls.add(prescription.originalImageUrl);
          uniquePrescriptions.push(prescription);
        }
      });
  
      setPrescriptions(uniquePrescriptions);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (customerId) fetchPrescriptions();
  }, [customerId]);

  const handleReuse = (prescription) => {
    setIsDrawerVisible(false); // Close the modal first
    router.push({
      pathname: "/screens/User/Features/PrescriptionScan",
      params: {
        originalImageUrl: prescription.originalImageUrl,
        processedImageUrl: prescription.processedImageUrl,
        ocrText: prescription.ocrText,
        customerId: prescription.customerId,
      },
    });
  };
  

  // Animation reference
  const slideAnim = useRef(new Animated.Value(-100)).current; // Start off-screen

  useEffect(() => {
    // Slide down animation on mount
    Animated.timing(slideAnim, {
      toValue: 20, // Final position
      duration: 500,
      useNativeDriver: true,
    }).start();
  
    const requestPermissions = async () => {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
      if (cameraPermission.status !== "granted" || galleryPermission.status !== "granted") {
        Alert.alert("Permission Denied", "Camera and gallery permissions are required for this feature.");
      }
    };
  
    requestPermissions();
  }, []);
  
  useEffect(() => {
    if (isLoading) {
      closeNote();
    }
  }, [isLoading]); // Closes the note when loading starts
  

  const closeNote = () => {
    Animated.timing(slideAnim, {
      toValue: -100, // Move back up
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowCropNote(false)); // Remove after animation
  };

  const handleImageUpload = async (uri) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("prescriptions", {
        uri,
        name: "prescription.jpg",
        type: "image/jpeg",
      });
  
      const response = await axios.post(`${baseURL}customers/scan-prescription`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (!response.data) {
        throw new Error("Empty response from server");
      }
  
      const { ocrText, processedImageUrl, originalImageUrl } = response.data;
  
      // Ensure all params are ready before navigating
      if (ocrText && processedImageUrl && originalImageUrl && customerId) {
        router.push({
          pathname: "/screens/User/Features/PrescriptionScan",
          params: { originalImageUrl, processedImageUrl, ocrText, customerId },
        });
      } else {
        Alert.alert("Processing Error", "Some required data is missing from the response.");
      }
    } catch (error) {
      console.error("Error processing OCR:", error);
      Alert.alert("OCR Error", "Failed to process the image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleImageSelection = async (source) => {
    if (isLoading) return;

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.5 })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 0.5 });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setIsCropping(true);
    }
  };

  const handlePrivacyResponse = async (agree) => {
    if (!customerId) {
      Alert.alert("Error", "Customer ID is missing. Please try again.");
      return;
    }
  
    setShowPrivacyNotice(false);
    setAgreedToStore(agree);
  
    try {
      await axios.post(`${baseURL}customers/customers/consent`, { customerId, consentGiven: agree });
      console.log("Consent updated:", agree);
    } catch (error) {
      console.error("Error updating consent:", error.message);
      Alert.alert("Error", "Failed to update consent. Please try again.");
    }
  };
  
  

  return (
    <View style={styles.safeArea}>
      {/* privacy notice modal */}
      {showPrivacyNotice && (
        <Modal visible={showPrivacyNotice} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.privacyNotice}>
              <Text style={styles.noticeText}>
                To comply with the Data Privacy Act, do you agree to store your prescriptions?
                Your data will only be used for your convenience.
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.privacyButton, { backgroundColor: "#005b7f" }]} 
                  onPress={() => handlePrivacyResponse(true)}
                >
                  <Text style={styles.buttonText}>Agree</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.privacyButton, { backgroundColor: "gray" }]} 
                  onPress={() => handlePrivacyResponse(false)}
                >
                  <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Animated Persistent Note */}
      {showCropNote && (
        <Animated.View style={[styles.noteContainer, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.cropNote}>
            📌 Please ensure the image **only** contains medicine information. 
            Crop out unnecessary details before scanning.
          </Text>
          <TouchableOpacity onPress={closeNote} style={styles.closeButton}>
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Processing Image...</Text>
        </View>
      ) : isCropping ? (
        <View style={styles.cropContainer}>
          <ImageEditor
            imageUri={imageUri}
            fixedAspectRatio={3.5 / 4}
            minimumCropDimensions={{ width: 100, height: 100 }}
            editorOptions={{
              backgroundColor: "black",
              controlBar: {
                position: "bottom",
                backgroundColor: "#005b7f",
                cancelButton: { color: "white", text: "Cancel", iconName: "x" },
                saveButton: { color: "white", text: "Save", iconName: "check" },
              },
              gridOverlayColor: "rgba(255,255,255,0.3)",
              overlayCropColor: "rgba(0,0,0,0.7)",
            }}
            onEditingCancel={() => setIsCropping(false)}
            onEditingComplete={(image) => {
              setIsCropping(false);
              setImageUri(image.uri);
              handleImageUpload(image.uri);
            }}
          />
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <View style={styles.iconBackground}>
                <Ionicons name="arrow-back" size={24} color="#005b7f" />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Prescription Reader</Text>
          </View>

          <View style={styles.container}>
            <Text style={styles.label}>Scan Prescription</Text>
            <TouchableOpacity style={styles.button} onPress={() => handleImageSelection("camera")}>
              <Ionicons name="camera-outline" size={60} color="white" />
            </TouchableOpacity>

            <Text style={styles.label}>or</Text>
            <Text style={styles.label}>Upload Prescription</Text>
            <TouchableOpacity style={styles.button} onPress={() => handleImageSelection("gallery")}>
              <Ionicons name="cloud-upload-outline" size={60} color="white" />
            </TouchableOpacity>
             {/* Open Drawer Button */}
            <TouchableOpacity
              style={styles.drawerButton}
              onPress={() => setIsDrawerVisible(true)}
            >
              <Ionicons name="folder-open" size={24} color="white" />
              <Text style={styles.drawerButtonText}>View Previous Prescriptions</Text>
            </TouchableOpacity>
          </View>
        {/* Prescription Drawer */}
        <Modal
          visible={isDrawerVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsDrawerVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.drawer}>
              {/* Close Button */}
              <TouchableOpacity style={styles.closeDrawerButton} onPress={() => setIsDrawerVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>

              <Text style={styles.drawerTitle}>Previous Prescriptions</Text>

              {loading ? (
                <ActivityIndicator size="large" color="#005b7f" />
              ) : prescriptions.length > 0 ? (
                <FlatList
                  data={prescriptions}
                  keyExtractor={(item) => item._id}
                  numColumns={2}
                  contentContainerStyle={styles.listContainer}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.prescriptionCard}
                      onPress={() => handleReuse(item)}
                    >
                      <Image source={{ uri: item.originalImageUrl }} style={styles.prescriptionImage} />
                      <Text style={styles.prescriptionText}>Tap to reuse</Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <Text style={styles.noPrescriptionsText}>No previous prescriptions found.</Text>
              )}
            </View>
          </View>
        </Modal>
        </>      
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: "#005b7f",
  },
  backButton: {
    marginRight: 10,
  },
  iconBackground: {
    marginTop: 10,
    marginBottom: 5,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    marginTop: 10,
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  container: {
    marginTop: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#005b7f",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "black",
  },
  label: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  noteContainer: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 60,
    backgroundColor: "#14967f",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2,
  },
  cropNote: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  // prescription drawer
  drawerButton: {
    flexDirection: "row",
    backgroundColor: "#005b7f",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  drawerButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",  // Pushes the modal to the bottom
    backgroundColor: "rgba(0, 0, 0, 0.5)",  // Semi-transparent background
  },
  drawer: {
    backgroundColor: "white",
    width: "100%",
    height: "75%", // Makes the modal take up 3/4 of the screen
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
    alignItems: "center",
    position: "absolute",
    bottom: 0, // Ensures it starts from the bottom
  },  
  closeDrawerButton: {
    position: "absolute",
    right: 20,
    top: 15,
    zIndex: 10,
  },  
  drawerHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  listContainer: {
    alignItems: "center",
  },
  prescriptionCard: {
    width: 140,
    height: 160,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    margin: 8,
    alignItems: "center",
    padding: 10,
  },
  prescriptionImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  prescriptionText: {
    marginTop: 5,
    fontSize: 12,
    color: "#005b7f",
  },
  noPrescriptionsText: {
    marginTop: 20,
    fontSize: 16,
    color: "#999",
  },
  //  modal privacy
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  privacyNotice: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Shadow for Android
  },
  noticeText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  privacyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5, // Spacing between buttons
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PrescriptionUploadScreen;
