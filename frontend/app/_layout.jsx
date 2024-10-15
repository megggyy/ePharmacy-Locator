import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* AUTH */}
        <Stack.Screen name="screens/Auth/LoginScreen" options={{ headerShown: false }} />
        <Stack.Screen name="screens/Auth/SignupRoleScreen" options={{ headerShown: false }} />

        {/* USER */}
        <Stack.Screen name="screens/User/Account/CustomerSignupScreen" options={{ headerShown: false }} />
        <Stack.Screen name="screens/User/Profile/EditProfileScreen" options={{ headerShown: false }} />
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

        {/* PHARMACY OWNER */}
        <Stack.Screen name="screens/PharmacyOwner/Account/PharmacyOwnerSignupScreen" options={{ headerShown: false }} />
      

        {/* DRAWER */}
        <Stack.Screen name="drawer/UserDrawer/index" options={{ headerShown: false }} />
       

        {/* OTHERS */}
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
