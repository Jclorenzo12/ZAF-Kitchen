import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";

export default function SplashScreen({ navigation }) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Infinite horizontal spinning
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 4000, // 2 seconds per flip
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  // Map 0-1 to 0deg-360deg for horizontal flip
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/zafs-logo.png")}
        style={[styles.logo, { transform: [{ rotateY: spin }] }]}
        resizeMode="cover"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Auth")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 70,
  },
  logo: {
    width: 220,
    height: 220,
    borderRadius: 180,
    borderWidth: 4,
    borderColor: "red",
    marginBottom: 80,
  },
  button: {
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 25,
    elevation: 3,
    marginTop: 130,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
