import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";

import HomeScreen from "./pages/HomeScreen";
import DetailScreen from "./pages/DetailScreen";
import HistoryScreen from "./pages/HistoryScreen";
import AboutScreen from "./pages/AboutScreen";
import LocationScreen from "./pages/LocationScreen";
import { AuthProvider } from "./context/AuthContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HistoryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: "Riwayat Presensi" }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: "Detail Informasi" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ tabBarActiveTintColor: "#0056a0", headerShown: false }} >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: "Beranda",
              tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />
            }}
          />
          <Tab.Screen
            name="HistoryTab"
            component={HistoryStack}
            options={{
              tabBarLabel: "Riwayat",
              tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} />
            }}
          />
          <Tab.Screen
            name="AboutTab"
            component={AboutScreen}
            options={{
              tabBarLabel: "Tentang",
              tabBarIcon: ({ color }) => <MaterialIcons name="info" size={24} color={color} />
            }}
          />
         <Tab.Screen
          name="Location"
          component={LocationScreen}
          options={{
            tabBarLabel: "Lokasi",
            tabBarIcon: ({ color }) => <MaterialIcons name="location-on" size={24} color={color} />,
          }}
        />
        </Tab.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}


