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
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import baseURL from "../../../../assets/common/baseurl";
import axios from "axios";
import Toast from 'react-native-toast-message';

const CreateMedicines = () => {
    const router = useRouter();

    const [filteredGeneric, setFilteredGeneric] = useState([]);
    const [generics, setGenerics] = useState([]);
    const [searchGeneric, setSearchGeneric] = useState('');
    const [genericModalVisible, setGenericModalVisible] = useState(false);
    const [selectedGeneric, setSelectedGeneric] = useState('');

    const [categories, setCategories] = useState([])
    const [category, setCategory] = useState('')

    const [medicines, setMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [searchMedicine, setSearchMedicine] = useState('');

    const [items, setItems] = useState([]);

    const [selectedMedicineIndex, setSelectedMedicineIndex] = useState(null);
    const [datePickerVisible, setDatePickerVisible] = useState({});
    const [expirationDates, setExpirationDates] = useState({});
    const [stockInputs, setStockInputs] = useState({});
    const { state } = useContext(AuthGlobal);

    useEffect(() => {
        fetchGenericNames()
        setFilteredMedicines(medicines);
        setFilteredGeneric(generics);
    }, [medicines], [generics]);

    const fetchGenericNames = async () => {
        try {
            const response = await axios.get(`${baseURL}medicine/json`);

            console.log(response.data)
            const uniqueCompositionsMap = new Map();

            response.data.forEach(item => {
                const normalizedKey = item.genericName.replace(/\s+/g, '').toLowerCase();
                if (!uniqueCompositionsMap.has(normalizedKey)) {
                    uniqueCompositionsMap.set(normalizedKey, item.genericName); 
                }
            });

            setGenerics(Array.from(uniqueCompositionsMap.values()));
        } catch (error) {
            console.error("Error fetching generic names: ", error);
        }
    };



    const filterGeneric = (text) => {
        setSearchGeneric(text);
        if (text === '') {
            setFilteredGeneric(generics);
        } else {
            const filtered = generics.filter((generic) =>
                generic.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredGeneric(filtered);
        }
    };

    const handleGenericSelect = async (generic) => {
        setSelectedGeneric(generic);
        setGenericModalVisible(false);
    
        try {
            const response = await axios.get(`${baseURL}medicine/json`);
    
            // Normalize the selected generic name
            const normalizedGeneric = generic.trim().toLowerCase();
    
            // Filter medicines by generic name (ignoring spaces and case)
            const filteredMedicines = response.data.filter(item =>
                item.genericName?.trim().toLowerCase() === normalizedGeneric
            );
    
            // Extract relevant details
            const filteredMedicinesDetails = filteredMedicines.map(item => ({
                brandName: item.brandName?.trim() || '',
                dosageStrength: item.dosageStrength || '',
                dosageForm: item.dosageForm || '',
                classification: item.classification || '',
                category: item.category || '',
                description: item.description || '',
            })).filter(item => item.brandName); // Ensure no empty brand names
    
            console.log(generic)
            console.log(filteredMedicinesDetails)

            // Fetch existing medicines and filter out those already in stock
            fetchExistingMedicines(generic, filteredMedicinesDetails);
    
        } catch (error) {
            console.error("Error fetching generic select:", error);
        }
    };
    
    // Fetch existing medicines from the pharmacy stock
    const fetchExistingMedicines = async (generic, genericMedicines) => {
        setSearchGeneric('');

        console.log(state.user.userId);
    
        try {
            const response = await axios.get(`${baseURL}medicine/existing/${state.user.userId}/${generic}`);
    
            if (response.data) {
                const existingMedicines = response.data.map(item => item.medicine); // Extract medicines from stock
                
                const nonExistingMedicines = genericMedicines.filter(med => 
                    !existingMedicines.some(existing => 
                        existing.brandName === med.brandName &&
                        existing.dosageStrength === med.dosageStrength &&
                        existing.dosageForm === med.dosageForm &&
                        existing.classification === med.classification
                    )
                );
                
    
                setMedicines(nonExistingMedicines); // Update state with non-existing medicines
            }
        } catch (error) {
        }
    };
    

    const filterMedicines = (text) => {
        setSearchMedicine(text);
        if (text === '') {
            setFilteredMedicines(medicines);
        } else {
            const filtered = medicines.filter((medicine) =>
                medicine.brandName.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredMedicines(filtered);
        }
    };

    const handleMedicineSelect = (index) => {
        setSelectedMedicineIndex(index);  // Set selected medicine index
    };

    const addNewItem = () => {
        if (selectedMedicineIndex === null) return; // Prevent adding if no medicine is selected

        const newIndex = items[selectedMedicineIndex] ? items[selectedMedicineIndex].length : 0;
        setItems((prev) => ({
            ...prev,
            [selectedMedicineIndex]: [...(prev[selectedMedicineIndex] || []), newIndex],
        }));
        setStockInputs((prev) => ({
            ...prev,
            [`${selectedMedicineIndex}-${newIndex}`]: '',
        }));
        setExpirationDates((prev) => ({
            ...prev,
            [`${selectedMedicineIndex}-${newIndex}`]: '',
        }));
    };



    const removeItem = (medicineIndex, subIndex) => {
        setItems((prev) => ({
            ...prev,
            [medicineIndex]: prev[medicineIndex].filter((i) => i !== subIndex),
        }));
        setStockInputs((prev) => {
            const updatedInputs = { ...prev };
            delete updatedInputs[`${medicineIndex}-${subIndex}`];
            return updatedInputs;
        });
        setExpirationDates((prev) => {
            const updatedDates = { ...prev };
            delete updatedDates[`${medicineIndex}-${subIndex}`];
            return updatedDates;
        });
    };

    const handleStockChange = (index, text) => {
        setStockInputs((prevState) => {
            const updatedState = { ...prevState, [index]: text };
            console.log("✅ Updated Stock Inputs:", updatedState); // Log the new state
            return updatedState;
        });
    };

    const handleExpirationChange = (index, event, selectedDate) => {
        setDatePickerVisible((prev) => ({
            ...prev,
            [index]: false, // Hide picker after selection
        }));

        if (selectedDate) {
            let isoDate = selectedDate.toISOString().split("T")[0]; // Format for saving (YYYY-MM-DD)

            let formattedDate = new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "long",
                day: "2-digit",
            }).format(selectedDate); // Display as "February 21, 2025"

            setExpirationDates((prev) => ({
                ...prev,
                [index]: formattedDate, // Updates selected index
            }));
        }
    };

    const handleSubmit = async (index) => {
        console.log("🚀 handleSubmit called for index:", index);
    
        if (!medicines || medicines.length === 0) {
            console.error("Medicines array is empty or undefined.");
            return;
        }
    
        const selectedMedicine = medicines[index];
    
        if (!selectedMedicine) {
            console.error(`No medicine found at index: ${index}`);
            return;
        }
    
        console.log("✅ Selected Medicine:", selectedMedicine);
    
        // Gather all stock and expiration date entries for the selected medicine
        const stockEntries = [];
        const expirationEntries = [];
    
        if (items[index] && items[index].length > 0) {
            items[index].forEach((subIndex) => {
                const stockKey = `${index}-${subIndex}`;
                const expirationKey = `${index}-${subIndex}`;
    
                const stockValue = parseInt(stockInputs[stockKey], 10) || 0;
                let rawDate = expirationDates[expirationKey] || '';
    
                // Convert displayed date back to ISO format
                let parsedDate = new Date(rawDate);
                let isoDate = !isNaN(parsedDate) ? parsedDate.toISOString().split('T')[0] : rawDate;
    
                if (stockValue && isoDate) {
                    stockEntries.push({ stock: stockValue, expirationDate: isoDate });
                }
            });
        }
    
        if (stockEntries.length === 0) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Missing Data',
                text2: 'Please enter stock and expiration date.',
                visibilityTime: 4000,
                autoHide: true,
            });
            return;
        }
    
        console.log("Stock Entries:", stockEntries);
    
        try {
            const response = await axios.post(`${baseURL}medicine/create`, {
                genericName: selectedGeneric,
                brandName: selectedMedicine.brandName,
                dosageStrength: selectedMedicine.dosageStrength,
                dosageForm: selectedMedicine.dosageForm,
                classification: selectedMedicine.classification,
                category: selectedMedicine.category,
                description: selectedMedicine.description,
                expirationPerStock: stockEntries, // Use the collected stock & expiration data
                pharmacy: state.user.userId,
            });
    
            console.log(response.data); // Log server response
    
            // Remove the added medicine from the list
            setMedicines((prevMedicines) => prevMedicines.filter((_, i) => i !== index));
    
            // Clear stock input and expiration date for this index
            setStockInputs((prevStockInput) => {
                const newStockInput = { ...prevStockInput };
                items[index]?.forEach((subIndex) => delete newStockInput[`${index}-${subIndex}`]);
                return newStockInput;
            });
    
            setExpirationDates((prevExpirationDates) => {
                const newExpirationDates = { ...prevExpirationDates };
                items[index]?.forEach((subIndex) => delete newExpirationDates[`${index}-${subIndex}`]);
                return newExpirationDates;
            });
    
            setSelectedMedicineIndex(null);  
            setSearchMedicine('')
        
            // Show success message
            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Medication Added',
                text2: 'The medication has been added successfully.',
                visibilityTime: 4000,
                autoHide: true,
            });
    
        } catch (error) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: 'Failed to add medication. Please try again.',
                visibilityTime: 4000,
                autoHide: true,
            });
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
                onPress={() => setGenericModalVisible(true)}
            >
                <Text style={styles.dropdownButtonText}>
                    {selectedGeneric || 'Select Generic Name'}
                </Text>
            </TouchableOpacity>

            <Modal
                transparent
                visible={genericModalVisible}
                animationType="slide"
                onRequestClose={() => setGenericModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search"
                            value={searchGeneric}
                            onChangeText={(text) => filterGeneric(text)}
                        />
                        <View style={styles.listContainer}>
                            <FlatList
                                data={generics.filter((generic) =>
                                    generic.toLowerCase().includes(searchGeneric.toLowerCase())
                                )}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleGenericSelect(item)}
                                        style={styles.categoryItem}
                                    >
                                        <Text>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                        <Button title="Close" onPress={() => setGenericModalVisible(false)} />
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
                        <Text style={styles.emptyMessage}>No medicines available for the selected generic name.</Text>
                    ) : null
                }
                renderItem={({ item, index }) => (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Brand Name</Text>
                        <Text style={styles.input}>{item.brandName}</Text>
                        <Text style={styles.label}>Dosage Strength</Text>
                        <Text style={styles.input}>{item.dosageStrength}</Text>
                        <Text style={styles.label}>Dosage Form</Text>
                        <Text style={styles.input}>{item.dosageForm}</Text>
                        <Text style={styles.label}>Classification</Text>
                        <Text style={styles.input}>{item.classification}</Text>
                        <Text style={styles.label}>Category</Text>
                        <Text style={styles.input}>{item.description}</Text>

                        <TouchableOpacity onPress={() => handleMedicineSelect(index)} style={styles.addExpi}>
                            <Text style={styles.submitAdd}>ADD STOCK</Text>
                        </TouchableOpacity>
                        {selectedMedicineIndex === index && ( // Only show options for selected medicine
                            <View style={styles.expirationAdd}>
                                {(items[index] || []).map((subIndex) => (
                                    <View key={`${index}-${subIndex}`} style={styles.expirationDate}>
                                        <View style={styles.column}>
                                            <Text style={styles.label}>Expiration Date</Text>
                                            <TouchableOpacity
                                                style={styles.dateInputContainer}
                                                onPress={() =>
                                                    setDatePickerVisible((prev) => ({
                                                        ...prev,
                                                        [`${index}-${subIndex}`]: true,
                                                    }))
                                                }
                                            >
                                                <Text style={styles.dateText}>
                                                    {expirationDates[`${index}-${subIndex}`] || "Select Date"}
                                                </Text>
                                            </TouchableOpacity>

                                            {/* Modal Date Picker */}
                                            <DateTimePickerModal
                                                isVisible={datePickerVisible[`${index}-${subIndex}`]}
                                                mode="date"
                                                onConfirm={(date) =>
                                                    handleExpirationChange(`${index}-${subIndex}`, null, date)
                                                }
                                                onCancel={() =>
                                                    setDatePickerVisible((prev) => ({
                                                        ...prev,
                                                        [`${index}-${subIndex}`]: false,
                                                    }))
                                                }
                                            />
                                        </View>

                                        <View style={styles.columnS}>
                                            <Text style={styles.label}>Stock</Text>

                                            <TextInput
                                                style={styles.Sinput}
                                                keyboardType="numeric"
                                                placeholder="Enter stock to add"
                                                value={stockInputs[`${index}-${subIndex}`] || ""}
                                                onChangeText={(text) =>
                                                    handleStockChange(`${index}-${subIndex}`, text)
                                                }
                                            />
                                        </View>

                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={() => removeItem(index, subIndex)}
                                        >
                                            <Ionicons name="trash" size={24} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                <TouchableOpacity style={styles.addButton} onPress={addNewItem}>
                                    <Text style={styles.addButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        )}





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
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        maxHeight: '60%',  // Limits the height
    },
    listContainer: {
        maxHeight: 200,  // Ensures list is scrollable within modal
    },
    searchInput: {
        backgroundColor: '#F4F4F4',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    categoryItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    inputContainer: {
        borderRadius: 10,
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        marginBottom: 0,
    },
    label: {
        color: '#666',
        marginBottom: 5,
    },
    AddCategory: {
        color: 'black',
        marginBottom: 15,
    },
    input: {
        backgroundColor: 'lightgrey',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 15,
        textAlign: 'justify',
    },
    Sinput: {
        backgroundColor: '#F4F4F4',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 15,
        textAlign: 'justify',
    },
    addExpi: {
        backgroundColor: 'black',
        paddingVertical: 5,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',

        width: 100
    },
    expirationAdd: {
        display: 'flex',
        justifyContent: 'center', // Centers children horizontally
        alignItems: 'center', // Centers children vertically
    },
    expirationDate: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Space out the columns
        alignItems: 'flex-start', // Align items at the start of each column
        marginTop: 10,
        marginHorizontal: 10
    },
    submitAdd: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: 'none',
        alignItems: 'center',
        width: 50,
        marginTop: 10
    },
    addButtonText: {
        color: '#0B607E',
        fontSize: 25,
        fontWeight: 'bold',
    },
    column: {
        width: "60%", // Ensures the columns take equal space
    },
    columnS: {
        width: "30%", // Ensures the columns take equal space
        marginHorizontal: 10
    },
    removeButton: {
        width: "10%", // Ensures the columns take equal 
        marginTop: 10

    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    Sinput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        borderRadius: 4,
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#F4F4F4',
    },
    dpicker: {
        marginTop: 10,
        fontSize: 12,
    },
    dateText: {
        fontSize: 16,
        color: '#333',
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
