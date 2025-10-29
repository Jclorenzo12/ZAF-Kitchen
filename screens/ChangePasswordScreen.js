import React, { useState } from "react";
import {View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView,
} from "react-native";
import { supabase } from "../supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Get current session and user
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const user = sessionData?.session?.user;
      if (!user) throw new Error("User not found.");

      // ✅ Reauthenticate user using current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Current password is incorrect.");
      }

      // ✅ Update password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // ✅ Update last_password_change in profiles table
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ last_password_change: new Date().toISOString() })
        .eq("user_id", user.id);

      if (updateProfileError) {
        console.warn("Warning: Failed to update last_password_change", updateProfileError);
      }

      Alert.alert("Success", "Password updated successfully!");

      // ✅ Sign out after password change
      await supabase.auth.signOut();

      navigation.getParent("Root")?.reset({
        index: 0,
        routes: [{ name: "AuthScreen" }],
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="lock" size={22} color="#FF0000" />
        <TextInput
          style={styles.input}
          placeholder="Current Password"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="lock-outline" size={22} color="#FF0000" />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="lock-check-outline" size={22} color="#FF0000" />
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Password</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FF0000",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%",
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: "#000", 
  },
  button: {
    backgroundColor: "#FF0000",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
