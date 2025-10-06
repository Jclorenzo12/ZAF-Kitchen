import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../supabase"; // import mo yung supabase client

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 🔹 Fetch data from Supabase
  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      console.log("❌ Error fetching bookings:", error.message);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
      <View style={styles.container}>
        {/* Stats Section */}
        <Text style={styles.sectionTitle}>📊 Dashboard Overview</Text>
        <View style={styles.statsRow}>
          <View style={[styles.card, styles.gradientCard]}>
            <MaterialCommunityIcons name="calendar-clock" size={28} color="#fff" />
            <Text style={styles.number}>
              {
                events.filter((e) => e.event_date === new Date().toISOString().split("T")[0])
                  .length
              }
            </Text>
            <Text style={styles.label}>Events Today</Text>
          </View>
        </View>

        {/* Today’s Events */}
        <Text style={styles.sectionTitle}>📅 Today’s Events</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#ff6600" style={{ marginTop: 40 }} />
        ) : events.filter(
            (e) => e.event_date === new Date().toISOString().split("T")[0]
          ).length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>No events for today.</Text>
        ) : (
          events
            .filter((e) => e.event_date === new Date().toISOString().split("T")[0])
            .map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => setSelectedEvent(event)}
              >
                <View style={styles.eventRow}>
                  <MaterialCommunityIcons
                    name={
                      event.event_type?.toLowerCase().includes("wedding")
                        ? "party-popper"
                        : event.event_type?.toLowerCase().includes("birthday")
                        ? "cake-variant"
                        : "calendar"
                    }
                    size={24}
                    color="#ff6600"
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.eventTitle}>
                      {event.event_type || "Event"}
                    </Text>
                    <Text style={styles.eventDetails}>
                      {event.event_date} • {event.guest_count || 0} pax
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
        )}
      </View>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal transparent animationType="slide" visible={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {selectedEvent.event_type || "Event"}
              </Text>
              <Text style={styles.modalDetail}>📅 Date: {selectedEvent.event_date}</Text>
              <Text style={styles.modalDetail}>🕒 Time: {selectedEvent.start_time} - {selectedEvent.end_time}</Text>
              <Text style={styles.modalDetail}>👥 Guests: {selectedEvent.guest_count}</Text>
              <Text style={styles.modalDetail}>📍 Location: {selectedEvent.location}</Text>
              <Text style={styles.modalDetail}>📝 Organizer: {selectedEvent.celebrant_name || selectedEvent.full_name}</Text>

              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedEvent(null)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: "#f9f9f9", marginTop: 55 },
  container: { padding: 20 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 25,
    marginBottom: 15,
    color: "#333",
    borderBottomWidth: 2,
    borderBottomColor: "#ff6600",
    paddingBottom: 5,
  },

  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  card: {
    flex: 1,
    margin: 8,
    paddingVertical: 25,
    borderRadius: 18,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  gradientCard: { backgroundColor: "#ff6600" },
  number: { fontSize: 26, fontWeight: "bold", color: "#fff", marginTop: 8 },
  label: { fontSize: 14, color: "#fff", textAlign: "center", marginTop: 4 },

  eventCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    elevation: 4,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  eventRow: { flexDirection: "row", alignItems: "center" },
  eventTitle: { fontSize: 16, fontWeight: "600", color: "#000" },
  eventDetails: { fontSize: 13, color: "#666", marginTop: 3 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 18,
    elevation: 8,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#ff6600" },
  modalDetail: { fontSize: 15, color: "#444", marginBottom: 10 },
  closeButton: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#ff6600",
    alignItems: "center",
  },
  closeText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
