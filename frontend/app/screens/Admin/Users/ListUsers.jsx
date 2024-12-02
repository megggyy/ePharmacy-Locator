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

const UserTableScreen = () => {
  const router = useRouter();
  const [userList, setUserList] = useState([]);
  const [userFilter, setUserFilter] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchUser = (text) => {
    if (text === "") {
      setUserFilter(userList);
    } else {
      setUserFilter(
        userList.filter((i) =>
          i.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Fetch users
      axios
        .get(`${baseURL}users`)
        .then((res) => {
          setUserList(res.data);
          setUserFilter(res.data);
          setLoading(false);
        })
        .catch((err) => console.error(err));

      return () => {
        setUserList([]);
        setUserFilter([]);
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
              onChangeText={(text) => searchUser(text)}
              style={{ flex: 1 }}
            />
          </View>

          <ScrollView>
          <Text style={styles.tableTitle}>USERS</Text>
            <DataTable>
              <DataTable.Header style={{ backgroundColor: '#0B607E' }}>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={styles.headerText}>IMAGE</Text></DataTable.Title>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={styles.headerText}>NAME</Text></DataTable.Title>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={styles.headerText}>ADDRESS</Text></DataTable.Title>
                <DataTable.Title style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={styles.headerText}>DISEASE</Text></DataTable.Title>
              </DataTable.Header>

              {userFilter.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push(`/screens/Admin/Users/ReadUser?id=${item._id}`)}
                  style={{
                    backgroundColor: index % 2 === 0 ? 'lightgray' : 'gainsboro',
                  }}
                >
                  <DataTable.Row style={styles.rowCell}>
                  <DataTable.Cell style={styles.imageCell}>
                <Image
                  source={{
                    uri: item.customerDetails?.images?.[0]
                      ? item.customerDetails.images[0]
                      : 'https://via.placeholder.com/150', // Replace with your placeholder image URL
                  }}
                  style={styles.image}
                  resizeMode="cover"
                />
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.textCell}>
                      <Text style={styles.cellText}>{item.name}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.textCell}>
                      <Text style={styles.cellText}>
                        {`${item.street}, ${item.barangay}, ${item.city}`}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.textCell}>
                      <Text style={styles.cellText}>
                        {item.customerDetails && item.customerDetails.disease
                          ? item.customerDetails.disease.name
                          : 'No Disease Info'}
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

export default UserTableScreen;
