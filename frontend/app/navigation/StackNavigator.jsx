import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../(tabs)';
import LoginScreen from '../screens/Auth/LoginScreen';

const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
    </Stack.Navigator>
  );
}