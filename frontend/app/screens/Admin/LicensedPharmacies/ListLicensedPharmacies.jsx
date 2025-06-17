import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { DataTable, Searchbar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import Spinner from "../../../../assets/common/spinner";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import baseURL from "../../../../assets/common/baseurl";

const ITEMS_PER_PAGE = 10;

const LicensedPharmaciesScreen = () => {
  const router = useRouter();
  const [pharmaciesList, setPharmaciesList] = useState([]);
  const [pharmaciesFilter, setPharmaciesFilter] = useState([]);
  const [barangaysList, setBarangaysList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [itemsPerPage] = useState(ITEMS_PER_PAGE);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(null);

  const searchCategories = (text, barangayFilter = selectedFilter) => {
    setSearchText(text);
    let filtered = pharmaciesList.filter((i) =>
      ["licenseNumber", "pharmacyName", "address"].some((key) =>
        i[key]?.toLowerCase().includes(text.toLowerCase())
      )
    );
    if (barangayFilter) {
      filtered = filtered.filter((i) =>
        i.address?.toLowerCase().includes(barangayFilter.toLowerCase())
      );
    }
    setPharmaciesFilter(filtered);
    setPage(0);
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const [pharmacyRes, barangayRes] = await Promise.all([
            axios.get(`${baseURL}pharmacies/json`),
            axios.get(`${baseURL}barangays`),
          ]);
          setPharmaciesList(pharmacyRes.data);
          setPharmaciesFilter(pharmacyRes.data);
          setBarangaysList(barangayRes.data);
          setLoading(false);
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();

      return () => {
        setPharmaciesList([]);
        setPharmaciesFilter([]);
        setBarangaysList([]);
        setLoading(true);
      };
    }, [])
  );

  const paginatedData = pharmaciesFilter.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Image source={require('@/assets/images/epharmacy-logo.png')} style={styles.logo} />
            <Text style={styles.title}>ePharmacy</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Searchbar
              placeholder="SEARCH LICENSED NUMBER, PHARMACY NAME, ADDRESS"
              onChangeText={(text) => searchCategories(text)}
              value={searchText}
              style={{ flex: 1 }}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {barangaysList
              .filter((barangay) =>
                pharmaciesList.some((pharmacy) =>
                  pharmacy.address?.toLowerCase().includes(barangay.name.toLowerCase())
                )
              )
              .map((barangay) => (
                <TouchableOpacity
                  key={barangay.id}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor:
                        selectedFilter === barangay.name ? "#ccc" : "#0B607E",
                    },
                  ]}
                  onPress={() => {
                    const newFilter = selectedFilter === barangay.name ? null : barangay.name;
                    setSelectedFilter(newFilter);
                    searchCategories(searchText, newFilter);
                  }}
                >
                  <Text
                    style={[
                      styles.filterText,
                      {
                        color: selectedFilter === barangay.name ? "black" : "white",
                      },
                    ]}
                  >
                    {barangay.name}
                  </Text>

                </TouchableOpacity>
              ))}
          </ScrollView>



          <ScrollView>
            <Text style={styles.tableTitle}>LICENSED PHARMACIES</Text>
            <DataTable>
              <DataTable.Header style={{ backgroundColor: '#0B607E' }}>
                <DataTable.Title style={styles.textCell}><Text style={styles.headerText}>LICENSE NUMBER</Text></DataTable.Title>
                <DataTable.Title style={styles.textCell}><Text style={styles.headerText}>NAME</Text></DataTable.Title>
                <DataTable.Title style={styles.textCell}><Text style={styles.headerText}>ADDRESS</Text></DataTable.Title>
              </DataTable.Header>

              {paginatedData.map((item, index) => (
                <DataTable.Row
                  key={index}
                  style={styles.rowCell}
                  onPress={() => {
                    setSelectedPharmacy(item);
                    setModalVisible(true);
                  }}
                >
                  <DataTable.Cell style={styles.textCell}><Text style={styles.cellText}>{item.licenseNumber}</Text></DataTable.Cell>
                  <DataTable.Cell style={styles.textCell}><Text style={styles.cellText}>{item.pharmacyName}</Text></DataTable.Cell>
                  <DataTable.Cell style={styles.textCell}><Text style={styles.cellText}>{item.address}</Text></DataTable.Cell>
                </DataTable.Row>
              ))}

              <DataTable.Pagination
                style={styles.pagination}
                page={page}
                numberOfPages={Math.ceil(pharmaciesFilter.length / itemsPerPage)}
                onPageChange={(newPage) => setPage(newPage)}
                label={<Text style={styles.paginationText}>{`${page * itemsPerPage + 1}-${Math.min((page + 1) * itemsPerPage, pharmaciesFilter.length)} of ${pharmaciesFilter.length}`}</Text>}
                theme={{ colors: { text: "white", primary: "white" } }}
              />
            </DataTable>
          </ScrollView>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Pharmacy Details</Text>
                {selectedPharmacy && (
                  <View style={styles.detailsContainer}>
                    <Text style={styles.label}>License Number:</Text>
                    <Text style={styles.value}>{selectedPharmacy.licenseNumber}</Text>

                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{selectedPharmacy.pharmacyName}</Text>

                    <Text style={styles.label}>Owner:</Text>
                    <Text style={styles.value}>{selectedPharmacy.owner}</Text>

                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>{selectedPharmacy.address}</Text>

                    <Text style={styles.label}>Issuance Date:</Text>
                    <Text style={styles.value}>{selectedPharmacy.issuanceDate}</Text>

                    <Text style={styles.label}>Expiry Date:</Text>
                    <Text style={styles.value}>{selectedPharmacy.expiryDate}</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: "white" }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#0B607E', paddingTop: 20, paddingBottom: 20, alignItems: 'center' },
  backButton: { position: 'absolute', top: 20, left: 20 },
  logo: { width: 60, height: 60 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  buttonContainer: { margin: 10, alignSelf: 'center', flexDirection: 'row' },
  filterRow: {
    marginHorizontal: 10,
    flexDirection: 'row',
    paddingVertical: 5,
    height: 75,
  },

  filterButton: {
    marginRight: 8,
    paddingHorizontal: 14,
    height: 35,
    borderRadius: 20,
    backgroundColor: '#0B607E',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },

  filterText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },

  tableTitle: { textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginVertical: 10, paddingVertical: 10, color: 'white', backgroundColor: '#005b7f' },
  rowCell: { paddingTop: 10, paddingBottom: 13 },
  textCell: { flex: 1, justifyContent: 'center' },
  cellText: { textAlign: 'center', flexWrap: 'wrap' },
  headerText: { color: 'white', fontWeight: 'bold' },
  pagination: { backgroundColor: '#005b7f', paddingVertical: 5 },
  paginationText: { color: 'white', fontSize: 15, marginLeft: 100 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", margin: 10 },
  detailsContainer: { backgroundColor: 'white', borderRadius: 10, padding: 10, margin: 10 },
  label: { fontWeight: 'bold', fontSize: 18, marginBottom: 5 },
  value: { backgroundColor: '#F4F4F4', borderRadius: 5, paddingHorizontal: 10, paddingVertical: 10, marginBottom: 15, textAlign: 'justify' },
  closeButton: { marginTop: -10, padding: 10, paddingHorizontal: 20, backgroundColor: "#005b7f", borderRadius: 5 },
});

export default LicensedPharmaciesScreen;
