import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../supabase"; 

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const scaleAnim = useState(new Animated.Value(1))[0];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill all fields!");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      // Get current logged-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert("User not found. Please login again.");
        setLoading(false);
        return;
      }

      const email = user.email;

      // Re-authenticate user with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        alert("Current password is incorrect.");
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        alert(`Error updating password: ${updateError.message}`);
        setLoading(false);
        return;
      }

      alert("Password updated successfully!");

      // Sign out user so new password takes effect
      await supabase.auth.signOut();

      // Navigate to Login screen
      navigation.getParent("Root")?.reset({
      index: 0,
      routes: [{ name: "AuthScreen" }],
    });

    } catch (err) {
      console.log(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Change Password</Text>
            <Text style={styles.subtitle}>
              Keep your account secure by updating your password
            </Text>

            {/* Current Password */}
            <View style={styles.inputCard}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={22}
                color="#ff7f50"
                style={styles.icon}
              />
              <TextInput
                placeholder="Current Password"
                secureTextEntry
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholderTextColor="#999"
              />
            </View>

            {/* New Password */}
            <View style={styles.inputCard}>
              <MaterialCommunityIcons
                name="lock-reset"
                size={22}
                color="#ff7f50"
                style={styles.icon}
              />
              <TextInput
                placeholder="New Password"
                secureTextEntry={!showNew}
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <MaterialCommunityIcons
                  name={showNew ? "eye-off" : "eye"}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputCard}>
              <MaterialCommunityIcons
                name="lock-check-outline"
                size={22}
                color="#ff7f50"
                style={styles.icon}
              />
              <TextInput
                placeholder="Confirm New Password"
                secureTextEntry={!showConfirm}
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <MaterialCommunityIcons
                  name={showConfirm ? "eye-off" : "eye"}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleUpdatePassword}
                style={styles.buttonWrapper}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#ff7f50", "#ffb347"]}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Updating..." : "Update Password"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa", padding: 20, justifyContent: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 5, color: "#333" },
  subtitle: { textAlign: "center", fontSize: 14, color: "#777", marginBottom: 25 },
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, paddingVertical: 12, color: "#333" },
  buttonWrapper: { marginTop: 25, borderRadius: 15, overflow: "hidden" },
  button: { paddingVertical: 15, alignItems: "center", borderRadius: 15 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16, letterSpacing: 0.5 },
});
