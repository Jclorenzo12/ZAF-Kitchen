import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../supabase";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Fetch bookings excluding rejected
  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .neq("booking_status", "rejected")
      .order("event_date", { ascending: true });

    if (error) console.log("❌ Error fetching bookings:", error.message);
    else setEvents(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todaysEvents = events.filter((e) => e.event_date === today);

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Zaf’s Kitchen Dashboard</Text>
          <MaterialCommunityIcons name="food-fork-drink" size={26} color="#fff" />
        </View>

        {/* STATS */}
        <Text style={styles.sectionTitle}>📊 Overview</Text>
        <View style={styles.statsRow}>
          <View style={[styles.card, { backgroundColor: "#E53935" }]}>
            <MaterialCommunityIcons name="calendar-check" size={30} color="#fff" />
            <Text style={styles.number}>{events.length}</Text>
            <Text style={styles.label}>Total Events</Text>
          </View>

          <View style={[styles.card, { backgroundColor: "#FF7043" }]}>
            <MaterialCommunityIcons name="calendar-today" size={30} color="#fff" />
            <Text style={styles.number}>{todaysEvents.length}</Text>
            <Text style={styles.label}>Events Today</Text>
          </View>
        </View>

        {/* TODAY'S EVENTS */}
        <Text style={styles.sectionTitle}>📅 Today’s Events</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#E53935" style={{ marginTop: 40 }} />
        ) : todaysEvents.length === 0 ? (
          <Text style={styles.noEventText}>No events for today 😴</Text>
        ) : (
          todaysEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventRow}>
                <MaterialCommunityIcons
                  name={
                    event.event_type?.toLowerCase().includes("wedding")
                      ? "party-popper"
                      : event.event_type?.toLowerCase().includes("birthday")
                      ? "cake-variant"
                      : "calendar"
                  }
                  size={28}
                  color="#E53935"
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.eventTitle}>{event.event_type || "Event"}</Text>
                  <Text style={styles.eventDetails}>
                    {event.event_date} • {event.guest_count || 0} pax
                  </Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      event.booking_status === "approved"
                        ? styles.approved
                        : event.booking_status === "pending"
                        ? styles.pending
                        : styles.canceled,
                    ]}
                  >
                    {event.booking_status?.toUpperCase() || "UNKNOWN"}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </Animated.View>
    </ScrollView>
  );
}

// Styles (slightly modernized)
const styles = StyleSheet.create({
  scrollContainer: { 
    flex: 1, 
    backgroundColor: "#FAFAFA" 
  },
  container: { 
    paddingHorizontal: 20, 
    paddingTop: 75, 
    paddingBottom: 60, 
    marginTop: 30,
  },
  header: {
    backgroundColor: "#D32F2F",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  headerText: { 
    color: "#fff", 
    fontSize: 24, 
    fontWeight: "700" 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: "700", 
    marginTop: 20, 
    marginBottom: 15, 
    color: "#333", 
  },
  statsRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 30 
  },
  card: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  number: { fontSize: 26, fontWeight: "700", color: "#fff", marginTop: 6 },
  label: { fontSize: 14, color: "#fff", textAlign: "center", marginTop: 4 },
  eventCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  eventRow: { 
    flexDirection: "row", 
    alignItems: "flex-start", 
    gap: 12, 
  },
  eventTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#222", 
    marginBottom: 4, 
  },
  eventDetails: { 
    fontSize: 14, 
    color: "#555", 
    marginBottom: 6 
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  approved: { backgroundColor: "#C8E6C9", color: "#2E7D32" },
  pending: { backgroundColor: "#FFF9C4", color: "#FBC02D" },
  canceled: { backgroundColor: "#FFCDD2", color: "#C62828" },
  noEventText: { 
    textAlign: "center", 
    color: "#777", 
    marginTop: 50, 
    fontSize: 16 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    elevation: 6,
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 16, 
    color: "#D32F2F" 
  },
  modalDetail: { fontSize: 15, color: "#444", marginBottom: 10 },
  closeButton: {
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#D32F2F",
    alignItems: "center",
  },
  closeText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

