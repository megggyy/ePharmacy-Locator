import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet } from 'react-native';
import medicinesData from '../../../../assets/medicines/branded.json'; // Adjust path if different

const CreateBrandedMedicines = () => {
  const [medicines, setMedicines] = useState(medicinesData);
  const [stockInput, setStockInput] = useState({});

  const handleAddStock = (index) => {
    const updatedMedicines = medicines.map((medicine, i) => {
      if (i === index) {
        return { ...medicine, stock: medicine.stock + (parseInt(stockInput[index]) || 0) };
      }
      return medicine;
    });
    setMedicines(updatedMedicines);
    setStockInput({ ...stockInput, [index]: '' }); // Reset input field
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medicine Stock Management</Text>
      <FlatList
        data={medicines}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.medicineContainer}>
            <Text style={styles.medicineName}>{item.name}</Text>
            <Text style={styles.medicineDescription}>{item.description}</Text>
            <Text>Stock: {item.stock}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter stock to add"
              value={stockInput[index] || ''}
              onChangeText={(text) => setStockInput({ ...stockInput, [index]: text })}
            />
            <Button title="Add Stock" onPress={() => handleAddStock(index)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  medicineContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  medicineDescription: {
    fontSize: 14,
    marginBottom: 10
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8
  }
});

export default CreateBrandedMedicines;
