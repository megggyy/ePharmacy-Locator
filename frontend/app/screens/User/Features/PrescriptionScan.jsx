import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { affContent, dicContent } from '@/assets/dictionary/medicinesDictionary';
import stringSimilarity from 'string-similarity';
import nspell from 'nspell';
import baseURL from '@/assets/common/baseurl';
import axios from 'axios';

let spell; 

const PrescriptionScreen = () => {
  const router = useRouter();
  const { processedImageUrl, ocrText, originalImageUrl, customerId } = useLocalSearchParams();
  const [medicinesList, setMedicinesList] = useState([]);
  const [matchedMedicines, setMatchedMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get(`${baseURL}medicine`); // Adjust endpoint if necessary
        setMedicinesList(response.data); // Ensure response structure matches your expectations
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };
  
    fetchMedicines(); // Call the function to fetch medicines
  
    try {
      if (!spell && affContent && dicContent) {
        spell = nspell(affContent, dicContent);
        console.log('Dictionary successfully loaded');
      }
    } catch (error) {
      console.error('Error initializing nspell:', error);
    }
  }, []);
  

  useEffect(() => {
    if (!ocrText || !spell || !dicContent || medicinesList.length === 0) return;
  
    setIsLoading(true); // Ensure it starts loading
  
    console.log('Original OCR Text:', ocrText);
  
    const ocrWords = ocrText.split(/\s+|\n+/).filter(Boolean);
    if (ocrWords.length === 0) {
      console.warn('No words extracted from OCR text.');
      setIsLoading(false);
      return;
    }
  
    const dictionaryWords = dicContent.split('\n').map(word => word.toLowerCase());
  
    const correctedWords = ocrWords.map((word) => {
      let correctedWord = word.toLowerCase();
      if (!spell.correct(correctedWord)) {
        let bestMatch = dictionaryWords.reduce((best, dictWord) => {
          let similarity = getSequenceSimilarity(correctedWord, dictWord);
          return similarity > best.similarity ? { name: dictWord, similarity } : best;
        }, { name: '', similarity: 0 });
  
        if (bestMatch.similarity >= 0.5) {
          correctedWord = bestMatch.name;
          console.log(`Corrected "${word}" to "${correctedWord}" using dictionary`);
        }
      }
      return correctedWord;
    });
  
    console.log('Corrected OCR Words:', correctedWords);
  
    const matched = medicinesList
      .map((medicine) => {
        const medicineName = medicine.genericName.toLowerCase();
        const highestScore = Math.max(...correctedWords.map(word => getSequenceSimilarity(word, medicineName)));
        return { genericName: medicine.genericName, score: highestScore };
      })
      .filter(m => m.score >= 0.8)
      .sort((a, b) => b.score - a.score);
  
    console.log('Matched Medicines:', matched);
    setMatchedMedicines(matched);
    setIsLoading(false); // Ensure it stops loading only after processing
  
  }, [ocrText, spell, medicinesList]); // Ensure dependencies are all available
  

  const getSequenceSimilarity = (word1, word2) => {
    const lcs = (a, b) => {
      const dp = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
      return dp[a.length][b.length];
    };

    const commonLetters = new Set([...word1].filter(char => word2.includes(char))).size;
    const lcsScore = lcs(word1, word2) / Math.max(word1.length, word2.length);
    const commonScore = commonLetters / Math.max(word1.length, word2.length);

    return (lcsScore * 0.7) + (commonScore * 0.3);
  };

  const uploadPrescription = async () => {
    if (!customerId) {
        console.error("Customer ID is missing.");
        Alert.alert("Error", "Customer ID is required to upload the prescription.");
        return;
    }

    try {
        const validMedicines = matchedMedicines
            .filter(m => m?.genericName)
            .map(m => m.genericName);

        const response = await axios.post(`${baseURL}customers/upload-prescription`, {
            customerId,  
            originalImageUrl,
            processedImageUrl,
            ocrText,
            matchedMedicines: validMedicines,
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log("Prescription saved:", response.data);
        //Alert.alert("Success", "Prescription uploaded successfully!");
    } catch (error) {
        console.error("Error uploading prescription:", error.response?.data || error.message);
        //Alert.alert("Error", "Failed to upload prescription.");
    }
};

  const handleFindPharmacies = async () => {
    try {
      // Fetch customer's consent status
      const response = await axios.get(`${baseURL}customers/customers/${customerId}`);
      const { consentGiven } = response.data;
  
      console.log("Customer Consent:", consentGiven);
  
      if (consentGiven) {
        await uploadPrescription(); // Only upload if consent is given
      } else {
        console.warn("Customer has not given consent. Prescription will not be uploaded.");
      }
  
      // Proceed to find pharmacies regardless of consent
      router.push({
        pathname: "/screens/User/Features/PrescriptionResults",
        params: { matchedMedicines: JSON.stringify(matchedMedicines.map(m => m.genericName)) },
      });
    } catch (error) {
      console.error("Error handling pharmacy search:", error);
      Alert.alert("Error", "Failed to fetch customer consent or find pharmacies. Please try again.");
    }
  };
  
  
  return (
    <View style={styles.safeArea}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Uploaded Prescription</Text>
    </View>
      <ScrollView contentContainerStyle={styles.content}>
        {processedImageUrl ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: processedImageUrl }} style={styles.prescriptionImage} resizeMode="contain" />
          </View>
        ) : (
          <Text style={styles.noImageText}>No image to display</Text>
        )}

        <Text style={styles.sectionTitle}>Matched Medicines</Text>
        <View style={styles.medicineContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007acc" />
        ) : matchedMedicines.length > 0 ? (
          matchedMedicines.map((med, index) => (
            <Text key={index} style={styles.medicineText}>{med.genericName}</Text>
          ))
        ) : (
          <Text style={styles.noMedicineText}>No detected medicines</Text>
        )}
      </View>
      {matchedMedicines.length > 0 && (
          <TouchableOpacity style={styles.findButton} onPress={handleFindPharmacies} disabled={isLoading}>
            <Text style={styles.findButtonText}>{isLoading ? 'Processing...' : 'Find Pharmacies'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#005b7f',
  },
  backButton: {
    padding: 8, // Increased padding for better touch response
    marginRight: 12,
  },  
  headerTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  prescriptionImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
  },
  noImageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005b7f',
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  medicineContainer: {
    width: '100%',
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medicineText: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },
  noMedicineText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  findButton: {
    width: '90%',
    height: 50,
    backgroundColor: '#007acc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  findButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


export default PrescriptionScreen;
