import React, { useEffect, useState, useContext } from 'react';
import { 
    View, Text, Dimensions, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView 
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import AuthGlobal from '@/context/AuthGlobal';

export default function PharmacyStatsScreen() {
    const router = useRouter();
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth * 0.9;
    const [loading, setLoading] = useState(true);
    const [pharmacyId, setPharmacyId] = useState(null);
    
    const { state } = useContext(AuthGlobal);
    // 1st chart
    const [chartData1, setChartData1] = useState(null);
    // 2nd chart
    const [chartData2, setChartData2] = useState(null);

    useEffect(() => {
        if (state.isAuthenticated) {
            axios.get(`${baseURL}pharmacies/user/${state.user.userId}`)
                .then((res) => {
                    if (res.data) {
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
    }, [state.isAuthenticated, state.user.userId]);

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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0B607E" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/drawer/PharmacyOwnerDrawer')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Charts</Text>
            </View>

       {/* Customer Review Chart */}
            {chartData1 && (
            <>
                <Text style={styles.chartTitle}>Customer Reviews</Text>
                <View style={styles.chartContainer}>
                <LineChart
                    data={chartData1}
                    width={chartWidth}
                    height={350}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chartStyle}
                />
                </View>
            </>
            )}

            {/* Expiring Stock Chart */}
            {chartData2 && (
            <>
                <Text style={styles.chartTitle}>Expiring Medicine Stock</Text>
                <View style={styles.chartContainer}>
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
                </View>
            </>
            )}



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
    scrollContainer: { paddingBottom: 40, backgroundColor: '#F5F5F5' },
    header: { backgroundColor: '#005b7f', paddingTop: 10, paddingBottom: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    backButton: { position: 'absolute', left: 10, top: 15 },
    title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    chartTitle: { textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginVertical: 20 },
    chartContainer: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5, alignItems: 'center', marginHorizontal: 6 },
    chartStyle: { marginVertical: 10 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
    exportButton: { backgroundColor: '#005b7f', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20, marginHorizontal: 20 },
    exportButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
