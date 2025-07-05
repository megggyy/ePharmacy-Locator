import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import AuthGlobal from '@/context/AuthGlobal';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import Spinner from "../../../../assets/common/spinner";

export default function ExpiringStockScreen() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth * 0.9;
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pharmacyId, setPharmacyId] = useState(null);
  const { state } = useContext(AuthGlobal);

  useEffect(() => {
    if (state.isAuthenticated) {
      axios.get(`${baseURL}pharmacies/user/${state.user.userId}`)
        .then((res) => {
          if (res.data) {
            const pharmacyId = res.data.id;
            setPharmacyId(pharmacyId);
            fetchExpiringStock(pharmacyId);
          } else {
            console.error("No pharmacy found for this user.");
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Error fetching pharmacy details:", err);
          setLoading(false);
        });
    } else {
      router.push('/login');
    }
  }, [state.isAuthenticated, state.user.userId]);

  const fetchExpiringStock = async (pharmacyId) => {
    try {
      const response = await axios.get(`${baseURL}pharmacies/expiringStock/${pharmacyId}`);
      const { expiringInWeek, expiringInMonth, expiringIn3Months, expiringIn6Months } = response.data;

      setChartData({
        labels: ['1 Week', '1 Month', '3 Months', '6 Months'],
        datasets: [
          {
            data: [expiringInWeek, expiringInMonth, expiringIn3Months, expiringIn6Months],
          },
        ],
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching expiring stock data:', error);
      setLoading(false);
    }
  };

  const generateExcel = async () => {
    if (!chartData) {
      Alert.alert('Error', 'No data available for export.');
      return;
    }

    const data = [
      ['Time Period', 'Expiring Stock'],
      ['1 Week', chartData.datasets[0].data[0]],
      ['1 Month', chartData.datasets[0].data[1]],
      ['3 Months', chartData.datasets[0].data[2]],
      ['6 Months', chartData.datasets[0].data[3]],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expiring Stock');

    const excelBuffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    const fileUri = FileSystem.documentDirectory + 'Expiring_Stock_Report.xlsx';
    await FileSystem.writeAsStringAsync(fileUri, excelBuffer, { encoding: FileSystem.EncodingType.Base64 });

    Sharing.shareAsync(fileUri);
  };

  const generatePDF = async () => {
    if (!chartData) {
      Alert.alert('Error', 'No data available for export.');
      return;
    }

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
          <h2>Expiring Medicines Report</h2>
          <table>
            <tr><th>Time Period</th><th>Expiring Stock</th></tr>
            ${chartData.datasets[0].data.map((val, idx) => `<tr><td>${chartData.labels[idx]}</td><td>${val}</td></tr>`).join('')}
          </table>
        </body>
      </html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      Alert.alert('Success', 'PDF Generated Successfully!', [
        { text: 'Open', onPress: () => openPDF(uri) },
        { text: 'OK' },
      ]);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF.');
    }
  };

  const openPDF = async (uri) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert('Error', 'Sharing is not available on this device.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/drawer/PharmacyOwnerDrawer')}style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Expiring medicine stocks</Text>
      </View>

      <Text style={styles.chartTitle}>Stock Expiration in Time Periods</Text>

      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          width={chartWidth}
          height={350}
          chartConfig={chartConfig}
          fromZero
          showBarTops
          verticalLabelRotation={60}
          style={styles.chartStyle}
        />
      </View>

      <TouchableOpacity style={styles.exportButton} onPress={generateExcel}>
        <Text style={styles.exportButtonText}>Export to Excel</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exportButton} onPress={generatePDF}>
        <Text style={styles.exportButtonText}>Export to PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exportButton} onPress={() => router.push('/screens/PharmacyOwner/Medications/ExpiringMedications')}>
        <Text style={styles.exportButtonText}>See Detailed Report</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  color: (opacity = 1) => `rgba(0, 139, 139, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.8,
  decimalPlaces: 0,
};

const styles = StyleSheet.create({
  scrollContainer: { paddingBottom: 20 },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#005b7f', paddingTop: 10, paddingBottom: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  backButton: { position: 'absolute', left: 10, top: 15 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  chartTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 40, // Reduced padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  chartStyle: {
    marginVertical: 10, // Reduce margin to fit better
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  exportButton: { backgroundColor: '#005b7f', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20, marginHorizontal: 20 },
  exportButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
