import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import { DataTable, Searchbar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useRouter } from 'expo-router';
import baseURL from "../../../../assets/common/baseurl";
import Spinner from "../../../../assets/common/spinner";
import AuthGlobal from '@/context/AuthGlobal';

const MedicationScreen = () => {
  const router = useRouter();
  const [medicationsList, setMedicationsList] = useState([]);
  const [medicationsFilter, setMedicationsFilter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { state, dispatch } = useContext(AuthGlobal);



  const searchMedications = (text) => {
    if (text === "") {
      setMedicationsFilter(medicationsList);
    } else {
      setMedicationsFilter(
        medicationsList.filter((i) =>
          i.name.toLowerCase().includes(text.toLowerCase())
        ) 
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      axios
        .get(`${baseURL}medicine/${state.user.userId}`)
        .then((res) => {
          setMedicationsList(res.data);
          setMedicationsFilter(res.data);
          console.log(res.data);
          setLoading(false);
        })
        .catch((err) => {

          console.error('Error message:', err.message);
          setLoading(false);
        });

      return () => {
        setMedicationsList([]);
        setMedicationsFilter([]);
        setLoading(true);
      };
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      axios
        .get(`${baseURL}medicine/${state.user.userId}`)
        .then((res) => {
          setMedicationsList(res.data);
          setMedicationsFilter(res.data);
          setLoading(false);
        })
        .catch((err) => {

          console.error('Error message:', err.message);

        })
        .finally(() => {
          setRefreshing(false);
        });
    }, 2000);
  }, []);

  const handleDelete = async (medicationId) => {
    try {
      await axios.delete(`${baseURL}medicine/delete/${medicationId}`);
      setMedicationsList(medicationsList.filter(medication => medication._id !== medicationId));
      Alert.alert('Success', 'Category deleted successfully');

      onRefresh()
    } catch (error) {
      console.error('Error deleting medication:', error);
      Alert.alert('Error', 'Failed to delete medication');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Spinner /> // Show the custom spinner component when loading
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Image
              source={require('@/assets/images/epharmacy-logo.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>ePharmacy</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Searchbar
              placeholder="SEARCH NAME"
              onChangeText={(text) => searchMedications(text)}
              style={{ flex: 1 }}
            />
            <TouchableOpacity
              onPress={() => router.push('/screens/PharmacyOwner/Medications/CreateMedicines')}
              style={styles.createButton}
            >
              <Ionicons name="add-circle-outline" size={20} color="white" style={styles.icon} />
              <Text style={styles.createButtonText}>ADD</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text style={styles.tableTitle}>MEDICINES</Text>
            <DataTable>
              <DataTable.Header style={{ backgroundColor: '#0B607E' }}>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={styles.headerText}>NAME</Text></DataTable.Title>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={styles.headerText}>CATEGORY</Text></DataTable.Title>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={styles.headerText}>STOCK</Text></DataTable.Title>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={styles.headerText}>ACTIONS</Text></DataTable.Title>
              </DataTable.Header>

              {medicationsFilter.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push(`/screens/PharmacyOwner/Medications/ReadMedication?id=${item._id}`)}
                  style={{
                    backgroundColor: index % 2 === 0 ? 'lightgray' : 'gainsboro',
                  }}
                >
                  <DataTable.Row style={styles.rowCell}>

                    <DataTable.Cell style={styles.textCell}>
                      <Text style={styles.cellText}>{item.name}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.textCell}>
                      <Text style={styles.cellText}>{item.category.name}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.textCell}>
                      <Text style={styles.cellText}>{item.stock}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.textCell}>
                      <View style={styles.actionCell}>
                        <TouchableOpacity
                          onPress={() => router.push(`/screens/PharmacyOwner/Medications/EditMedication?id=${item._id}`)}
                          style={styles.actionButton}
                        >
                          <Ionicons name="create-outline" size={24} color="black" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionButton}>
                          <Ionicons name="trash-outline" size={24} color="red" />
                        </TouchableOpacity>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                </TouchableOpacity>
              ))}
            </DataTable>
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#0B607E',
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
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
  createButton: {
    flexDirection: 'row', // Align icon and text horizontally
    alignItems: 'center', // Center items vertically
    backgroundColor: '#0B607E',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10, // Space between Searchbar and button
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5, // Space between icon and text
  },
  icon: {
    marginRight: 5, // Adjust space if needed
  },
  tableTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
    marginTop: 5,
    paddingVertical: 10,
    color: 'white',
    backgroundColor: '#0B607E',
  },
  buttonContainer: {
    margin: 10,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rowCell: {
    paddingTop: 10,
    paddingBottom: 13
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  imageCell: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
  },
  textCell: {
    flex: 1,
    justifyContent: 'center',
  },
  cellText: {
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  iconCell: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    backgroundColor: 'black',
    borderRadius: 20,
  },
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  actionButton: {
    marginHorizontal: 5,
  },
});

export default MedicationScreen;
