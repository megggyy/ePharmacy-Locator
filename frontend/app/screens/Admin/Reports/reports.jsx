import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Modal, Dimensions, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DataTable, Searchbar, Button } from "react-native-paper";
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { TabView, TabBar } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import AuthGlobal from '@/context/AuthGlobal';
import baseURL from '@/assets/common/baseurl';
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ViewShot from "react-native-view-shot";
import { captureRef } from "react-native-view-shot";
import { useRef } from "react";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function AdminReportsScreen() {
    const screenWidth = Dimensions.get("window").width;
    const chartWidth = screenWidth * 0.9;
    const { state } = useContext(AuthGlobal);
    const [index, setIndex] = useState(0); 
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pharmacies, setPharmacies] = useState([]);
    const [filteredPharmacies, setFilteredPharmacies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true); 
    // 🔹 Date range state
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [datePickerMode, setDatePickerMode] = useState(null);

    // overview
    const [counts, setCounts] = useState({
        customers: 0,
        pharmacies: 0,
        admins: 0,
        barangays: 0,
        expiringPharmacies: 0,
        medicines: 0,
        categories: 0,
        scannedPrescriptions: 0 
    });

    // charts
    const [chartData, setChartData] = useState(null);
    const [chartData2, setChartData2] = useState(null);
    const [chartData3, setChartData3] = useState([]);
    const [chartData4, setChartData4] = useState([]);
    const [scannedMedicinesData, setScannedMedicinesData] = useState({ labels: [], data: [] });
    const [customersData, setCustomersData] = useState({ labels: [], data: [] });
   
    // export as pdf
    const chart1Ref = useRef(null);
    const chart2Ref = useRef(null);
    const chart3Ref = useRef(null);
    const chart4Ref = useRef(null);
    const chart5Ref = useRef(null);
    const chart6Ref = useRef(null);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const response = await axios.get(`${baseURL}feedbacks/pharmacy-rating-distribution`);
                const data = response.data;
    
                const labels = ["0-1", "1.01-2", "2.01-3", "3.01-4", "4.01-5"];
                const values = labels.map((label) => data[label] || 0);
    
                setChartData({
                    labels,
                    datasets: [
                        {
                            data: values,
                            color: (opacity = 1) => `rgba(0, 139, 139, ${opacity})`,
                            strokeWidth: 2,
                        },
                    ],
                });
    
            } catch (error) {
                console.error("Error fetching pharmacy rating distribution:", error);
            }
        };
    
        const fetchCustomersData = async () => {
            try {
              const response = await axios.get(`${baseURL}users/customersPerMonth`);
              const result = response.data;
      
              if (result.success) {
                const labels = result.getUsersPerMonth.map((item) => item.month);
                const data = result.getUsersPerMonth.map((item) => item.total);
      
                setCustomersData({ labels, data });
                setLoading(false);  // Set loading to false once data is fetched
              }
            } catch (error) {
              console.error('Error fetching customers per month data:', error);
            }
          };

        const fetchScannedMedicines = async () => {
            try {
              const response = await axios.get(`${baseURL}customers/mostScannedMedicines`);
              const result = response.data;
        
              if (result.success) {
                const labels = result.mostScannedMedicines.map((item) => item._id);
                const data = result.mostScannedMedicines.map((item) => item.count);
        
                setScannedMedicinesData({ labels, data });
              }
            } catch (error) {
              console.error("Error fetching most scanned medicines:", error);
            }
          };

          const fetchData2 = async () => {
            try {
              const response = await axios.get(`${baseURL}users/pharmaciesPerMonth`); // Replace with your backend URL
              const { getUsersPerMonth } = response.data;
      
              // Map the response to chart data format
              const labels = getUsersPerMonth.map((item) => `${item.month} ${item.year}`);
              const data = getUsersPerMonth.map((item) => item.total);
      
              setChartData2({
                labels,
                datasets: [
                  {
                    data,
                    color: (opacity = 1) => `rgba(0, 139, 139, ${opacity})`,
                    strokeWidth: 3,
                  },
                ],
              });
      
              setLoading(false);
            } catch (error) {
              console.error('Error fetching users per month:', error);
              setLoading(false);
            }
          };
          const fetchPharmaciesData = async () => {
            try {
              const response = await axios.get(`${baseURL}pharmacies/pharmaciesPerBarangay`);
              const result = response.data;
      
              if (result.success) {
                const formattedData = result.data.map((item, index) => ({
                  name: item.barangay || 'Unknown',
                  population: item.count,
                  color: getRandomColor(index),
                  legendFontColor: '#333',
                  legendFontSize: 10,
                }));
      
                setChartData3(formattedData);
              }
            } catch (error) {
              console.error('Error fetching pharmacies per barangay data:', error);
            }
          };

          const fetchMedicinesData = async () => {
            try {
              const response = await axios.get(`${baseURL}medicine/medicinesPerCategory`);
              const result = response.data;
      
              if (result.success) {
                const formattedData = result.data.map((item, index) => ({
                  name: item.name || 'Unknown',
                  population: item.count,
                  color: getRandomColor(index),
                  legendFontColor: '#333',
                  legendFontSize: 12,
                }));
      
                setChartData4(formattedData);
              }
            } catch (error) {
              console.error('Error fetching medicines per category data:', error);
            }
          };

          const fetchData = async () => {
            try {
                const [
                    usersRes, 
                    pharmaciesRes, 
                    adminsRes, 
                    barangaysRes, 
                    medicinesRes, 
                    categoriesRes, 
                    pharmaciesWithExpiryRes,
                    prescriptionsRes
                ] = await Promise.all([
                    axios.get(`${baseURL}users`),
                    axios.get(`${baseURL}pharmacies`),
                    axios.get(`${baseURL}users/admins`),
                    axios.get(`${baseURL}barangays`),
                    axios.get(`${baseURL}medicine`),
                    axios.get(`${baseURL}medication-category`),
                    axios.get(`${baseURL}pharmacies/json`),
                    axios.get(`${baseURL}prescriptions`) 
                ]);
        
                const pharmacies = pharmaciesRes.data;
                const expiryPharmacies = pharmaciesWithExpiryRes.data;
                const customers = usersRes.data.filter(user => user.role === "Customer");
                const scannedPrescriptions = prescriptionsRes.data.length;

                // Default date range: Next 30 days
                const currentDate = moment();
                const defaultEndDate = moment().add(30, "days");
        
                const mergedPharmacies = pharmacies.map(pharmacy => {
                    const matchingExpiryPharmacy = expiryPharmacies.find(
                        expiryPharmacy => expiryPharmacy.pharmacyName.toLowerCase() === pharmacy.userInfo.name.toLowerCase()
                    );
        
                    return {
                        ...pharmacy,
                        pharmacyName: pharmacy.userInfo.name,
                        expiryDate: matchingExpiryPharmacy ? matchingExpiryPharmacy.expiryDate : null
                    };
                });
        
                // If no custom date range is selected, apply default 30-day filter
                const expiringPharmacies = mergedPharmacies.filter(pharmacy => {
                    try {
                        if (!pharmacy.userInfo || !pharmacy.expiryDate) return false;
                        const formattedExpiryDate = moment(pharmacy.expiryDate, "MMMM D, YYYY", true);
                        return formattedExpiryDate.isValid() &&
                            formattedExpiryDate.isAfter(currentDate) &&
                            formattedExpiryDate.isBefore(defaultEndDate);
                    } catch (error) {
                        console.log(`Error parsing`, error);
                        return false;
                    }
                });
        
                setPharmacies(mergedPharmacies); // Store all pharmacies without filters
                setFilteredPharmacies(expiringPharmacies); // Default display: 30-day expiring pharmacies
        
                setCounts({
                    customers: customers.length,
                    pharmacies: pharmacies.length,
                    admins: adminsRes.data.length,
                    barangays: barangaysRes.data.length,
                    expiringPharmacies: expiringPharmacies.length,
                    medicines: medicinesRes.data.length,
                    categories: categoriesRes.data.length,
                    scannedPrescriptions
                });
        
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        
    
        const loadData = async () => {
            await Promise.all([fetchChartData(), fetchData(), fetchData2(), fetchPharmaciesData(), fetchMedicinesData(), fetchCustomersData(), fetchScannedMedicines()]);
            setLoading(false);  // ✅ Set loading to false after all data is fetched
        };
    
        loadData();
    }, []);
    
  
    const getRandomColor = (index) => {
        const colors = [
          '#0B607E', '#A0C4FF', '#4D7EA8', '#357ABD', '#78C6A3', '#F5F595', '#F28B82', '#FFD700',
        ];
        return colors[index % colors.length];
      };

    const topMedicines = scannedMedicinesData.labels
    .map((label, index) => ({ name: label, count: scannedMedicinesData.data[index] }))
    .sort((a, b) => b.count - a.count) // Sort descending
    .slice(0, 5); // Get top 5

    const handleSearch = (query) => {
        setSearchQuery(query);
        setFilteredPharmacies(pharmacies.filter(pharmacy => 
            pharmacy.pharmacyName.toLowerCase().includes(query.toLowerCase())
        ));
    };

     // 🔹 Filter pharmacies based on search and date range
     const applyFilters = () => { 
        let filtered = pharmacies.filter(pharmacy => 
            pharmacy.pharmacyName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    
        if (startDate && endDate) {
            // Apply custom date range if selected
            filtered = filtered.filter(pharmacy => {
                if (!pharmacy.expiryDate) return false;
                const expiryMoment = moment(pharmacy.expiryDate, "MMMM D, YYYY", true);
                return expiryMoment.isValid() && expiryMoment.isBetween(startDate, endDate, null, '[]');
            });
        } else {
            // Default: Next 30 days filter
            const currentDate = moment();
            const defaultEndDate = moment().add(30, "days");
    
            filtered = filtered.filter(pharmacy => {
                if (!pharmacy.expiryDate) return false;
                const expiryMoment = moment(pharmacy.expiryDate, "MMMM D, YYYY", true);
                return expiryMoment.isValid() && expiryMoment.isAfter(currentDate) && expiryMoment.isBefore(defaultEndDate);
            });
        }
    
        setFilteredPharmacies(filtered);
    };
    

    useEffect(() => {
        applyFilters();
    }, [searchQuery, startDate, endDate]);

    const openDatePicker = (mode) => setDatePickerMode(mode);

    const handleDateConfirm = (date) => {
        if (datePickerMode === "start") setStartDate(moment(date));
        if (datePickerMode === "end") setEndDate(moment(date));
        setDatePickerMode(null);
    };

    const formatLabel = (label) => {
        return label.length > 10 ? label.substring(0, 10) + "..." : label;
      };

    // export as pdf
    const exportReportsAsPDF = async () => {
        try {
            const chartImages = await captureCharts(); // Capturing charts as base64 images
    
            const chartDataTables = [
                {
                    title: "Pharmacy Feedback Rating Distribution",
                    labels: chartData?.labels || [],
                    values: chartData?.datasets?.[0]?.data || []
                },
                {
                    title: "Monthly Registrations of Pharmacies",
                    labels: chartData2?.labels || [],
                    values: chartData2?.datasets?.[0]?.data || []
                },
                {
                    title: "Number of Pharmacies per Barangay",
                    labels: chartData3?.map(item => item.name) || [],
                    values: chartData3?.map(item => item.population) || []
                },
                {
                    title: "Number of Medicines per Category",
                    labels: chartData4?.map(item => item.name) || [],
                    values: chartData4?.map(item => item.population) || []
                },
                {
                    title: "Monthly New Customers",
                    labels: customersData?.labels || [],
                    values: customersData?.data || []
                },
                {
                    title: "Most Scanned Medicines",
                    labels: scannedMedicinesData?.labels || [],
                    values: scannedMedicinesData?.data || []
                }
            ];
    
            let htmlContent = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h2 { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; page-break-inside: avoid; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                    th { background-color: #f2f2f2; }
                    .chart-container { page-break-before: always; text-align: center; margin-top: 20px; }
                    img { width: 100%; max-width: 500px; height: auto; }
                </style>
            </head>
            <body>
                <h2>Admin Reports</h2>
    
                <h3>Overview</h3>
                <table>
                    <tr><th>Metric</th><th>Count</th></tr>
                    ${Object.entries(counts).map(([key, value]) => 
                        `<tr><td>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td><td>${value}</td></tr>`).join("")
                    }
                </table>
    
                <h3>Expiring Pharmacies</h3>
                <table>
                    <tr><th>Name</th><th>Expiry Date</th></tr>
                    ${filteredPharmacies.map(p => 
                        `<tr><td>${p.pharmacyName}</td><td>${p.expiryDate || 'N/A'}</td></tr>`).join("")
                    }
                </table>
    
                ${chartImages.map((img, index) => {
                    if (chartDataTables[index].title === "Number of Medicines per Category") {
                        // Special case: Two-column table for "Number of Medicines per Category"
                        const categoryLabels = chartDataTables[index].labels;
                        const categoryValues = chartDataTables[index].values;
                
                        let twoColumnTable = "<table><tr><th>Category</th><th>Count</th><th>Category</th><th>Count</th></tr>";
                
                        for (let i = 0; i < categoryLabels.length; i += 2) {
                            twoColumnTable += `
                                <tr>
                                    <td>${categoryLabels[i] || ""}</td>
                                    <td>${categoryValues[i] || ""}</td>
                                    <td>${categoryLabels[i + 1] || ""}</td>
                                    <td>${categoryValues[i + 1] || ""}</td>
                                </tr>
                            `;
                        }
                        twoColumnTable += "</table>";
                
                        return `
                            <div class="chart-container">
                                <h4>${chartDataTables[index].title}</h4>
                                <img src="${img}" />
                                ${twoColumnTable}
                            </div>
                        `;
                    } else {
                        // Regular chart tables
                        return `
                            <div class="chart-container">
                                <h4>${chartDataTables[index].title}</h4>
                                <img src="${img}" />
                                <table>
                                    <tr><th>Label</th><th>Value</th></tr>
                                    ${chartDataTables[index].labels.map((label, i) => `
                                        <tr>
                                            <td>${label}</td>
                                            <td>${chartDataTables[index].values[i]}</td>
                                        </tr>
                                    `).join("")}
                                </table>
                            </div>
                        `;
                    }
                }).join("")}                
            </body>
            </html>
            `;
    
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
        } catch (error) {
            console.error("Error exporting reports:", error);
        }
    };
    
    
    const captureCharts = async () => {
        const chartRefs = [chart1Ref, chart2Ref, chart3Ref, chart4Ref, chart5Ref, chart6Ref];
        const imageBase64Array = [];
    
        for (let ref of chartRefs) {
            if (ref.current) {
                try {
                    const uri = await captureRef(ref, { format: "png", quality: 0.8 });
                    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                    imageBase64Array.push(`data:image/png;base64,${base64}`);
                } catch (error) {
                    console.error("Error capturing chart:", error);
                }
            }
        }
        return imageBase64Array;
    };
    

    const routes = [
        { key: 'overview', title: 'Overview' },
        { key: 'pharmacies', title: 'Pharmacies' },
        { key: 'charts', title: 'Charts' },
    ];

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'overview':
                return (
                    <ScrollView style={styles.container}>
                        <View style={styles.summaryGrid}>
                            {Object.entries(counts).map(([key, value]) => (
                                <View style={styles.summaryCard} key={key}>
                                    <Text style={styles.summaryTitle}>
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </Text>
                                    <Text style={styles.summaryCount}>{value}</Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                );
            case 'pharmacies':
                return (
                    <View style={styles.pharmaciesContainer}>
                    <Searchbar
                        placeholder="Search Pharmacy"
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                    />
                    <View style={styles.dateFilterContainer}>
                        <Button mode="outlined" onPress={() => openDatePicker("start")}>
                            {startDate ? startDate.format("MMMM D, YYYY") : "Select Start Date"}
                        </Button>
                        <Button mode="outlined" onPress={() => openDatePicker("end")}>
                            {endDate ? endDate.format("MMMM D, YYYY") : "Select End Date"}
                        </Button>
                    </View>
        
                    <ScrollView>
                        <DataTable>
                            <DataTable.Header>
                                <DataTable.Title>Name</DataTable.Title>
                                <DataTable.Title>Expiry Date</DataTable.Title>
                            </DataTable.Header>
                            {filteredPharmacies.map((pharmacy, index) => (
                                <DataTable.Row key={index}>
                                    <DataTable.Cell>{pharmacy.pharmacyName}</DataTable.Cell>
                                    <DataTable.Cell>{pharmacy.expiryDate}</DataTable.Cell>
                                </DataTable.Row>
                            ))}
                        </DataTable>
                    </ScrollView>
        
                    <DateTimePickerModal
                        isVisible={!!datePickerMode}
                        mode="date"
                        onConfirm={handleDateConfirm}
                        onCancel={() => setDatePickerMode(null)}
                    />
                </View>
                );
            case 'charts':
                return (
                    <ScrollView style={styles.container}>
                    {/* Chart 1: Pharmacy Feedback Rating Distribution */}
                    <ViewShot ref={chart1Ref} options={{ format: "png", quality: 0.9 }}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Pharmacy Feedback Rating Distribution</Text>
                            {chartData ? (
                                <BarChart
                                    data={chartData}
                                    width={chartWidth}
                                    height={300}
                                    chartConfig={chartConfig}
                                    showValuesOnTopOfBars
                                    fromZero
                                    style={styles.chartStyle}
                                />
                            ) : (
                                <ActivityIndicator size="large" color="#005b7f" />
                            )}
                        </View>
                    </ViewShot>
        
                    {/* Chart 2: Monthly Registrations of Pharmacies */}
                    <ViewShot ref={chart2Ref} options={{ format: "png", quality: 0.9 }}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Monthly Registrations of Pharmacies</Text>
                            {chartData2 ? (
                                <LineChart
                                    data={chartData2}
                                    width={chartWidth}
                                    height={300}
                                    chartConfig={chartConfig}
                                    bezier
                                    style={styles.chartStyle}
                                />
                            ) : (
                                <ActivityIndicator size="large" color="#005b7f" />
                            )}
                        </View>
                    </ViewShot>
        
                    {/* Chart 3: Number of pharmacies per barangay */}
                    <ViewShot ref={chart3Ref} options={{ format: "png", quality: 0.9 }}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Number of pharmacies per barangay</Text>
                            {chartData3 ? (
                                <PieChart
                                    data={chartData3}
                                    width={screenWidth}
                                    height={220}
                                    chartConfig={chartConfig}
                                    accessor="population"
                                    backgroundColor="transparent"
                                    paddingLeft="15"
                                    center={[10, 0]}
                                    absolute
                                    style={styles.chartStyle}
                                />
                            ) : (
                                <ActivityIndicator size="large" color="#005b7f" />
                            )}
                        </View>
                    </ViewShot>
        
                    {/* Chart 4: Number of medicines per category */}
                    <ViewShot ref={chart4Ref} options={{ format: "png", quality: 0.9 }}>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Number of medicines per category</Text>
                            {chartData4 ? (
                                <PieChart
                                    data={chartData4}
                                    width={screenWidth * 0.9}
                                    height={220}
                                    chartConfig={chartConfig}
                                    accessor="population"
                                    backgroundColor="transparent"
                                    paddingLeft="15"
                                    center={[10, 0]}
                                    absolute
                                    style={styles.chartStyle}
                                />
                            ) : (
                                <ActivityIndicator size="large" color="#005b7f" />
                            )}
                        </View>
                    </ViewShot>
        
                    {/* Chart 5: Monthly New Customers */}
                    {customersData.labels.length > 0 && (
                        <ViewShot ref={chart5Ref} options={{ format: "png", quality: 0.9 }}>
                            <Text style={styles.chartTitle}>Monthly New Customers</Text>
                            <View style={styles.chartContainer}>
                                <LineChart
                                    data={{
                                        labels: customersData.labels,
                                        datasets: [
                                            {
                                                data: customersData.data.map(item =>
                                                    isNaN(item) || item === Infinity ? 0 : item
                                                ),
                                            },
                                        ],
                                    }}
                                    width={chartWidth}
                                    height={220}
                                    chartConfig={{
                                        backgroundColor: '#e26a00',
                                        backgroundGradientFrom: '#fb8c00',
                                        backgroundGradientTo: '#ffa726',
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    }}
                                    style={styles.chart}
                                />
                            </View>
                        </ViewShot>
                    )}
        
                    {/* Chart 6: Most Scanned Medicines */}
                    {scannedMedicinesData.labels.length > 0 && (
                        <ViewShot ref={chart6Ref} options={{ format: "png", quality: 0.9 }}>
                            <Text style={styles.chartTitle}>Most Scanned Medicines</Text>
                            <View style={styles.chartContainer}>
                                <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                                    <BarChart
                                        data={{
                                            labels: scannedMedicinesData.labels.map(label =>
                                                label.length > 10 ? label.substring(0, 10) + "..." : label
                                            ),
                                            datasets: [{
                                                data: scannedMedicinesData.data.map(item =>
                                                    isNaN(item) ? 0 : item
                                                )
                                            }],
                                        }}
                                        width={chartWidth}
                                        height={350}
                                        chartConfig={{
                                            backgroundColor: '#26872a',
                                            backgroundGradientFrom: '#43a047',
                                            backgroundGradientTo: '#66bb6a',
                                            decimalPlaces: 0,
                                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        }}
                                        style={styles.chart}
                                    />
                                </TouchableOpacity>
                            </View>
                        </ViewShot>
                    )}
                </ScrollView>   
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#005b7f', '#14967f']} style={styles.header}>
                <Text style={styles.headerText}>Admin Reports</Text>
                    <Button mode="contained" onPress={exportReportsAsPDF} style={{ margin: 10 }}>
                Export as PDF
            </Button>
            </LinearGradient>

            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                 initialLayout={{ width: Dimensions.get('window').width }}
                renderTabBar={props => (
                       <TabBar
                            {...props}
                            indicatorStyle={{ backgroundColor: '#005b7f' }}
                            style={{ backgroundColor: '#005b7f' }}
                            labelStyle={{ color: 'white', fontWeight: 'bold' }}
                        />
                )}
            />
        </View>
    );
}

const chartConfig = {
    backgroundColor: "#FFFFFF",
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    color: (opacity = 1) => `rgba(0, 139, 139, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    decimalPlaces: 0,
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { padding: 20, alignItems: 'center' },
    headerText: { fontSize: 20, color: 'white', fontWeight: 'bold' },
    summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', padding: 10 },
    summaryCard: { width: '45%', padding: 20, backgroundColor: '#f5f5f5', marginBottom: 10, borderRadius: 10, alignItems: 'center' },
    summaryTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
    summaryCount: { fontSize: 22, fontWeight: 'bold', color: '#005b7f', textAlign: 'center' },
    
    // expiring medicines
    pharmaciesContainer: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 20, // Equal left and right padding
        paddingTop: 20, // Equal top padding
    },
    searchBar: { marginBottom: 10 },
    dateFilterContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    
    // charts
    chartContainer: {
        width: '98%', // Ensure all charts have equal width
        alignItems: 'center', // Center charts horizontally
        justifyContent: 'center', // Center content inside vertically
        padding: 10,
        borderRadius: 10, // Rounded corners
        marginBottom: 20, // Space between charts
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center', // Centers text
        marginBottom: 10, // Spacing between title and chart
    },
    chart: {
        marginVertical: 10,
        borderRadius: 10,
        marginLeft: 10,
      },
    chartStyle: {
        borderRadius: 10,
        alignSelf: 'center', // Centers within its parent
    },     
});
