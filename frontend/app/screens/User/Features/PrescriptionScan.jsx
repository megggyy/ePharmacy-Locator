import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { affContent, dicContent } from '@/assets/dictionary/medicinesDictionary';
import stringSimilarity from 'string-similarity';
import nspell from 'nspell';
import baseURL from '@/assets/common/baseurl';
import axios from 'axios';
import levenshtein from 'fast-levenshtein';

let spell;

const PrescriptionScreen = () => {
  const router = useRouter();
  const { processedImageUrl, ocrText, originalImageUrl, customerId } = useLocalSearchParams();
  const [medicinesList, setMedicinesList] = useState([]);
  const [matchedMedicines, setMatchedMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasProcessed = useRef(false); 

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
    if (hasProcessed.current) return; // Prevent rerun
    if (!ocrText || !spell || !dicContent || medicinesList.length === 0) return;

    setIsLoading(true);
    console.log('Original OCR Text:', ocrText);
    hasProcessed.current = true; 
    
    // Extract words, remove empty values, and filter out short words (noise)
    const ocrWords = ocrText
    .split(/\s+|\n+/)  // Split by spaces or new lines
    .map(word => word.toLowerCase().trim())  
    .filter(word => 
      word.length > 4 &&         
      /^[a-z]+$/i.test(word) &&  
      !/\d/.test(word)           
    );

    console.log("Filtered OCR Words:", ocrWords);

    if (ocrWords.length === 0) {
      console.warn('No valid words extracted from OCR text.');
      setIsLoading(false);
      return;
    }

    const dictionaryWords = dicContent
    .split(/\n+/)  // Split by new lines
    .flatMap(line => line.split(/\s+/))  // Further split each line into words
    .map(word => word.toLowerCase());  // Normalize case

    const correctOCRWords = (ocrWords, dictionaryWords) => {
      return ocrWords.map((word) => {
        let correctedWord = word.toLowerCase(); // Normalize case
    
        if (!spell.correct(correctedWord)) {
          let bestMatch = dictionaryWords.reduce((best, dictWord) => {
            let similarity = getAdvancedSimilarity(correctedWord, dictWord); 
            return similarity > best.similarity ? { name: dictWord, similarity } : best;
          }, { name: '', similarity: 0 });
    
          if (bestMatch.similarity >= 0.56) { // Adjust threshold for accuracy
            console.log(`Checking correction for: ${word}`);
            console.log(`Best match found: ${bestMatch.name} (Similarity: ${bestMatch.similarity})`);
            correctedWord = bestMatch.name;
          }
        }
        return correctedWord;
      });
      
    };
    
    // Use this function in your OCR text processing
    const correctedWords = correctOCRWords(ocrWords, dictionaryWords);
    
    console.log('Corrected OCR Words:', correctedWords);

    // **Improved Matching Logic**
    const matched = medicinesList
    .map((medicine) => {
      const genericName = medicine.genericName.toLowerCase();
      const brandName = medicine.brandName.toLowerCase();
  
      let matchedFrom = null;
  
      const hasExactMatch = correctedWords.some(word => {
        if (genericName.split(/\W+/).includes(word)) {
          matchedFrom = "genericName";
          return true;
        }
        if (brandName.split(/\W+/).includes(word)) {
          matchedFrom = "brandName";
          return true;
        }
        return false;
      });
  
      if (hasExactMatch) {
        return { 
          genericName: medicine.genericName, 
          brandName: medicine.brandName,
          matchedFrom,
          score: 1.0
        };
      }
  
      const highestGenericScore = Math.max(...correctedWords.map(word => getAdvancedSimilarity(word, genericName)));
      const highestBrandScore = Math.max(...correctedWords.map(word => getAdvancedSimilarity(word, brandName)));
  
      const finalScore = Math.max(highestGenericScore, highestBrandScore); 
  
      if (finalScore >= 0.85) {
        matchedFrom = highestGenericScore > highestBrandScore ? "genericName" : "brandName";
        return { 
          genericName: medicine.genericName, 
          brandName: medicine.brandName,
          matchedFrom,
          score: finalScore
        };
      }
  
      return null;
    })
    .filter(m => m !== null)
    .sort((a, b) => b.score - a.score)
    .reduce((acc, curr) => {
      const key = `${curr.genericName.toLowerCase()}|${curr.brandName.toLowerCase()}`;
      if (!acc.has(key)) {
        acc.set(key, curr);
      }
      return acc;
    }, new Map());
  
  // ✅ Convert Map to Array
  const uniqueMatched = Array.from(matched.entries()).map(([_, value]) => value);
  console.log('Matched Medicines:', uniqueMatched);
  setMatchedMedicines(uniqueMatched);
  
  
  //setMatchedMedicines(uniqueMatched);  
  setIsLoading(false);  
    }, [ocrText, spell, medicinesList]);
    
  const getAdvancedSimilarity = (word1, word2) => {
    const lcsScore = getLCSSimilarity(word1, word2);
    const commonLetters = new Set([...word1].filter(char => word2.includes(char))).size / Math.max(word1.length, word2.length);
    const levenshteinScore = 1 - (levenshtein.get(word1, word2) / Math.max(word1.length, word2.length));
    const jaroWinklerScore = stringSimilarity.compareTwoStrings(word1, word2);
  
    return (lcsScore * 0.4) + (commonLetters * 0.3) + (levenshteinScore * 0.2) + (jaroWinklerScore * 0.1);
  };  

  // LCS-based similarity
  const getLCSSimilarity = (a, b) => {
    const dp = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[a.length][b.length] / Math.max(a.length, b.length);
  };

  useEffect(() => {
    if (processedImageUrl) {
      Image.prefetch(processedImageUrl)
        .then(() => console.log("Image preloaded"))
        .catch(err => console.error("Image preload error:", err));
    }
  }, [processedImageUrl]);
  
  const uploadPrescription = async () => {
    if (!customerId) {
      console.error("Customer ID is missing.");
      Alert.alert("Error", "Customer ID is required to upload the prescription.");
      return;
    }
  
    try {
      const validMedicines = matchedMedicines
      .filter(m => m?.genericName)
      .map(m => ({
        genericName: m.genericName,
        brandName: m.brandName,
        matchedFrom: m.matchedFrom,
      }));
  
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
    } catch (error) {
      console.error("Error uploading prescription:", error.response?.data || error.message);
    }
  };
  
  // const handleFindPharmacies = async () => {
  //   try {
  //     // Fetch customer's consent status
  //     const response = await axios.get(`${baseURL}customers/customers/${customerId}`);
  //     const { consentGiven } = response.data;
  
  //     console.log("Customer Consent:", consentGiven);
  
  //     if (consentGiven) {
  //       await uploadPrescription(); // Only upload if consent is given
  //     } else {
  //       console.warn("Customer has not given consent. Prescription will not be uploaded.");
  //     }
  
  //     // Extract detected generic and brand names
  //     const detectedGenericNames = new Set(matchedMedicines.map(m => m.genericName.toLowerCase()));
  //     const detectedBrandNames = new Set(matchedMedicines.map(m => m.brandName.toLowerCase()));
  
  //     // Fetch all medicines from the backend
  //     const medicinesResponse = await axios.get(`${baseURL}medicine`);
  //     const allMedicines = medicinesResponse.data;
  
  //     // Find all medicines matching the detected brand names or generic names
  //     const expandedMatchedMedicines = allMedicines.filter(medicine =>
  //       detectedGenericNames.has(medicine.genericName.toLowerCase()) ||
  //       detectedBrandNames.has(medicine.brandName.toLowerCase())
  //     );
  
  //     // Extract all generic names and brand names from the expanded medicines
  //     const finalGenericNames = new Set(expandedMatchedMedicines.map(m => m.genericName.toLowerCase()));
  //     const finalBrandNames = new Set(expandedMatchedMedicines.map(m => m.brandName.toLowerCase()));
  
  //     // Collect all medicines that belong to these generic or brand names
  //     const finalMatchedMedicines = allMedicines.filter(medicine =>
  //       finalGenericNames.has(medicine.genericName.toLowerCase()) ||
  //       finalBrandNames.has(medicine.brandName.toLowerCase())
  //     ).map(medicine => ({
  //       genericName: medicine.genericName,
  //       brandName: medicine.brandName
  //     }));
  
  //     console.log("Final Matched Medicinewmws:", finalMatchedMedicines);
  
  //     // Proceed to find pharmacies regardless of consent
  //     router.push({
  //       pathname: "/screens/User/Features/PrescriptionResults",
  //       params: { matchedMedicines: JSON.stringify(finalMatchedMedicines) }
  //     });
  
  //   } catch (error) {
  //     console.error("Error handling pharmacy search:", error);
  //     Alert.alert("Error", "Failed to fetch customer consent or find pharmacies. Please try again.");
  //   }
  // };
  
  const handleFindPharmacies = async () => {
    try {
      const response = await axios.get(`${baseURL}customers/customers/${customerId}`);
      const { consentGiven } = response.data;
  
      if (consentGiven) {
        await uploadPrescription();
      } else {
        console.warn("Customer has not given consent. Prescription will not be uploaded.");
      }
  
      // Extract detected generic names, brand names, and matchedFrom
      const detectedMedicines = new Map();
      matchedMedicines.forEach(m => {
        const key = `${m.genericName.toLowerCase()}|${m.brandName.toLowerCase()}`;
        detectedMedicines.set(key, {
          genericName: m.genericName,
          brandName: m.brandName,
          matchedFrom: m.matchedFrom, // Include matchedFrom
        });
      });
  
      const medicinesResponse = await axios.get(`${baseURL}medicine`);
      const allMedicines = medicinesResponse.data;
  
      const expandedMatchedMedicines = allMedicines.filter(medicine =>
        detectedMedicines.has(`${medicine.genericName.toLowerCase()}|${medicine.brandName.toLowerCase()}`)
      ).map(medicine => ({
        genericName: medicine.genericName,
        brandName: medicine.brandName,
        matchedFrom: detectedMedicines.get(`${medicine.genericName.toLowerCase()}|${medicine.brandName.toLowerCase()}`).matchedFrom
      }));
  
      console.log("Final Matched Medicines:", expandedMatchedMedicines);
  
      router.push({
        pathname: "/screens/User/Features/PrescriptionResults",
        params: { matchedMedicines: JSON.stringify(expandedMatchedMedicines) }
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
           <Image source={{ uri: processedImageUrl }} style={styles.prescriptionImage} resizeMode="cover" />
          </View>
        ) : (
          <Text style={styles.noImageText}>No image to display</Text>
        )}

        <Text style={styles.sectionTitle}>Matched Medicines</Text>
        <View style={styles.medicineContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007acc" />
        ) : matchedMedicines.length > 0 ? (
          [...new Set(matchedMedicines.map(med => 
            med.matchedFrom === "brandName" ? med.brandName : med.genericName
          ))].map((name, index) => (
            <Text key={index} style={styles.medicineText}>{name}</Text>
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
    width: '100%', // OR set a fixed width
    height: 370,
    borderRadius: 10,
    backgroundColor: 'lightgray', // To see if it's rendering
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
