import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../supabase";

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("Staff");
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      // Kunin ang current logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("⚠️ Session expired", "Please login again.");
        navigation.replace("Auth");
        return;
      }

      // Kunin ang profile ng current user
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        // Fallback sa user_metadata kung wala pa sa DB
        const nameFromMetadata = user.user_metadata?.full_name || "User";
        setProfile({
          email: user.email,
          role: "Staff",
          full_name: nameFromMetadata,
        });
        setEditName(nameFromMetadata);
      } else {
        setProfile({ ...data, email: user.email });
        setEditName(data.full_name || user.user_metadata?.full_name || "User");
        setEditRole(data.role || "Staff");
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    const initials = names.map((n) => n[0].toUpperCase()).join("");
    return initials.slice(0, 2); // Max 2 letters
  };

  // Animated press effect
  const onPressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();

  const performLogout = async () => {
    setLogoutModalVisible(false);
    await supabase.auth.signOut();
    navigation.replace("Auth");
  };

  const saveProfileChanges = async () => {
    if (!editName) return Alert.alert("⚠️ Name cannot be empty");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("profiles")
      .upsert({ user_id: user.id, full_name: editName, role: editRole });

    // Update agad state para mag-refresh initials
    setProfile((prev) => ({ ...prev, full_name: editName, role: editRole }));
    setModalVisible(false);
    Alert.alert("✅ Profile updated!");
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      {/* Avatar with initials */}
      <View style={styles.avatarWrapper}>
        <View style={styles.initialsBox}>
          <Text style={styles.initialsText}>
            {getInitials(profile?.full_name || editName)}
          </Text>
        </View>
      </View>

      {/* Name & Role */}
      <Text style={styles.name}>{profile?.full_name || editName || "Unnamed"}</Text>
      <Text style={styles.role}>{profile?.role || "Staff"}</Text>

      {/* Info Cards */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="email-outline" size={24} color="#FF0000" />
          <Text style={styles.infoText}>{profile?.email || "No email"}</Text>
        </View>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="briefcase-outline" size={24} color="#FF0000" />
          <Text style={styles.infoText}>{profile?.role || "Event Staff"}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Settings */}
      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.settingsContainer}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <MaterialCommunityIcons name="lock-outline" size={24} color="#FF0000" />
          <Text style={styles.settingText}>Change Password</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons name="account-edit-outline" size={24} color="#FF0000" />
          <Text style={styles.settingText}>Edit Profile</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setLogoutModalVisible(true)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <View style={styles.logoutGradient}>
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Edit Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              placeholder="Full Name"
              value={editName}
              onChangeText={setEditName}
              style={styles.input}
            />
            <View style={[styles.input, { padding: 0, justifyContent: "center" }]}>
              <Picker selectedValue={editRole} onValueChange={setEditRole}>
                <Picker.Item label="Staff" value="Staff" />
                <Picker.Item label="Event Manager" value="Event Manager" />
                <Picker.Item label="Admin" value="Admin" />
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveProfileChanges}
                style={[styles.modalButton, { backgroundColor: "#FF0000" }]}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal animationType="fade" transparent visible={logoutModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={{ marginBottom: 20 }}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setLogoutModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={performLogout}
                style={[styles.modalButton, { backgroundColor: "#FF0000" }]}
              >
                <Text style={{ color: "#fff" }}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },

  // Avatar
  avatarWrapper: {
    marginTop: 60,
    alignSelf: "center",
    zIndex: 10,
  },
  initialsBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FF0000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
    marginTop: 70,
  },
  initialsText: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
  },

  // Name & Role
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
    textAlign: "center",
    letterSpacing: 0.3,
    color: "#222",
  },
  role: {
    fontSize: 15,
    marginTop: 5,
    marginBottom: 20,
    textAlign: "center",
    fontStyle: "italic",
    color: "#777",
  },

  // Info cards
  infoContainer: {
    width: "90%",
    alignSelf: "center",
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    padding: 15,
    marginVertical: 6,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },

  divider: {
    width: "90%",
    height: 1,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginVertical: 10,
  },

  // Sections
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 30,
    marginBottom: 10,
    color: "#222",
  },
  settingsContainer: {
    width: "90%",
    alignSelf: "center",
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 15,
    marginVertical: 6,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  settingText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 15,
    color: "#333",
  },

  // Logout
  logoutButton: { marginTop: 25, width: "90%", alignSelf: "center", borderRadius: 12 },
  logoutGradient: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "red",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, color: "#222" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 15,
    color: "#000000ff",
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
});
