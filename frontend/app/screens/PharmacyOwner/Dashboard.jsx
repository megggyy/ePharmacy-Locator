import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import AuthGlobal from '@/context/AuthGlobal';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';

const screenWidth = Dimensions.get("window").width;

export default function PharmacyOwnerDashboard() {
  const [totalMedications, setTotalMedications] = useState(0);
  const [medicationData, setMedicationData] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const { state } = useContext(AuthGlobal);
  const router = useRouter();
  
  useEffect(() => {
    if (state.isAuthenticated) {
        axios.get(`${baseURL}users/${state.user.userId}`)
        .then((res) => setUserProfile(res.data))
        .catch((err) => console.error("Error fetching user profile:", err));

        axios.get(`${baseURL}medicine/${state.user.userId}`)
        .then((res) => setTotalMedications(res.data.length))
        .catch((err) => console.error("Error fetching medications:", err));

      axios.get(`${baseURL}pharmacies/user/${state.user.userId}`)
        .then((res) => {
          if (res.data) {
            const pharmacyId = res.data.id;
            axios.get(`${baseURL}pharmacies/medications-per-category/${pharmacyId}`)
              .then((medRes) => {
                const categories = Object.keys(medRes.data);
                const counts = Object.values(medRes.data);
                const pieData = categories.map((category, index) => ({
                  name: category,
                  population: counts[index],
                  color: `hsl(${index * 60}, 70%, 50%)`,
                  legendFontColor: "#333",
                  legendFontSize: 11
                }));
                setMedicationData(pieData);
              })
              .catch((err) => console.error("Error fetching medication categories:", err));
          }
        })
        .catch((err) => console.error("Error fetching pharmacy details:", err));
    } else {
      router.push('/login');
    }
  }, [state.isAuthenticated, state.user.userId]);

  const exportToPDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; color: #005b7f; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 10px; text-align: center; }
            th { background-color: #005b7f; color: white; }
          </style>
        </head>
        <body>
          <h2>Medication Summary Report</h2>
          <table>
            <tr><th>Category</th><th>Count</th></tr>
            ${medicationData.map(item => `<tr><td>${item.name}</td><td>${item.population}</td></tr>`).join('')}
          </table>
        </body>
      </html>`;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri);
  };

  const exportToExcel = async () => {
    const ws = XLSX.utils.json_to_sheet(medicationData.map(item => ({ Category: item.name, Count: item.population })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Medications");
    const base64 = XLSX.write(wb, { type: "base64" });
    const filePath = `${FileSystem.cacheDirectory}Medications.xlsx`;
    await FileSystem.writeAsStringAsync(filePath, base64, { encoding: FileSystem.EncodingType.Base64 });
    await Sharing.shareAsync(filePath);
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar backgroundColor="#005b7f" barStyle="light-content" />  
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuIcon} onPress={() => router.push('/drawer/PharmacyOwnerDrawer')}>
          <Ionicons name="menu" size={30} color="white" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userProfile?.name || "Loading..."}</Text>
          <Text style={styles.userRole}>Pharmacy Owner</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total Medications</Text>
        <Text style={styles.summaryCount}>{totalMedications}</Text>
      </View>

      <Text style={styles.chartTitle}>Medications per Category</Text>
      {medicationData.length > 0 ? (
        <PieChart
          data={medicationData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#0B607E",
            backgroundGradientFrom: "#0B607E",
            backgroundGradientTo: "#0B607E",
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <Text style={styles.noDataText}>No Data Available</Text>
      )}

     

      <TouchableOpacity style={styles.exportButton} onPress={exportToPDF}>
        <Text style={styles.exportButtonText}>Export to PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exportButton} onPress={exportToExcel}>
        <Text style={styles.exportButtonText}>Export to Excel</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.manageButton} onPress={() => router.push('/screens/PharmacyOwner/Medications/ListMedications')} >
        <Text style={styles.manageButtonText}>Manage Medications</Text>
        <Ionicons name="chevron-forward" size={24} color="white" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#005b7f' },
  menuIcon: { marginRight: 10 },
  userInfo: { alignItems: 'flex-start', marginLeft: 10 },
  userName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  userRole: { color: 'white', fontSize: 12 },
  summaryCard: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 10, alignItems: 'center' },
  summaryTitle: { fontSize: 16, color: '#666' },
  summaryCount: { fontSize: 32, fontWeight: 'bold', color: '#0B607E' },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginTop: 20,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B607E',
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 30,
  },
  manageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  exportButton: { backgroundColor: '#005b7f', padding: 12, borderRadius: 8, alignItems: 'center', margin: 10 },
  exportButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});