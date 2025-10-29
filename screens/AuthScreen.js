import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../supabase";

export default function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        navigation.replace("Main");
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [navigation]);

  const handleSubmit = async () => {
    if (!isLogin) {
      if (password !== confirmPassword) {
        Alert.alert("❌ Passwords do not match");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        Alert.alert("❌ Registration failed", error.message);
        return;
      }

      const userId = data?.user?.id;
      if (userId) {
        await supabase.from("profiles").upsert([
          { user_id: userId, full_name: fullName, status: "Pending" },
        ]);
      }

      Alert.alert("✅ Account created!", "Please wait for admin approval.");
      setIsLogin(true);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert("❌ Login failed", error.message);
        return;
      }

      const user = data?.user;
      const { data: profile } = await supabase
        .from("profiles")
        .select("status, full_name")
        .eq("user_id", user.id)
        .single();

      if (profile?.status === "Rejected") {
        await supabase.auth.signOut();
        Alert.alert("🚫 Access Denied", "Your account has been rejected by admin.");
        return;
      }

      if (profile?.status === "Pending") {
        await supabase.auth.signOut();
        Alert.alert("⏳ Pending Approval", "Please wait for admin approval.");
        return;
      }

      navigation.replace("Main");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#fc1505", "#ff4d4d"]} style={styles.header}>
        <Image
          source={require("../assets/zafs-logo.png")}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.title}>{isLogin ? "Welcome Back!" : "Create Account"}</Text>
        <Text style={styles.subtitle}>
          {isLogin ? "Login to access your account" : "Join us and start your journey"}
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{isLogin ? "Sign In" : "Register"}</Text>

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#777"
                value={fullName}
                onChangeText={setFullName}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#777"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {/* Password input with eye icon */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#777"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#777"
                />
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm Password"
                  placeholderTextColor="#777"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#777"
                  />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <LinearGradient
                colors={["#FF0000", "#ff0000ff"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {isLogin ? "Login" : "Register"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchText}>
                {isLogin
                  ? "Don’t have an account? Register"
                  : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    alignItems: "center",
    paddingVertical: 50,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 10,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
    marginBottom: 15,
  },
  title: { fontSize: 28, color: "#fff", fontWeight: "bold", marginBottom: 5 },
  subtitle: { color: "#fff", fontSize: 15, textAlign: "center", opacity: 0.9 },
  scrollContainer: { paddingHorizontal: 25, paddingTop: 30, paddingBottom: 80 },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#ddd",
    color: "black",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 18,
    backgroundColor: "#fafafa",
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 18,
    backgroundColor: "#fafafa",
    height: 55,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#000",
  },
  eyeIcon: {
    padding: 5,
  },
  button: { marginTop: 10 },
  buttonGradient: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  switchText: {
    textAlign: "center",
    color: "#FF0000",
    marginTop: 20,
    fontWeight: "600",
    fontSize: 15,
  },
});
