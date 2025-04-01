import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Dimensions, StyleSheet, ActivityIndicator, Image, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DataTable, Searchbar, IconButton } from "react-native-paper";
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios";
import Spinner from "@/assets/common/spinner";
import AuthGlobal from '@/context/AuthGlobal';
import { TabView, TabBar } from 'react-native-tab-view';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import baseURL from '@/assets/common/baseurl';
import PulseSpinner from '@/assets/common/spinner';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from "react-native-view-shot";
import { captureRef } from "react-native-view-shot";
import { useRef } from "react";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function PharmacyDetailsScreen() {
    const router = useRouter();
    const [pharmacy, setPharmacy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [index, setIndex] = useState(0); // Default tab index
    const { state } = useContext(AuthGlobal);

     // Expiring medicines
    const [medicationsList, setMedicationsList] = useState([]);
    const [medicationsFilter, setMedicationsFilter] = useState([]);
    const [expiryFilter, setExpiryFilter] = useState("all"); // Default: Show all
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCalendar, setShowCalendar] = useState(null); // "start" or "end"
    const [selectedDates, setSelectedDates] = useState({ start: null, end: null });
   
    const [page, setPage] = useState(0);
    const itemsPerPage = 10;

    // charts
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth * 0.9;
    const [pharmacyId, setPharmacyId] = useState(null);

    // 1st chart
    const [chartData1, setChartData1] = useState(null);
    // 2nd chart
    const [chartData2, setChartData2] = useState(null);
    const chartRef1 = useRef(null); // Reference for the first chart
    const chartRef2 = useRef(null);
    const colorPalette = [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", 
        "#FF9F40", "#8A2BE2", "#32CD32", "#DC143C", "#FFD700"
      ];

    // overview
    const [totalMedications, setTotalMedications] = useState(0);
    const [medicationData, setMedicationData] = useState([]);
    const [userProfile, setUserProfile] = useState({});


    useEffect(() => {
        const loadTabIndex = async () => {
            const savedIndex = await AsyncStorage.getItem('tabIndex');
            if (savedIndex !== null) setIndex(parseInt(savedIndex, 10));
        };
        loadTabIndex();
    }, []);

    useEffect(() => {
        const fetchPharmacyDetails = async () => {
            try {
                const token = await AsyncStorage.getItem('jwt');
                if (!token) throw new Error('User not logged in');
                
                const decoded = jwtDecode(token);
                const userId = decoded?.userId;
                if (!userId) throw new Error('User ID not found in token');

                // Fetch pharmacy details
                const response = await fetch(`${baseURL}users/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch pharmacy details');
                const data = await response.json();
                setPharmacy({ ...data });

            } catch (error) {
                Alert.alert('Error', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPharmacyDetails();
    }, []);

    // expiring meds
    useEffect(() => {
        if (!state.user?.userId || state.user.role !== "PharmacyOwner") return;
    
        axios
            .get(`${baseURL}medicine/${state.user.userId}`)
            .then((res) => {
                setMedicationsList(res.data);
                setMedicationsFilter(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [state.user.userId, state.user.role]);    

    // Function to filter medicines based on search
    const searchMedications = (text) => {
        if (text === "") {
        applyExpiryFilter(medicationsList, expiryFilter);
        } else {
        applyExpiryFilter(
            medicationsList.filter((i) =>
            [i.medicine?.genericName, i.medicine?.brandName]
                .some((field) => field?.toLowerCase().includes(text.toLowerCase()))
            ),
            expiryFilter
        );
        }
    };

    // Function to filter medicines based on expiry date range
    const applyExpiryFilter = (medications, filter) => {
        const today = new Date();
        
        const filtered = medications.filter(med => {
        return med.expirationPerStock.some(exp => {
            const expiryDate = new Date(exp.expirationDate);
            const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

            if (filter === "week") return daysLeft > 0 && daysLeft <= 7;
            if (filter === "month") return daysLeft > 0 && daysLeft <= 30;
            if (filter === "3months") return daysLeft > 0 && daysLeft <= 90;
            if (filter === "6months") return daysLeft > 0 && daysLeft <= 180;
            return true; // Show all if 'all' is selected
        });
        });

        setMedicationsFilter(filtered);
    };

    // Function to handle expiry filter change
    const handleExpiryFilterChange = (filter) => {
        setExpiryFilter(filter);
        setSelectedDates({ start: null, end: null }); // Reset date picker
        applyExpiryFilter(medicationsList, filter);
    };

    // Function to handle custom date filtering
    const filterByCustomDates = (start, end) => {
        if (!start || !end) return;
        
        const filtered = medicationsList.filter(med =>
        med.expirationPerStock.some(exp => {
            const expiryDate = new Date(exp.expirationDate);
            return expiryDate >= start && expiryDate <= end;
        })
        );

        setMedicationsFilter(filtered);
    };


  // charts
        useEffect(() => {
            if (state.isAuthenticated) {
                if (state.user.role !== "PharmacyOwner") return;
                axios.get(`${baseURL}pharmacies/user/${state.user.userId}`)
                    .then((res) => {
                        if (res.data && typeof res.data === "object" && res.data.id) {
                            const pharmacyId = res.data.id;
                            setPharmacyId(pharmacyId);
                            fetchReviewStats(pharmacyId);
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
        }, [state.isAuthenticated, state.user.userId, state.user.role]);

        const fetchReviewStats = async (pharmacyId) => {
            try {
                const response = await axios.get(`${baseURL}feedbacks/chart/${pharmacyId}`);
                const ratings = response.data;

                setChartData1({
                    labels: ["1★", "2★", "3★", "4★", "5★"],
                    datasets: [
                        {
                            data: [ratings[1], ratings[2], ratings[3], ratings[4], ratings[5]],
                            strokeWidth: 2,
                        },
                    ],
                });

                setLoading(false);
            } catch (error) {
                console.error('Error fetching review stats:', error);
                setLoading(false);
            }
        };

        const fetchExpiringStock = async (pharmacyId) => {
        try {
        const response = await axios.get(`${baseURL}pharmacies/expiringStock/${pharmacyId}`);
        const { expiringInWeek, expiringInMonth, expiringIn3Months, expiringIn6Months } = response.data;

        setChartData2({
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

    // overview
    useEffect(() => {
        if (state.isAuthenticated) {
            if (state.user.role !== "PharmacyOwner") return;
            // Fetch user profile data
            axios
            .get(`${baseURL}users/${state.user.userId}`)
            .then((res) => {
              setUserProfile(res.data);
            })
            .catch((err) => {
              console.error("Error fetching user profile:", err);
            });
    
            axios
            .get(`${baseURL}medicine/${state.user.userId}`) // Adjust this to your actual endpoint
            .then((res) => {
              const medications = res.data;
              setTotalMedications(medications.length); // Count the medications related to this pharmacy
              // Process this data to set medication categories if needed
            })
            .catch((err) => {
            console.error("Error fetching medications:", err);
            });
             
          // Fetch the pharmacy associated with this user
          axios.get(`${baseURL}pharmacies/user/${state.user.userId}`)
            .then((res) => {
              if (res.data) {
                const pharmacyId = res.data.id; // Get the pharmacy ID
                
                // Fetch medication data using the pharmacy ID
                axios.get(`${baseURL}pharmacies/medications-per-category/${pharmacyId}`)
                  .then((medRes) => {
                    const categories = Object.keys(medRes.data);
                    const counts = Object.values(medRes.data);
    
                    // Transform data for PieChart
                    const pieData = categories.map((category, index) => ({
                    name: category,
                    population: counts[index],
                    color: colorPalette[index % colorPalette.length], // Cycle through colors
                    legendFontColor: "#333",
                    legendFontSize: 11
                    }));
    
                    setMedicationData(pieData);
                  })
                  .catch((err) => console.error("Error fetching medication categories:", err));
              } else {
                console.error("No pharmacy found for this user.");
              }
            })
            .catch((err) => console.error("Error fetching pharmacy details:", err));
        } else {
          router.push('/login');
        }
    }, [state.isAuthenticated, state.user.userId, state.user.role]);


    const handleTabChange = async (newIndex) => {
        setIndex(newIndex);
        await AsyncStorage.setItem('tabIndex', newIndex.toString());
    };

    if (!pharmacy || !chartData1 || !chartData2 || medicationsList.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0B607E" />
            </View>
        );
    }    

    const exportReportAsPDF = async () => {
        if (medicationsFilter.length === 0) {
            Alert.alert("No Data", "There are no medicines to generate a PDF.");
            return;
        }
            // Capture charts as images
            const chart1Image = await captureRef(chartRef1, { format: "png", quality: 0.8 });
            const chart2Image = await captureRef(chartRef2, { format: "png", quality: 0.8 });
    
            // Convert images to base64
            const chart1Base64 = await FileSystem.readAsStringAsync(chart1Image, { encoding: FileSystem.EncodingType.Base64 });
            const chart2Base64 = await FileSystem.readAsStringAsync(chart2Image, { encoding: FileSystem.EncodingType.Base64 });
    
            // ✅ Format date range if selected
            let dateRangeText = "";
            if (selectedDates.start && selectedDates.end) {
                dateRangeText = `<p><strong>Selected Date Range:</strong> ${selectedDates.start.toLocaleDateString()} - ${selectedDates.end.toLocaleDateString()}</p>`;
            }
    
        // Format category data
        const categoryReport = medicationData.map(cat => `
            <tr>
                <td>${cat.name}</td>
                <td>${cat.population}</td>
            </tr>
        `).join("");
    
        // Format customer reviews
        const reviewStats = chartData1 ? chartData1.datasets[0].data : [];
        const reviewReport = `
            <p><strong>1★:</strong> ${reviewStats[0] || 0} reviews</p>
            <p><strong>2★:</strong> ${reviewStats[1] || 0} reviews</p>
            <p><strong>3★:</strong> ${reviewStats[2] || 0} reviews</p>
            <p><strong>4★:</strong> ${reviewStats[3] || 0} reviews</p>
            <p><strong>5★:</strong> ${reviewStats[4] || 0} reviews</p>
        `;
    
        // Format expiring stock data
        const expiringStats = chartData2 ? chartData2.datasets[0].data : [];
        const expiringReport = `
            <p><strong>Expiring in 1 Week:</strong> ${expiringStats[0] || 0} stock medicines</p>
            <p><strong>Expiring in 1 Month:</strong> ${expiringStats[1] || 0} stock medicines</p>
            <p><strong>Expiring in 3 Months:</strong> ${expiringStats[2] || 0} stock medicines</p>
            <p><strong>Expiring in 6 Months:</strong> ${expiringStats[3] || 0} stock medicines</p>
        `;
    
        // Generate HTML content for the PDF
        const html = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #005b7f; }
                h2 { color: #14967f; margin-top: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid black; padding: 8px; text-align: left; }
                th { background-color: #005b7f; color: white; }
                .pharmacy-details { margin-bottom: 20px; }
                img { width: 100%; max-width: 500px; height: auto; margin-top: 10px; }
            </style>
        </head>
        <body>
            <h1>${pharmacy.name || 'Pharmacy Report'}</h1>
            <div class="pharmacy-details">
                <h2>Pharmacy Details</h2>
                <p><strong>Address:</strong> ${pharmacy.street || ''}, ${pharmacy.barangay || ''}, ${pharmacy.city || 'N/A'}</p>
                <p><strong>Contact:</strong> ${pharmacy.contactNumber}</p>
                <p><strong>Business Days:</strong> ${pharmacy.pharmacyDetails?.businessDays || 'N/A'}</p>
                <p><strong>Hours:</strong> ${pharmacy.pharmacyDetails?.openingHour || 'N/A'} - ${pharmacy.pharmacyDetails?.closingHour || 'N/A'}</p>
            </div>

              <h2>Total Medications</h2>
                <p><strong>Total Count:</strong> ${totalMedications}</p>
    
                <h2>Medicines Per Category</h2>
                <table>
                    <tr>
                        <th>Category</th>
                        <th>Number of Medicines</th>
                    </tr>
                    ${categoryReport || "<tr><td colspan='2'>No data available</td></tr>"}
                </table>

            <h2>Customer Reviews Summary</h2>
            <img src="data:image/png;base64,${chart1Base64}" alt="Customer Reviews Chart" />
            ${reviewReport || "<p>No reviews available</p>"}

            <h2>Expiring Medicine Stock Report</h2>
            <img src="data:image/png;base64,${chart2Base64}" alt="Expiring Stock Chart" />
            ${expiringReport || "<p>No expiring stock data available</p>"}

            <h2>Expiring Medicines</h2>
            <table>
                <tr>
                    <th>Generic Name</th>
                    <th>Brand Name</th>
                    <th>Category</th>
                    <th>Expiry Date</th>
                </tr>
                ${medicationsFilter.map(item => `
                    <tr>
                        <td>${item.medicine.genericName}</td>
                        <td>${item.medicine.brandName}</td>
                        <td>${item.medicine.category.map(cat => cat.name).join(", ")}</td>
                        <td>${item.expirationPerStock.map(exp => new Date(exp.expirationDate).toLocaleDateString()).join(", ")}</td>
                    </tr>
                `).join("")}
            </table>
        </body>
        </html>
    `;
    
        try {
            // Generate PDF
            const { uri } = await Print.printToFileAsync({ html: html });
    
            // Define a path to save the file
            const filePath = `${FileSystem.documentDirectory}Pharmacy_Report.pdf`;
    
            // Move the generated PDF to the desired location
            await FileSystem.moveAsync({
                from: uri,
                to: filePath,
            });
    
            Alert.alert("PDF Downloaded", "The PDF has been saved to your device.", [
                {
                    text: "Open",
                    onPress: () => Sharing.shareAsync(filePath),
                },
                { text: "Close", style: "cancel" },
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to generate PDF.");
        }
    };
    
    

    
    const routes = [
        { key: 'overview', title: 'Overview' },
        { key: 'expiring', title: 'Expiring Medicines' },
        { key: 'charts', title: 'Charts' },
    ];

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'overview':
                return (
                    <ScrollView style={styles.container}>
                    {/* Header */}
                
                    {/* Total Medications Summary */}
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryTitle}>Total Medications</Text>
                      <Text style={styles.summaryCount}>{totalMedications}</Text>
                    </View>
              
                    {/* Medications per Category Chart */}
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
              

                  </ScrollView>
                );
            case 'expiring':
                return (
                    <View style={styles.container}>
                    <>
                    {/* Search Bar */}
                      <View style={styles.searchContainer}>
                        <Searchbar
                          placeholder="Search Medicine"
                          onChangeText={searchMedications}
                          style={styles.searchBar}
                        />
                      </View>
            
                      {/* Expiry Date Filter Buttons */}
                      <View style={styles.filterContainer}>
                        {["all", "week", "month", "3months", "6months"].map((filter) => (
                          <TouchableOpacity
                            key={filter}
                            style={[
                              styles.filterButton,
                              expiryFilter === filter && styles.activeFilter,
                            ]}
                            onPress={() => handleExpiryFilterChange(filter)}
                          >
                            <Text style={[
                              styles.filterText,
                              expiryFilter === filter && styles.activeFilterText,
                            ]}>
                              {filter === "all" ? "All" : filter.replace(/(\d)(months?)/, "$1 $2")}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
            
                    {/* Custom Date Picker */}
                    <View style={styles.datePickerContainer}>
                    {/* Open Date Picker Modal */}
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateText}>
                        {selectedDates.start && selectedDates.end
                            ? `${selectedDates.start.toLocaleDateString()} - ${selectedDates.end.toLocaleDateString()}`
                            : "📅 Pick Custom Date Range"}
                        </Text>
                    </TouchableOpacity>
            
                    {/* Date Picker Modal */}
                    {showDatePicker && (
                        <View style={styles.datePickerModal}>
                        <Text style={styles.datePickerTitle}>Select Date Range</Text>
            
                        {/* Start Date Picker Button */}
                        <TouchableOpacity
                            style={styles.datePickerInput}
                            onPress={() => setShowCalendar("start")}
                        >
                            <Text style={styles.dateInputText}>
                            {selectedDates.start
                                ? selectedDates.start.toLocaleDateString()
                                : "Select Start Date"}
                            </Text>
                        </TouchableOpacity>
            
                        {/* End Date Picker Button - Disabled until Start Date is picked */}
                        <TouchableOpacity
                            style={[
                            styles.datePickerInput,
                            !selectedDates.start && { opacity: 0.5 }, // Disable if no start date
                            ]}
                            onPress={() => selectedDates.start && setShowCalendar("end")}
                            disabled={!selectedDates.start}
                        >
                            <Text style={styles.dateInputText}>
                            {selectedDates.end
                                ? selectedDates.end.toLocaleDateString()
                                : "Select End Date"}
                            </Text>
                        </TouchableOpacity>
            
                        {/* Date Picker UI */}
                        {showCalendar === "start" && (
                            <DateTimePicker
                            value={selectedDates.start || new Date()}
                            mode="date"
                            display="default"
                            onChange={(event, date) => {
                                if (date) {
                                setSelectedDates((prev) => ({ ...prev, start: date, end: null }));
                                setShowCalendar(null); // Hide calendar after selection
                                }
                            }}
                            />
                        )}
            
                        {showCalendar === "end" && selectedDates.start && (
                            <DateTimePicker
                            value={selectedDates.end || new Date()}
                            mode="date"
                            display="default"
                            onChange={(event, date) => {
                                if (date && date >= selectedDates.start) {
                                setSelectedDates((prev) => ({ ...prev, end: date }));
                                filterByCustomDates(selectedDates.start, date);
                                setShowCalendar(null); // Hide calendar after selection
                                setShowDatePicker(false); // Close modal after end date selection
                                }
                            }}
                            />
                        )}
                        </View>
                    )}
                    </View>
            
                   {/* Data Table */}
                      <ScrollView>
                        <Text style={styles.tableTitle}>MEDICINES</Text>
                        <DataTable>
                          <DataTable.Header style={styles.tableHeader}>
                            <DataTable.Title><Text style={styles.headerText}>GENERIC</Text></DataTable.Title>
                            <DataTable.Title><Text style={styles.headerText}>BRAND</Text></DataTable.Title>
                            <DataTable.Title><Text style={styles.headerText}>CATEGORY</Text></DataTable.Title>
                            <DataTable.Title><Text style={styles.headerText}>EXPIRY</Text></DataTable.Title>
                          </DataTable.Header>
            
                          {medicationsFilter.slice(page * itemsPerPage, (page + 1) * itemsPerPage).map((item, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={{ backgroundColor: index % 2 === 0 ? 'lightgray' : 'gainsboro' }} 
                                onPress={() => router.push(`/screens/PharmacyOwner/Medications/ReadMedication?id=${item._id}`)}
                            >
                                <DataTable.Row>
                                <DataTable.Cell>{item.medicine.genericName}</DataTable.Cell>
                                <DataTable.Cell>{item.medicine.brandName}</DataTable.Cell>
                                <DataTable.Cell>{item.medicine.category.map(cat => cat.name).join(", ")}</DataTable.Cell>
                                <DataTable.Cell>
                                    {item.expirationPerStock.map(exp => new Date(exp.expirationDate).toLocaleDateString()).join(", ")}
                                </DataTable.Cell>
                                </DataTable.Row>
                            </TouchableOpacity>
                            ))}
            
                          {/* Pagination */}
                          <DataTable.Pagination
                            page={page}
                            numberOfPages={Math.ceil(medicationsFilter.length / itemsPerPage)}
                            onPageChange={setPage}
                            label={`${page + 1} of ${Math.ceil(medicationsFilter.length / itemsPerPage)}`}
                          />
                        </DataTable>
                      </ScrollView>
                    </>
                </View>
                );
                case 'charts':
                    return (
                        <ScrollView contentContainerStyle={styles.scrollContainer}>
                            {/* Customer Review Chart */}
                            {chartData1 && (
                                <>
                                    <Text style={styles.chartTitle}>Customer Reviews</Text>
                                    <View style={styles.chartContainer}>
                                        <ViewShot ref={chartRef1} options={{ format: "png", quality: 0.8 }}>
                                            <LineChart
                                                data={chartData1}
                                                width={chartWidth}
                                                height={350}
                                                chartConfig={chartConfig}
                                                bezier
                                                style={styles.chartStyle}
                                            />
                                        </ViewShot>
                                    </View>
                                </>
                            )}
                
                            {/* Expiring Stock Chart */}
                            {chartData2 && (
                                <>
                                    <Text style={styles.chartTitle}>Expiring Medicine Stock</Text>
                                    <View style={styles.chartContainer}>
                                        <ViewShot ref={chartRef2} options={{ format: "png", quality: 0.8 }}>
                                            <BarChart
                                                data={chartData2}
                                                width={chartWidth}
                                                height={350}
                                                chartConfig={chartConfig}
                                                fromZero
                                                showBarTops
                                                verticalLabelRotation={60}
                                                style={styles.chartStyle}
                                            />
                                        </ViewShot>
                                    </View>
                                </>
                            )}
                        </ScrollView>
                    );                
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {/* Pharmacy Details with Gradient Background */}
            <LinearGradient colors={['#005b7f', '#14967f']} style={styles.pharmacyDetails}>
                <View style={styles.pharmacyContent}>
                    {/* Left: Pharmacy Image */}
                    <Image 
                        source={pharmacy.pharmacyDetails?.images?.[0] ? { uri: pharmacy.pharmacyDetails.images[0] } : require('@/assets/images/sample.jpg')} 
                        style={styles.pharmacyImage} 
                    />

                    {/* Right: Pharmacy Details */}
                    <View style={styles.detailsContainer}>
                        <Text style={styles.pharmacyName}>{pharmacy.name || 'N/A'}</Text>
                        <Text style={styles.pharmacyAddress}>
                            {`${pharmacy.street || ''}, ${pharmacy.barangay || ''}, ${pharmacy.city || ''}`.replace(/(, )+/g, ', ').trim() || 'Address not available'}
                        </Text>

                        {/* Business Hours Section */}
                        <View style={styles.businessInfo}>
                            <Text style={styles.businessLabel}>Business Days:</Text>
                            <Text style={styles.businessText}>
                                {pharmacy.pharmacyDetails?.businessDays || 'N/A'}, 
                                ({pharmacy.pharmacyDetails?.openingHour || 'N/A'} - {pharmacy.pharmacyDetails?.closingHour || 'N/A'})
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
            <TouchableOpacity style={styles.exportButton} onPress={exportReportAsPDF}>
                <Text style={styles.exportButtonText}>📄 Export as PDF</Text>
            </TouchableOpacity>

            {/* Tabs Section */}
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={handleTabChange}
                initialLayout={{ width: Dimensions.get('window').width }}
                renderTabBar={(props) => (
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
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(0, 139, 139, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.8,
    decimalPlaces: 0,
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },

    pharmacyDetails: { 
        height: Dimensions.get('window').height * 0.21, 
        justifyContent: 'center', 
        paddingHorizontal: 20,
        elevation: 5 
    },

    pharmacyContent: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        width: '100%'
    },

    pharmacyImage: { 
        width: 120, 
        height: 120, 
        borderRadius: 60, 
        borderWidth: 2, 
        borderColor: '#FFFFFF', 
        marginRight: 20 
    },

    detailsContainer: { 
        flex: 1 
    },

    pharmacyName: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#FFFFFF', 
        marginBottom: 5 
    },

    pharmacyAddress: { 
        fontSize: 12, 
        color: '#E0E0E0', 
        marginBottom: 5 
    },

    // Business Hours Styles
    businessInfo: { marginTop: 5 },
    businessLabel: { fontSize: 10, fontWeight: 'bold', color: '#E0E0E0' },
    businessText: { fontSize: 10, color: '#FFFFFF', marginBottom: 5 },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
    errorText: { fontSize: 16, color: 'red', textAlign: 'center' },

    // export button
    exportButton: {
        backgroundColor: "#005b7f",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        margin: 10,
    },
    exportButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    
    // expiring medicines tab styles
    searchContainer: { padding: 10 },
    searchBar: { backgroundColor: "white" },
    buttonContainer: {
      margin: 10,
      flexDirection: "row",
      justifyContent: "center",
    },
    tableTitle: {
      textAlign: "center",
      fontSize: 20,
      fontWeight: "bold",
      marginVertical: 15,
      paddingVertical: 10,
      color: "white",
      backgroundColor: "#0B607E",
    },
    headerText: {
      color: "white",
      fontWeight: "bold",
    },
    filterContainer: { flexDirection: "row", justifyContent: "center", padding: 10 },
    filterButton: { padding: 10, marginHorizontal: 5, backgroundColor: "lightgray", borderRadius: 5 },
    activeFilter: {
      backgroundColor: "#0B607E",
    },
    filterText: {
      fontSize: 14,
      color: "black",
    },
    activeFilterText: {
      color: "white",
      fontWeight: "bold",
    },
    datePickerContainer: {
      alignItems: "center",
      marginVertical: 10,
      padding: 15,
      paddingHorizontal: 20, // Added left & right spacing
      backgroundColor: "white",
      borderRadius: 10,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      marginHorizontal: 15, // Extra left & right spacing for a better look
    },
    
    dateButton: {
      backgroundColor: "#0B607E",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    
    dateText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
    
    datePickerModal: {
      marginTop: 10,
      backgroundColor: "white",
      padding: 15,
      borderRadius: 10,
      width: "90%",
      alignItems: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      marginHorizontal: 15, // Left & right spacing for a better centered look
    },
    
    datePickerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#0B607E",
    },
    
    datePickerInput: {
      width: "80%",
      padding: 12,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: "#ccc",
      marginVertical: 5,
      alignItems: "center",
      backgroundColor: "white",
    },
    
    dateInputText: {
      fontSize: 16,
      color: "#333",
    },
    
    closeButton: {
      backgroundColor: "#FF3B30",
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
      width: "80%",
      alignItems: "center",
    },
    
    closeButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 14,
    },              
  tableTitle: { textAlign: "center", fontSize: 20, fontWeight: "bold", color: "white", backgroundColor: "#0B607E", padding: 10 },
  tableHeader: { backgroundColor: "#0B607E" },
  headerText: { color: "white", fontWeight: "bold" }, 
  
  //   chart styles
  scrollContainer: { paddingBottom: 40, backgroundColor: '#F5F5F5' },
  chartTitle: { textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginVertical: 20 },
  chartContainer: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5, alignItems: 'center', marginHorizontal: 6 },
  chartStyle: { marginVertical: 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },

  //   overview
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#005b7f',
  },
  summaryCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
  },
  summaryCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0B607E',
  },
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
});
