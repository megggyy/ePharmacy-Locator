import React, { useEffect, useState } from "react";
import { View, Text, Image, Dimensions, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarChart } from "react-native-chart-kit";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';
import baseURL from "@/assets/common/baseurl";

export default function PharmacyFeedbackChart() {
    const screenWidth = Dimensions.get("window").width;
    const chartWidth = screenWidth * 0.9;

    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
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

                setLoading(false);
            } catch (error) {
                console.error("Error fetching pharmacy rating distribution:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0B607E" />
            </View>
        );
    }

    if (!chartData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load chart data.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
                {/* Header */}
                  <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                      <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Image source={require('@/assets/images/epharmacy-logo.png')} style={styles.logo} />
                    <Text style={styles.title}>ePharmacy</Text>
                  </View>
            <Text style={styles.chartTitle}>Pharmacy Feedback Rating Distribution</Text>
            <View style={styles.chartContainer}>
                <BarChart
                    data={chartData}
                    width={chartWidth}
                    height={300}
                    chartConfig={chartConfig}
                    showValuesOnTopOfBars
                    fromZero
                    style={styles.chartStyle}
                />
            </View>
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
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
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
    chartTitle: {
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        marginVertical: 20,
    },
    chartContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        alignItems: "center",
        marginHorizontal: 20,
    },
    chartStyle: {
        marginVertical: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
    },
    errorText: {
        color: "red",
        fontSize: 16,
    },
});
