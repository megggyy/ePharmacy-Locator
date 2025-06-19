import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";
import { DataTable, Searchbar, IconButton } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios";
import { useRouter } from 'expo-router';
import baseURL from "@/assets/common/baseurl";
import Spinner from "@/assets/common/spinner";
import AuthGlobal from '@/context/AuthGlobal';
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as XLSX from 'xlsx';

const MedicationScreen = () => {
  const router = useRouter();
  const [medicationsList, setMedicationsList] = useState([]);
  const [medicationsFilter, setMedicationsFilter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expiryFilter, setExpiryFilter] = useState("all"); // Default: Show all
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(null); // "start" or "end"
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });
  const { state } = useContext(AuthGlobal);

  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  useFocusEffect(
    useCallback(() => {
      axios
        .get(`${baseURL}medicine/${state.user.userId}`)
        .then((res) => {
          setMedicationsList(res.data);
          setMedicationsFilter(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, [state.user.userId])
  );

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

  // Function to generate PDF
  const generatePDF = async () => {
    if (medicationsFilter.length === 0) {
      Alert.alert("No Data", "There are no medicines to generate a PDF.");
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; color: #0B607E; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #0B607E; color: white; }
          </style>
        </head>
        <body>
          <h2>Expiring Medicines</h2>
                      <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>

          <table>
            <tr>
              <th>Generic Name</th>
              <th>Brand Name</th>
              <th>Category</th>
              <th>Expiry Date</th>
            </tr>
            ${medicationsFilter
        .map(
          (item) => `
              <tr>
                <td>${item.medicine.genericName}</td>
                <td>${item.medicine.brandName}</td>
                <td>${item.medicine.category.map((cat) => cat.name).join(", ")}</td>
                <td>${item.expirationPerStock.map((exp) => new Date(exp.expirationDate).toLocaleDateString()).join(", ")}</td>
              </tr>
            `
        )
        .join("")}
          </table>
        </body>
      </html>
    `;

    try {
      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // Define a path to save the file
      const filePath = `${FileSystem.documentDirectory}Expiring_Medicines.pdf`;

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

  const generateExcel = async () => {
    if (medicationsFilter.length === 0) {
      Alert.alert("No Data", "There are no medicines to export.");
      return;
    }

    // Get timestamp
    const now = new Date();
    const timestamp = `Generated on: ${now.toLocaleString()}`;

    // Prepare the data for Excel
    const data = [
      [timestamp], // Timestamp row
      [], // Blank row
      ["Generic Name", "Brand Name", "Category", "Expiry Date"], // Headers
      ...medicationsFilter.map(item => [
        item.medicine.genericName,
        item.medicine.brandName,
        item.medicine.category.map(cat => cat.name).join(", "),
        item.expirationPerStock.map(exp => new Date(exp.expirationDate).toLocaleDateString()).join(", "),
      ])
    ];

    // Convert data to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expiring Medicines");

    // Write the workbook to a base64 string
    const excelBuffer = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
    const fileUri = `${FileSystem.documentDirectory}Expiring_Medicines.xlsx`;

    // Save the file
    await FileSystem.writeAsStringAsync(fileUri, excelBuffer, { encoding: FileSystem.EncodingType.Base64 });

    // Share the file
    await Sharing.shareAsync(fileUri);
  };


  return (
    <View style={styles.container}>
      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Header Section */}
          <View style={styles.header}>
            <IconButton icon="arrow-left" onPress={() => router.back()} color="white" />
            <Text style={styles.headerTitle}>Check Expiring Medicines</Text>
          </View>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search Medicine"
              onChangeText={searchMedications}
              style={styles.searchBar}
            />
          </View>

          {/* Generate PDF Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
              <Text style={styles.pdfButtonText}>Generate PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pdfButton} onPress={generateExcel}>
              <Text style={styles.pdfButtonText}>Export as Excel</Text>
            </TouchableOpacity>
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
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "#005b7f" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "white" },
  searchContainer: { padding: 10 },
  searchBar: { backgroundColor: "white" },
  buttonContainer: {
    margin: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  pdfButton: {
    backgroundColor: "#005b7f",
    padding: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  pdfButtonText: {
    color: "white",
    fontWeight: "bold",
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
});

export default MedicationScreen;
