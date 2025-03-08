import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal
} from "react-native";
import { DataTable, Searchbar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Toast from "react-native-toast-message";
import baseURL from "../../../../assets/common/baseurl";
import Spinner from "../../../../assets/common/spinner";

var { height, width } = Dimensions.get("window");

const ListAdminScreen = () => {
  const router = useRouter();
  const [adminList, setAdminList] = useState([]);
  const [adminFilter, setAdminFilter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);



  const searchAdmin = (text) => {
    if (text === "") {
      setAdminFilter(adminList);
    } else {
      setAdminFilter(
        adminList.filter((i) =>
          i.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchAdmins = () => {
        axios
          .get(`${baseURL}users/admins`)
          .then((res) => {
            setAdminList(res.data);
            setAdminFilter(res.data);
            setLoading(false);
          })
          .catch((err) => {
            console.error('Error fetching pharmacies:', err.message);
            setLoading(false);
          });
      };

      // Fetch pharmacies initially
      fetchAdmins();

      const interval = setInterval(fetchAdmins, 5000);

      return () => {
        clearInterval(interval); // Clear interval when screen loses focus
        setAdminList([]);
        setAdminFilter([]);
        setLoading(true);
      };
    }, [])
  );

  const updateRole = async (id) => {
    setLoading(true);
  
    try {
      const res = await axios.put(`${baseURL}users/admins/updateRole/${id}`);
  
      console.log('Role updated successfully:', res.data); // Debugging log
      setModalVisible(false);
      Toast.show({ type: "success", text1: "Success", text2: "User role updated!" });
  
    } catch (err) {
  
      // Show a specific error if it's about the last admin
      if (err.response?.status === 400 && err.response?.data?.message.includes("MIN")) {
        setModalVisible(false);
        Toast.show({ type: "error", text1: "ERROR UPDATING ROLE", text2: "THERE MUST BE ATLEAST ONE ADMIN REMAINING!" });
      } else {
        setModalVisible(false);
        Toast.show({ type: "error", text1: "Error", text2: "Failed to update user role" });
      }
  
    } finally {
      setLoading(false);
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
              onChangeText={(text) => searchAdmin(text)}
              style={{ flex: 1 }}
            />
          </View>

          <ScrollView>
            <Text style={styles.tableTitle}>ADMINS</Text>
            <DataTable>
              <DataTable.Header style={{ backgroundColor: '#0B607E' }}>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={styles.headerText}>NAME</Text></DataTable.Title>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={styles.headerText}>CONTACT NUMBER</Text></DataTable.Title>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={styles.headerText}>EMAIL</Text></DataTable.Title>
              </DataTable.Header>

              {adminFilter.map((item, index) => (

                <DataTable.Row
                  key={index}
                  style={styles.rowCell}
                  onPress={() => {
                    setSelectedAdmin(item);
                    setModalVisible(true);
                  }}>
                  <DataTable.Cell style={styles.textCell}>
                    <Text style={styles.cellText}>{item.name}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.textCell}>
                    <Text style={styles.cellText}>{item.contactNumber}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.textCell}>
                    <Text style={styles.cellText}>{item.email}</Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </ScrollView>


        </>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Admin Details</Text>
            {selectedAdmin && (
              <View style={styles.detailsContainer}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{selectedAdmin.name}</Text>

                <Text style={styles.label}>Contact Number:</Text>
                <Text style={styles.value}>{selectedAdmin.contactNumber}</Text>

                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{selectedAdmin.email}</Text>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => updateRole(selectedAdmin._id)}
                >
                  <Text style={{ color: "white" }}>REMOVE AS AN ADMIN</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "white" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>


  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#005b7f',
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
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  value: {
    backgroundColor: '#F4F4F4',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 15,
    textAlign: 'justify'
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    margin: 10
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", margin: 10 },
  confirmButton: {
    padding: 10,
    paddingHorizontal: 20,
    backgroundColor: "#005b7f",
    borderRadius: 5,
    alignItems: 'center'
  },
  
  closeButton: {
    marginTop: 20,
    padding: 10,
    paddingHorizontal: 20,
    backgroundColor: "black",
    borderRadius: 5,
  },
});

export default ListAdminScreen;
