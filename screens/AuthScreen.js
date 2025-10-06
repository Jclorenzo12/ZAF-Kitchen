// AuthScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as AuthSession from "expo-auth-session";
import { supabase } from "../supabase";

export default function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Google Auth
  const handleGoogleLogin = async () => {
    
  };

  // Handle Login / Register
  const handleSubmit = async () => {
    if (!isLogin) {
      // REGISTER
      if (password !== confirmPassword) {
        Alert.alert("❌ Passwords do not match");
        return;
      }

      try {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          Alert.alert("❌ Registration failed", error.message);
          return;
        }

        // Try to get a user id from response
        let userId = data?.user?.id || data?.session?.user?.id || null;

        // If signup didn't return a user id/session, explicitly ask Supabase for current session
        if (!userId) {
          const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
          if (sessionErr) {
            console.log("getSession error:", sessionErr);
          }
          userId = sessionData?.session?.user?.id || sessionData?.user?.id || null;
        }

        // If still no userId, it means the client is not authenticated yet (e.g. email confirm required)
        if (!userId) {
          // Safe fallback: tell user to verify email / login, and switch to login view
          Alert.alert(
            "✅ Account created",
            "Please verify your email (if required) then login to complete your profile."
          );
          setIsLogin(true);
          return;
        }

        // At this point we have a userId AND (should) have an active session token so RLS auth.uid() will match
        // Upsert the profile (insert if missing, update if exists). Requires user_id to be unique/indexed.
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert([{ user_id: userId, full_name: fullName }], { onConflict: "user_id" });

        if (profileError) {
          // Common reasons: RLS policy still blocking, or missing unique index on user_id
          console.log("profile upsert error:", profileError);
          Alert.alert("⚠️ Profile not updated", profileError.message);
          return;
        }

        Alert.alert("✅ Account Created!", "Welcome " + fullName);
        // Optional: keep user logged in and navigate
        navigation.replace("Main");
      } catch (err) {
        console.log("register exception:", err);
        Alert.alert("❌ Error", err.message || JSON.stringify(err));
      }
    } else {
      // LOGIN
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          Alert.alert("❌ Login failed", error.message);
        } else {
          Alert.alert("✅ Login Success!");
          navigation.replace("Main");
        }
      } catch (err) {
        console.log("login exception:", err);
        Alert.alert("❌ Error", err.message || JSON.stringify(err));
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#ff6600", "#ff944d"]} style={styles.topSection}>
        <Image source={require("../assets/zafs-logo.png")} style={styles.logo} resizeMode="cover" />
        <Text style={styles.topTitle}>{isLogin ? "Welcome" : "Join Us"}</Text>
        <Text style={styles.topSubtitle}>
          {isLogin ? "Login to your account to continue" : "Create an account to get started"}
        </Text>
      </LinearGradient>

      <View style={styles.formSection}>
        <Text style={styles.formTitle}>{isLogin ? "Sign In" : "Register"}</Text>

        {!isLogin && (
          <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#888"
            value={fullName} onChangeText={setFullName} />
        )}

        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888"
          keyboardType="email-address" value={email} onChangeText={setEmail} />

        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888"
          secureTextEntry value={password} onChangeText={setPassword} />

        {!isLogin && (
          <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#888"
            secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <LinearGradient colors={["#ff6600", "#ff944d"]} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>{isLogin ? "Login" : "Register"}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.dividerWrapper}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.googleButton} activeOpacity={0.85} onPress={""}>
          <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/281/281764.png" }} style={styles.googleIcon} />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switchText}>
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// styles (same as your current styles)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topSection: { flex: 1.2, justifyContent: "center", alignItems: "center", borderBottomLeftRadius: 40, borderBottomRightRadius: 40, paddingVertical: 40 },
  logo: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: "#fff", marginBottom: 15 },
  topTitle: { fontSize: 26, fontWeight: "bold", color: "#fff", marginBottom: 6 },
  topSubtitle: { fontSize: 14, color: "#fff", opacity: 0.9 },
  formSection: { flex: 2, paddingHorizontal: 30, paddingTop: 35 },
  formTitle: { fontSize: 22, fontWeight: "700", color: "#333", marginBottom: 20 },
  input: { width: "100%", height: 50, backgroundColor: "#f9f9f9", borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: "#ddd" },
  button: { marginTop: 10, borderRadius: 12 },
  buttonGradient: { paddingVertical: 15, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  dividerWrapper: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: "#ccc" },
  dividerText: { marginHorizontal: 10, color: "#666", fontSize: 14 },
  googleButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", paddingVertical: 14, borderRadius: 50, justifyContent: "center", marginBottom: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  googleIcon: { width: 26, height: 26, marginRight: 12 },
  googleText: { color: "#333", fontWeight: "700", fontSize: 16, letterSpacing: 0.5 },
  switchText: { color: "#ff6600", fontSize: 14, textAlign: "center", marginTop: 15, fontWeight: "600" },
});
