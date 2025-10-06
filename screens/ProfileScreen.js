import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Animated,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from '@react-native-picker/picker';
import { supabase } from "../supabase"; // ✅ supabase client

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // 🔹 Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("Staff");
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // 🔹 Fetch profile data from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("⚠️ Session expired", "Please login again.");
        navigation.replace("Auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (error) {
        Alert.alert("⚠️ Error", error.message);
      } else {
        setProfile({ ...data, email: user.email });
        if (data?.avatar_url) setProfileImage(data.avatar_url);
        setEditName(data?.full_name || "");
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  // 🔹 Upload profile image
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Camera roll access is needed.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const image = result.assets[0].uri;
      const fileExt = image.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const response = await fetch(image);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { contentType: blob.type });

      if (uploadError) {
        Alert.alert("Upload Error", uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { data: { user } } = await supabase.auth.getUser();

      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);

      setProfileImage(publicUrl);
      Alert.alert("✅ Success", "Profile picture updated!");
    }
  };

  // Animated press effect
  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  // 🔹 Logout function
  const performLogout = async () => {
    setLogoutModalVisible(false);
    await supabase.auth.signOut();
    navigation.replace("Auth");
  };

  const handleChangePassword = () => {
    navigation.navigate("ChangePassword");
  };

  const handleEditProfile = () => {
    setModalVisible(true);
  };

  const saveProfileChanges = async () => {
    if (!editName) {
      Alert.alert("⚠️ Name cannot be empty");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from("profiles")
      .update({ full_name: editName })
      .eq("user_id", user.id);

    setProfile(prev => ({
      ...prev,
      full_name: editName,
      role: editRole, // local only
    }));

    setModalVisible(false);
    Alert.alert("✅ Profile updated!");
  };

  const bgColor = "#f5f6fa";
  const cardColor = "#fff";
  const textColor = "#333";
  const subTextColor = "#777";

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff7f50" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <LinearGradient colors={["#ff7f50", "#ffb347"]} style={styles.header} />

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.uploadBox}>
              <MaterialCommunityIcons name="camera-plus" size={40} color="#ff7f50" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Name & Role */}
      <Text style={[styles.name, { color: textColor }]}>{profile?.full_name || "Unnamed"}</Text>
      <Text style={[styles.role, { color: subTextColor }]}>{profile?.role || "Staff"}</Text>

      {/* Info Cards */}
      <View style={styles.infoContainer}>
        <View style={[styles.infoCard, { backgroundColor: cardColor }]}>
          <MaterialCommunityIcons name="email-outline" size={24} color="#ff7f50" />
          <Text style={[styles.infoText, { color: textColor }]}>{profile?.email || "No email"}</Text>
        </View>
        <View style={[styles.infoCard, { backgroundColor: cardColor }]}>
          <MaterialCommunityIcons name="briefcase-outline" size={24} color="#ff7f50" />
          <Text style={[styles.infoText, { color: textColor }]}>{profile?.role || "Event Staff"}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Settings Section */}
      <Text style={[styles.sectionTitle, { color: textColor }]}>Settings</Text>
      <View style={styles.settingsContainer}>
        {/* Change Password */}
        <TouchableOpacity
          style={[styles.settingRow, { backgroundColor: cardColor }]}
          onPress={handleChangePassword}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="lock-outline" size={24} color="#ff7f50" />
          <Text style={[styles.settingText, { color: textColor }]}>Change Password</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
        </TouchableOpacity>

        {/* Edit Profile */}
        <TouchableOpacity
          style={[styles.settingRow, { backgroundColor: cardColor }]}
          onPress={handleEditProfile}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="account-edit-outline" size={24} color="#ff7f50" />
          <Text style={[styles.settingText, { color: textColor }]}>Edit Profile</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setLogoutModalVisible(true)}
          activeOpacity={0.8}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <LinearGradient colors={["#ff7f50", "#ffb347"]} style={styles.logoutGradient}>
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput
              placeholder="Full Name"
              value={editName}
              onChangeText={setEditName}
              style={styles.input}
            />

            <View style={[styles.input, { padding: 0, justifyContent: 'center' }]}>
              <Picker
                selectedValue={editRole}
                onValueChange={(itemValue) => setEditRole(itemValue)}
              >
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
                style={[styles.modalButton, { backgroundColor: "#ff7f50" }]}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={{ marginBottom: 20 }}>Are you sure you want to logout?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setLogoutModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={performLogout}
                style={[styles.modalButton, { backgroundColor: "#ff7f50" }]}
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
  container: { flex: 1 },
  header: {
    width: "100%",
    height: 180,
    marginTop: 70,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 3,
  },
  avatarWrapper: {
    marginTop: -90,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },
  uploadBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ff7f50",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  role: {
    fontSize: 15,
    marginTop: 5,
    marginBottom: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  infoContainer: { width: "85%", alignSelf: "center", marginBottom: 20 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    padding: 15,
    marginVertical: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  infoText: { marginLeft: 15, fontSize: 16, fontWeight: "500" },
  divider: {
    width: "85%",
    height: 1,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 30,
    marginBottom: 10,
  },
  settingsContainer: {
    width: "85%",
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
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  settingText: { fontSize: 16, flex: 1, marginLeft: 15 },
  logoutButton: {
    marginTop: 20,
    width: "85%",
    alignSelf: "center",
    borderRadius: 12,
  },
  logoutGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
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
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
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
