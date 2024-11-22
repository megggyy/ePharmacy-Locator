import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { NavigationContainer } from '@react-navigation/native';
import Toast from "react-native-toast-message"
import { AuthProvider } from '../context/AuthGlobal';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {/* AUTH */}
            <Stack.Screen name="screens/Auth/LoginScreen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/Auth/SignupRoleScreen" options={{ headerShown: false }} />

            {/* USER */}
            <Stack.Screen name="screens/User/Account/CustomerSignupScreen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Account/VerifyOTP" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Account/ResetOTP" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Account/ForgotPassword" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Account/ResetPassword" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Profile/EditProfileScreen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Profile/ViewProfileScreen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Profile/ChangePassword" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Features/SuggestedMedicine" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Features/Maps" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Features/Settings" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Features/ViewAllPharmacies" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Features/PharmacyDetails" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Features/PharmaciesNearMe" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Features/ViewAllMedications" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Features/MedicationDetails" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Features/CategoryFilterMedications" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Features/PrescriptionUpload" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Features/PrescriptionScan" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Features/PrescriptionResults" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Features/PrescriptionAvailability" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Features/PrivacyPolicy" options={{ headerShown: false }} />
            <Stack.Screen name="screens/User/Features/FAQs" options={{ headerShown: false }} />

            {/* PHARMACY OWNER */}
            <Stack.Screen name="screens/PharmacyOwner/Account/PharmacyOwnerSignupScreen" options={{ headerShown: false }} />
            <Stack.Screen name="screens/PharmacyOwner/Dashboard" options={{ headerShown: false }} />

              {/* PROFILE */}
              <Stack.Screen name="screens/PharmacyOwner/Profile/ViewProfile" options={{ headerShown: false }} />
              <Stack.Screen name="screens/PharmacyOwner/Profile/EditPharmacyProfileScreen" options={{ headerShown: false }} />
              <Stack.Screen name="screens/PharmacyOwner/Profile/ChangePassword" options={{ headerShown: false }} />

              {/* CATEGORIES */}
              <Stack.Screen name="screens/PharmacyOwner/MedicationCategory/ListCategories" options={{ headerShown: false }} />
              <Stack.Screen name="screens/PharmacyOwner/MedicationCategory/EditCategory" options={{ headerShown: false }} />
              <Stack.Screen name="screens/PharmacyOwner/MedicationCategory/ReadCategory" options={{ headerShown: false }} />
              <Stack.Screen name="screens/PharmacyOwner/MedicationCategory/CreateCategory" options={{ headerShown: false }} />


              {/* MEDICATIONS */}
              <Stack.Screen name="screens/PharmacyOwner/Medications/ListMedications" options={{ headerShown: false }} />
              <Stack.Screen name="screens/PharmacyOwner/Medications/EditMedication" options={{ headerShown: false }} />
              <Stack.Screen name="screens/PharmacyOwner/Medications/ReadMedication" options={{ headerShown: false }} />
              <Stack.Screen name="screens/PharmacyOwner/Medications/CreateMedication" options={{ headerShown: false }} />

            {/* ADMIN */}
            <Stack.Screen name="screens/Admin/dashboard" options={{ headerShown: false }} />

              {/* USERS CRUD */}
              <Stack.Screen name="screens/Admin/Users/ListUsers" options={{ headerShown: false }} />
              <Stack.Screen name="screens/Admin/Users/ReadUser" options={{ headerShown: false }} />
              <Stack.Screen name="screens/Admin/Users/EditUser" options={{ headerShown: false }} />

              {/* PHARMACIES CRUD */}
              <Stack.Screen name="screens/Admin/Pharmacies/ListPharmacies" options={{ headerShown: false }} />
              <Stack.Screen name="screens/Admin/Pharmacies/ReadPharmacy" options={{ headerShown: false }} />
              <Stack.Screen name="screens/Admin/Pharmacies/EditPharmacy" options={{ headerShown: false }} />

          {/* BARANGAY CRUD */}
          <Stack.Screen name="screens/Admin/Barangay/ListBarangay" options={{ headerShown: false }} />
          <Stack.Screen name="screens/Admin/Barangay/CreateBarangay" options={{ headerShown: false }} />
          <Stack.Screen name="screens/Admin/Barangay/ReadBarangay" options={{ headerShown: false }} />
          <Stack.Screen name="screens/Admin/Barangay/EditBarangay" options={{ headerShown: false }} />

          {/* CATEGORY CRUD */}
          <Stack.Screen name="screens/Admin/MedicationCategory/ListCategories" options={{ headerShown: false }} />
          <Stack.Screen name="screens/Admin/MedicationCategory/CreateCategory" options={{ headerShown: false }} />
          <Stack.Screen name="screens/Admin/MedicationCategory/ReadCategory" options={{ headerShown: false }} />
          <Stack.Screen name="screens/Admin/MedicationCategory/EditCategory" options={{ headerShown: false }} />
          
          {/* MEDICINE CRUD */}
          <Stack.Screen name="screens/Admin/Medications/ListMedications" options={{ headerShown: false }} />
          <Stack.Screen name="screens/Admin/Medications/CreateMedication" options={{ headerShown: false }} />
          <Stack.Screen name="screens/Admin/Medications/ReadMedication" options={{ headerShown: false }} />
          <Stack.Screen name="screens/Admin/Medications/EditMedication" options={{ headerShown: false }} />
              {/* PROFILE */}
              <Stack.Screen name="screens/Admin/Profile/ViewProfile" options={{ headerShown: false }} />
              <Stack.Screen name="screens/Admin/Profile/EditProfileScreen" options={{ headerShown: false }} />
              <Stack.Screen name="screens/Admin/Profile/ChangePassword" options={{ headerShown: false }} />

              {/* CHARTS */}
              <Stack.Screen name="screens/Admin/Charts/PharmaciesPerBarangay" options={{ headerShown: false }} />
              <Stack.Screen name="screens/Admin/Charts/MostScannedMedication" options={{ headerShown: false }} />
              <Stack.Screen name="screens/Admin/Charts/MonthlyPharmacyRegistration" options={{ headerShown: false }} />
              <Stack.Screen name="screens/Admin/Charts/MedicinesPerCategory" options={{ headerShown: false }} />


            {/* DRAWER */}
            <Stack.Screen name="drawer/UserDrawer/index" options={{ headerShown: false }} />
            <Stack.Screen name="drawer/AdminDrawer/index" options={{ headerShown: false }} />
            <Stack.Screen name="drawer/PharmacyOwnerDrawer/index" options={{ headerShown: false }} />

            {/* OTHERS */}
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
        <Toast />
      </NavigationContainer>
    </AuthProvider>
  );
}
