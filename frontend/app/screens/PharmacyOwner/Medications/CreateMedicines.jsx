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
import Spinner from "../../../../assets/common/spinner";

import axios from "axios";
import Toast from 'react-native-toast-message';

const CreateMedicines = () => {
    const router = useRouter();

    const [generics, setGenerics] = useState([]);
    const [filteredGeneric, setFilteredGeneric] = useState([]);
    const [searchGeneric, setSearchGeneric] = useState('');
    const [selectedGeneric, setSelectedGeneric] = useState('');

    const [medicines, setMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [searchMedicine, setSearchMedicine] = useState('');

    const [genericModalVisible, setGenericModalVisible] = useState(false);
    const [selectedMedicineIndex, setSelectedMedicineIndex] = useState(null);

    const [items, setItems] = useState({});
    const [stockInputs, setStockInputs] = useState({});
    const [expirationDates, setExpirationDates] = useState({});
    const [datePickerVisible, setDatePickerVisible] = useState({});

    const { state } = useContext(AuthGlobal);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGenericNames();
    }, []);

    const fetchGenericNames = async () => {
        try {
            const response = await axios.get(`${baseURL}medicine/json`);
            const map = new Map();

            response.data.forEach(item => {
                const key = item.genericName.trim().toLowerCase().replace(/\s+/g, '');
                if (!map.has(key)) map.set(key, item.genericName.trim());
            });

            const uniqueGenerics = Array.from(map.values());
            setGenerics(uniqueGenerics);
            setFilteredGeneric(uniqueGenerics);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const filterGeneric = (text) => {
        setSearchGeneric(text);
        if (!text.trim()) {
            setFilteredGeneric(generics);
        } else {
            const lower = text.toLowerCase();
            setFilteredGeneric(
                generics.filter(g => g.toLowerCase().includes(lower))
            );
        }
    };

    const handleGenericSelect = async (generic) => {
        setSelectedGeneric(generic);
        setGenericModalVisible(false);
        setSearchGeneric('');
        setSearchMedicine('');
        setMedicines([]);
        setFilteredMedicines([]);

        try {
            const res = await axios.get(`${baseURL}medicine/json`);
            const normalized = generic.trim().toLowerCase();

            const matched = res.data.filter(item =>
                item.genericName?.trim().toLowerCase() === normalized
            );

            const map = new Map();
            matched.forEach(item => {
                const brand = item.brandName?.trim() || '';
                const key = [
                    brand.toLowerCase(),
                    (item.dosageStrength || '').toLowerCase(),
                    (item.dosageForm || '').toLowerCase(),
                    (item.classification || '').toLowerCase(),
                    (item.category || '').toLowerCase(),
                    (item.description || '').toLowerCase()
                ].join('|');

                if (brand && !map.has(key)) {
                    map.set(key, {
                        brandName: brand,
                        dosageStrength: item.dosageStrength || '',
                        dosageForm: item.dosageForm || '',
                        classification: item.classification || '',
                        category: item.category || '',
                        description: item.description || '',
                    });
                }
            });

            const uniqueDetails = Array.from(map.values());

            // Filter out already existing
            const existRes = await axios.get(
                `${baseURL}medicine/existing/${state.user.userId}/${generic}`
            );
            const existing = existRes.data.map(i => i.medicine);

            const nonExisting = uniqueDetails.filter(med =>
                !existing.some(ex =>
                    ex.brandName === med.brandName &&
                    ex.dosageStrength === med.dosageStrength &&
                    ex.dosageForm === med.dosageForm &&
                    ex.classification === med.classification
                )
            );

            setMedicines(nonExisting);
            setFilteredMedicines(nonExisting);
        } catch (err) {
            console.error(err);
        }
    };

    const filterMedicines = (text) => {
        setSearchMedicine(text);
        if (!text.trim()) {
            setFilteredMedicines(medicines);
        } else {
            const lower = text.toLowerCase();
            setFilteredMedicines(
                medicines.filter(m => m.brandName.toLowerCase().includes(lower))
            );
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
            return updatedState;
        });
    };

    const handleExpirationChange = (key, event, selectedDate) => {
        setDatePickerVisible((prev) => ({
            ...prev,
            [key]: false, // Always hide the picker
        }));

        if (selectedDate) {
            const isoDate = selectedDate.toISOString().split('T')[0];
            setExpirationDates((prev) => ({
                ...prev,
                [key]: isoDate,
            }));
        } else {
            setExpirationDates((prev) => ({
                ...prev,
                [key]: null,
            }));
        }

    };

    const handleSubmit = async (index) => {

        if (!medicines || medicines.length === 0) {
            console.error("Medicines array is empty or undefined.");
            return;
        }

        const selectedMedicine = filteredMedicines[index];

        if (!selectedMedicine) {
            console.error(`No medicine found at index: ${index}`);
            return;
        }


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
                let isoDate = rawDate.trim() === '' ? null : parsedDate.toISOString().split('T')[0];


                if (stockValue) {
                    stockEntries.push({ stock: stockValue, expirationDate: isoDate });
                }


            });
        }

        console.log('TESTER: ', stockEntries)

        if (stockEntries.length === 0) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Missing Data',
                text2: 'Please enter stock.',
                visibilityTime: 4000,
                autoHide: true,
            });
            return;
        }

        try {
            await axios.post(`${baseURL}medicine/create`, {
                genericName: selectedGeneric,
                brandName: selectedMedicine.brandName,
                dosageStrength: selectedMedicine.dosageStrength,
                dosageForm: selectedMedicine.dosageForm,
                classification: selectedMedicine.classification,
                category: selectedMedicine.category,
                description: selectedMedicine.description,
                expirationPerStock: stockEntries,
                pharmacy: state.user.userId,
            });


            // Remove the added medicine from the list
            setFilteredMedicines(prev => prev.filter((_, i) => i !== index));

            const medicineToRemove = filteredMedicines[index];

            setMedicines(prev => prev.filter(med =>
                !(
                    med.brandName === medicineToRemove.brandName &&
                    med.dosageStrength === medicineToRemove.dosageStrength &&
                    med.dosageForm === medicineToRemove.dosageForm &&
                    med.classification === medicineToRemove.classification
                )
            ));


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

    return (
        <View style={styles.container}>
            {loading ? (
                <Spinner /> // Show the custom spinner component when loading
            ) : (
                <>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.push('/screens/PharmacyOwner/Medications/ListMedications')} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerText}>Add Medicine</Text>
                    </View>

                    <TouchableOpacity style={styles.dropdownButton}
                        onPress={() => setGenericModalVisible(true)}>
                        <Text style={styles.dropdownButtonText}>{selectedGeneric || 'Select Generic Name'}</Text>
                    </TouchableOpacity>

                    <Modal transparent
                        visible={genericModalVisible}
                        animationType="slide"
                        onRequestClose={() => setGenericModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search generic"
                                    value={searchGeneric}
                                    onChangeText={filterGeneric}
                                />
                                <View style={styles.listContainer}>
                                    <FlatList
                                        data={filteredGeneric}
                                        keyExtractor={item => item}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity style={styles.categoryItem}
                                                onPress={() => handleGenericSelect(item)}>
                                                <Text>{item}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                                <Button title="Close" onPress={() => setGenericModalVisible(false)} />
                            </View>
                        </View>
                    </Modal>

                    {/* MEDICINE SEARCH & LIST */}
                    <TextInput
                        placeholder="Search medicine"
                        value={searchMedicine}
                        onChangeText={filterMedicines}
                        style={styles.searchInput}
                    />
                    <FlatList
                        data={filteredMedicines}
                        keyExtractor={(item, i) => i.toString()}
                        ListEmptyComponent={() =>
                            filteredMedicines.length === 0 ? (
                                <Text style={styles.emptyMessage}>No medicines available for selected generic</Text>
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
                                                            {expirationDates[`${index}-${subIndex}`]
                                                                ? new Date(expirationDates[`${index}-${subIndex}`]).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: '2-digit',
                                                                })
                                                                : 'Select Date'}
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
                </>
            )}
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
