import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack"; // ✅ gamitin ito

import SplashScreen from "./screens/SplashScreen";
import AuthScreen from "./screens/AuthScreen";
import Navigation from "./screens/Navigation"; // iyong Tab Navigator (Dashboard, etc.)

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* First screen before login */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {/* Login/Register */}
        <Stack.Screen name="Auth" component={AuthScreen} />

        {/* Main app (Tabs) */}
        <Stack.Screen name="Main" component={Navigation} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
});
