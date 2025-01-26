import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Button,
    StyleSheet,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AuthGlobal from '@/context/AuthGlobal';
import baseURL from "../../../../assets/common/baseurl";
import axios from "axios";
import antibioticsData from '../../../../assets/medicines/antibiotics.json';
import sedativesData from '../../../../assets/medicines/sedatives.json';
import Toast from 'react-native-toast-message';

const CreateMedicines = () => {
    const router = useRouter();
    const [medicines, setMedicines] = useState([]);  // This will hold the filtered list of medicines
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [filteredCategory, setFilteredCategory] = useState([]);
    const [stockInput, setStockInput] = useState({});  // Store stock values for each medicine
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories] = useState(['Antibiotics', 'Sedatives']);
    const [searchCategory, setSearchCategory] = useState('');
    const [searchMedicine, setSearchMedicine] = useState('');
    const { state } = useContext(AuthGlobal);

    useEffect(() => {
        setFilteredMedicines(medicines);
        setFilteredCategory(categories);
    }, [medicines], [categories]);

    const filterMedicines = (text) => {
        setSearchMedicine(text);
        if (text === '') {
            setFilteredMedicines(medicines);
        } else {
            const filtered = medicines.filter((medicine) =>
                medicine.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredMedicines(filtered);
        }
    };

    const filterCategory = (text) => {
        setSearchCategory(text);
        if (text === '') {
            setFilteredCategory(categories);
        } else {
            const filtered = categories.filter((category) =>
                category.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredCategory(filtered);
        }
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setCategoryModalVisible(false);

        let filteredMedicines = [];
        if (category === 'Antibiotics') {
            filteredMedicines = antibioticsData;
        } else if (category === 'Sedatives') {
            filteredMedicines = sedativesData;
        }

        // Fetch existing medicines to compare
        fetchExistingMedicines(filteredMedicines);
    };

    // Fetch existing medicines from the database
    const fetchExistingMedicines = async (categoryMedicines) => {
        try {
            const response = await axios.get(`${baseURL}medicine/${state.user.userId}`);
            const existingMedicines = response.data;  // Assuming it returns an array of existing medicines

            // Filter out medicines that already exist in the database
            const newMedicines = categoryMedicines.filter(
                (medicine) =>
                    !existingMedicines.some(
                        (existingMedicine) => existingMedicine.name === medicine.name
                    )
            );

            setMedicines(newMedicines); // Set the medicines that don't exist in the database
        } catch (error) {
            console.error("Error fetching existing medicines: ", error);
        }
    };

    const handleStockChange = (index, text) => {
        setStockInput((prevState) => ({
            ...prevState,
            [index]: text,  // Update stock value for the specific medicine
        }));
    };

    const handleSubmit = async (index) => {
        const selectedMedicine = medicines[index];
        const stockValue = stockInput[index] || 0;  // Default to 0 if stock is not provided
    
        try {
            // Send a POST request to your API using axios
            const response = await axios.post(`${baseURL}medicine/create`, {
                name: selectedMedicine.name,
                stock: stockValue,
                pharmacy: state.user.userId,
                category: selectedCategory,
            });
            console.log(response.data); // Handle the response from the server
    
            // Clear the medicines and stock input after successful addition
            setMedicines((prevMedicines) => prevMedicines.filter((_, i) => i !== index)); // Remove the added medicine from the list
            setStockInput((prevStockInput) => {
                const newStockInput = { ...prevStockInput };
                delete newStockInput[index]; // Remove the stock value for the added medicine
                return newStockInput;
            });
             // Show success toast message
             Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Medication Added',
                text2: 'The medication has been added successfully.',
                visibilityTime: 4000,
                autoHide: true,
            });
    
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    };
    
    console.log(state);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/screens/PharmacyOwner/Medications/ListMedications')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Add Medicine</Text>
            </View>

            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setCategoryModalVisible(true)}
            >
                <Text style={styles.dropdownButtonText}>
                    {selectedCategory || 'Select Category'}
                </Text>
            </TouchableOpacity>

            <Modal
                transparent
                visible={categoryModalVisible}
                animationType="slide"
                onRequestClose={() => setCategoryModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            value={searchCategory}
                            onChangeText={(text) => filterCategory(text)}
                        />
                        <FlatList
                            data={categories.filter((category) =>
                                category.toLowerCase().includes(searchCategory.toLowerCase())
                            )}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleCategorySelect(item)}
                                    style={styles.categoryItem}
                                >
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <Button title="Close" onPress={() => setCategoryModalVisible(false)} />
                    </View>
                </View>
            </Modal>

            {/* Search for medicines */}
            <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#AAB4C1"
                value={searchMedicine}
                onChangeText={filterMedicines}
            />

            <FlatList
                data={filteredMedicines}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={
                    filteredMedicines.length === 0 ? (
                        <Text style={styles.emptyMessage}>No medicines available for the selected category.</Text>
                    ) : null
                }
                renderItem={({ item, index }) => (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Name</Text>
                        <Text style={styles.input}>{item.name}</Text>
                        <Text style={styles.label}>Stock: {item.stock}</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="Enter stock to add"
                            value={stockInput[index] || ''}
                            onChangeText={(text) => handleStockChange(index, text)}  // Update stock for this medicine
                        />
                        <TouchableOpacity style={styles.submit} onPress={() => handleSubmit(index)}>
                            <Text style={styles.submitText}>ADD</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        backgroundColor: '#005b7f', 
        paddingTop: 20,
        paddingBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
    },
    headerText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    dropdownButton: {
        backgroundColor: '#0B607E',
        padding: 15,
        borderRadius: 10,
        margin: 20,
        alignItems: 'center',
    },
    dropdownButtonText: {
        color: 'white',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 10,
    },
    searchInput: {
        backgroundColor: '#0B607E',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginBottom: 15,
        color: 'black',
        fontSize: 16,
        marginHorizontal: 20,
    },
    categoryItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    inputContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        margin: 20,
        marginBottom: 0,
    },
    label: {
        color: '#666',
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#F4F4F4',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 15,
        textAlign: 'justify',
    },
    emptyMessage: {
        textAlign: 'center',
        color: 'black',
        marginTop: 20,
        fontSize: 16,
    },
    submit: {
        backgroundColor: '#0B607E',
        paddingVertical: 15,
        borderRadius: 10,
        marginVertical: 20,
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CreateMedicines;
