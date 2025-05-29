import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Dimensions, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import baseURL from '@/assets/common/baseurl';
import AuthGlobal from '@/context/AuthGlobal';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import Spinner from "../../../../assets/common/spinner";

export default function PharmacyReviewChart() {
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
                        fetchReviewStats(pharmacyId);
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

            setChartData({
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
                    <h2>Pharmacy Review Report</h2>
                    <table>
                        <tr><th>Rating</th><th>Number of Reviews</th></tr>
                        ${chartData.labels.map((label, idx) => `<tr><td>${label}</td><td>${chartData.datasets[0].data[idx]}</td></tr>`).join('')}
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

    const generateExcel = async () => {
        if (!chartData) {
            Alert.alert('Error', 'No data available for export.');
            return;
        }

        const data = [
            ['Rating', 'Number of Reviews'],
            ['1★', chartData.datasets[0].data[0]],
            ['2★', chartData.datasets[0].data[1]],
            ['3★', chartData.datasets[0].data[2]],
            ['4★', chartData.datasets[0].data[3]],
            ['5★', chartData.datasets[0].data[4]],
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Pharmacy Reviews');

        const excelBuffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
        const fileUri = FileSystem.documentDirectory + 'Pharmacy_Review_Report.xlsx';
        await FileSystem.writeAsStringAsync(fileUri, excelBuffer, { encoding: FileSystem.EncodingType.Base64 });

        Sharing.shareAsync(fileUri);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Spinner />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Pharmacy Review</Text>
            </View>

            <Text style={styles.chartTitle}>Customer Review</Text>

            <View style={styles.chartContainer}>
                <LineChart
                    data={chartData}
                    width={chartWidth}
                    height={350}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chartStyle}
                />
            </View>

            <TouchableOpacity style={styles.exportButton} onPress={generateExcel}>
                <Text style={styles.exportButtonText}>Export to Excel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportButton} onPress={generatePDF}>
                <Text style={styles.exportButtonText}>Export to PDF</Text>
            </TouchableOpacity>
        </View>
    );
}

const chartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    color: (opacity = 1) => `rgba(0, 139, 139, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
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
