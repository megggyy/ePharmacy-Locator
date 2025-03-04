import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import baseURL from "@/assets/common/baseurl";
import { ImageEditor } from "expo-crop-image";

const PrescriptionUploadScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCropNote, setShowCropNote] = useState(true);
  const router = useRouter();

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

      const { ocrText, processedImageUrl, originalImageUrl } = response.data;

      router.push({
        pathname: "/screens/User/Features/PrescriptionScan",
        params: { originalImageUrl, processedImageUrl, ocrText },
      });
    } catch (error) {
      console.error("Error processing OCR:", error);
      Alert.alert("OCR Error", "Failed to process the image.");
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

  return (
    <View style={styles.safeArea}>
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
          </View>
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
});

export default PrescriptionUploadScreen;
