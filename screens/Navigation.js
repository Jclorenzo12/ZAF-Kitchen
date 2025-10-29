import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Dashboard from "./Dashboard";
import EventsScreen from "./EventsScreen";
import ProfileStack from "./ProfileStack"; // ✅ Stack para sa Profile

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Events") iconName = "calendar";
          else if (route.name === "Profile") iconName = "account-circle";
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#FF0000",
        tabBarInactiveTintColor: "black",
        tabBarStyle: { height: 90 },
        tabBarLabelStyle: { fontSize: 12 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Dashboard} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />


    </Tab.Navigator>
  );
}
