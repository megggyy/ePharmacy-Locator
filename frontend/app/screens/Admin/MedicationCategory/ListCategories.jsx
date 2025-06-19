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
  Alert
} from "react-native";
import { DataTable, Searchbar } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import baseURL from "../../../../assets/common/baseurl";
import Spinner from "../../../../assets/common/spinner";

const ITEMS_PER_PAGE = 10;

const MedicationCategoriesScreen = () => {
  const router = useRouter();
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoriesFilter, setCategoriesFilter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

  const searchCategories = (text) => {
    if (text === "") {
      setCategoriesFilter(categoriesList);
    } else {
      setCategoriesFilter(
        categoriesList.filter((i) =>
          i.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
    setPage(0);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      axios
        .get(`${baseURL}medication-category?includeDeleted=true`)
        .then((res) => {
          const reversed = res.data.reverse();
          setCategoriesList(reversed);
          setCategoriesFilter(reversed);
          setLoading(false);
        })
      setRefreshing(false);
    }, 2000);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchData = () => {
        axios
          .get(`${baseURL}medication-category?includeDeleted=true`)
          .then((res) => {
            const reversed = res.data.reverse();
            setCategoriesList(reversed);
            setCategoriesFilter(reversed);
            setLoading(false);
          })
          .catch((err) => console.error(err));
      };

      fetchData();

      const intervalId = setInterval(() => {
        fetchData();
      }, 5000);

      return () => {
        clearInterval(intervalId);
        setCategoriesList([]);
        setCategoriesFilter([]);
        setLoading(true);
      };
    }, [])
  );


  const handleToggleDelete = (category) => {
    const isDeleted = category.deleted;
    const action = isDeleted ? 'restore' : 'soft-delete';
    const confirmMsg = isDeleted
      ? 'Are you sure you want to restore this category?'
      : 'Are you sure you want to delete this category?';

    Alert.alert(
      isDeleted ? 'Confirm Restore' : 'Confirm Delete',
      confirmMsg,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: isDeleted ? 'Yes, Restore' : 'Yes, Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.put(`${baseURL}medication-category/${action}/${category._id}`);
              setCategoriesList((prev) =>
                prev.map((item) =>
                  item._id === category._id ? { ...item, deleted: !isDeleted } : item
                )
              );
              Alert.alert('Success', `Category ${isDeleted ? 'restored' : 'deleted'} successfully`);
              onRefresh();
            } catch (error) {
              console.error('Error updating category:', error);
              Alert.alert('Error', 'Failed to update category');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const paginatedData = categoriesFilter.slice(
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
            <Image
              source={require('@/assets/images/epharmacy-logo.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>ePharmacy</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Searchbar
              placeholder="SEARCH NAME"
              onChangeText={(text) => searchCategories(text)}
              style={{ flex: 1 }}
            />
            <TouchableOpacity
              onPress={() => router.push('/screens/Admin/MedicationCategory/CreateCategory')}
              style={styles.createButton}
            >
              <Ionicons name="add-circle-outline" size={20} color="white" style={styles.icon} />
              <Text style={styles.createButtonText}>Create Category</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text style={styles.tableTitle}>MEDICINE CATEGORIES</Text>
            <DataTable>
              <DataTable.Header style={{ backgroundColor: '#0B607E' }}>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.headerText}>NAME</Text>
                </DataTable.Title>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.headerText}>STATUS</Text>
                </DataTable.Title>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.headerText}>ACTIONS</Text>
                </DataTable.Title>
              </DataTable.Header>

              {paginatedData.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push(`/screens/Admin/MedicationCategory/ReadCategory?id=${item._id}`)}
                  style={{
                    backgroundColor: index % 2 === 0 ? 'lightgray' : 'gainsboro',
                  }}
                >
                  <DataTable.Row style={styles.rowCell}>
                    <DataTable.Cell style={styles.textCell}>
                      <Text style={styles.cellText}>{item.name}</Text>
                    </DataTable.Cell>

                    <DataTable.Cell style={styles.textCell}>
                      <View
                        style={[
                          styles.statusBadge,
                          item.deleted ? styles.deletedBadge : styles.activeBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.cellText,
                            { color: item.deleted ? 'red' : 'green', fontWeight: 'bold' },
                          ]}
                        >
                          {item.deleted ? 'Deleted' : 'Active'}
                        </Text>
                      </View>
                    </DataTable.Cell>

                    <DataTable.Cell style={styles.textCell}>
                      <View style={styles.actionCell}>
                        {!item.deleted && (
                            <TouchableOpacity
                              onPress={() =>
                                router.push(`/screens/Admin/MedicationCategory/EditCategory?id=${item._id}`)
                              }
                              style={styles.actionButton}
                            >
                              <Ionicons name="create-outline" size={24} color="blue" />
                            </TouchableOpacity>
                        )}


                        <TouchableOpacity
                          onPress={() => handleToggleDelete(item)}
                          style={styles.actionButton}
                        >
                          <Ionicons
                            name={item.deleted ? 'refresh-outline' : 'trash-outline'}
                            size={24}
                            color={item.deleted ? 'green' : 'red'}
                          />
                        </TouchableOpacity>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>

                </TouchableOpacity>
              ))}

              <DataTable.Pagination
                style={styles.pagination}
                page={page}
                numberOfPages={Math.ceil(categoriesFilter.length / itemsPerPage)}
                onPageChange={(newPage) => setPage(newPage)}
                label={
                  <Text style={styles.paginationText}>
                    {`${page * itemsPerPage + 1}-${Math.min(
                      (page + 1) * itemsPerPage,
                      categoriesFilter.length
                    )} of ${categoriesFilter.length}`}
                  </Text>
                }
                theme={{
                  colors: { text: "white", primary: "white" },
                }}
              />

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
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
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
    backgroundColor: '#005b7f',
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
  actionCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  actionButton: {
    marginHorizontal: 5,
  },
  pagination: {
    backgroundColor: '#005b7f',
    paddingVertical: 5,
  },
  paginationText: {
    color: 'white',
    fontSize: 15,
    marginLeft: 100
  },
});

export default MedicationCategoriesScreen;
