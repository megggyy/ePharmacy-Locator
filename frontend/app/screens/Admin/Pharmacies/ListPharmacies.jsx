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

var { height, width } = Dimensions.get("window");

const PharmacyTableScreen = () => {
  const router = useRouter();
  const [pharmaciesList, setPharmaciesList] = useState([]);
  const [pharmaciesFilter, setPharmaciesFilter] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchPharmacies = (text) => {
    if (text === "") {
      setPharmaciesFilter(pharmaciesList);
    } else {
      setPharmaciesFilter(
        pharmaciesList.filter((i) =>
          i.userInfo.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchPharmacies = () => {
        axios
          .get(`${baseURL}pharmacies`)
          .then((res) => {
            setPharmaciesList(res.data);
            setPharmaciesFilter(res.data);
            setLoading(false);
          })
          .catch((err) => {
            console.error('Error fetching pharmacies:', err.message);
            setLoading(false);
          });
      };
  
      // Fetch pharmacies initially
      fetchPharmacies();
  
      const interval = setInterval(fetchPharmacies, 5000);
  
      return () => {
        clearInterval(interval); // Clear interval when screen loses focus
        setPharmaciesList([]);
        setPharmaciesFilter([]);
        setLoading(true);
      };
    }, [])
  );

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
              onChangeText={(text) => searchPharmacies(text)}
              style={{ flex: 1 }}
            />
          </View>

          <ScrollView>
          <Text style={styles.tableTitle}>PHARMACIES</Text>
            <DataTable>
              <DataTable.Header style={{ backgroundColor: '#0B607E' }}>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={styles.headerText}>PERMITS</Text></DataTable.Title>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={styles.headerText}>NAME</Text></DataTable.Title>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={styles.headerText}>ADDRESS</Text></DataTable.Title>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={styles.headerText}>STATUS</Text></DataTable.Title>
              </DataTable.Header>

              {pharmaciesFilter.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push(`/screens/Admin/Pharmacies/ReadPharmacy?id=${item._id}`)}
                  style={{
                    backgroundColor: index % 2 === 0 ? 'lightgray' : 'gainsboro',
                  }}
                >
                  <DataTable.Row style={styles.rowCell}>
                    <DataTable.Cell style={styles.imageCell}>
                      <Image
                        source={{ uri: item.images[0] }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.textCell}>
                      <Text style={styles.cellText}>{item.userInfo.name}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.textCell}>
                      <Text style={styles.cellText}>
                        {`${item.userInfo.street}, ${item.userInfo.barangay}, ${item.userInfo.city}`}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.textCell}>
                      <Text style={styles.cellText}>
                        {item.approved ? 'APPROVED' : 'PENDING'}
                      </Text>
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
});

export default PharmacyTableScreen;
