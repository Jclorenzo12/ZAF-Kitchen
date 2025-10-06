import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { supabase } from "../supabase"; // import yung client

export default function Events() {
  const [tab, setTab] = useState("All");
  const tabs = ["Today", "Upcoming", "All"];

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🔹 Fetch data from Supabase bookings table
  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      console.log("❌ Supabase error:", error);
    } else {
      console.log("✅ Supabase data:", data);
      setEvents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 🔹 Refresh control
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, []);

  // 🔹 Filter events based on selected tab
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const filteredEvents =
    tab === "Today"
      ? events.filter((e) => e.event_date === today)
      : tab === "Upcoming"
      ? events.filter((e) => e.event_date > today)
      : events;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Icon name="calendar" size={28} color="#FF6600" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Event Schedule</Text>
          <Text style={styles.headerSubtitle}>Staff Dashboard</Text>
        </View>
        <Icon name="bell-outline" size={24} color="#555" style={{ marginLeft: "auto" }} />
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.activeTab]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LOADING SPINNER / NO DATA / EVENTS */}
      {loading ? (
        <ActivityIndicator size="large" color="#FF6600" style={{ marginTop: 50 }} />
      ) : filteredEvents.length === 0 ? (
        <View style={styles.noEvents}>
          <Icon name="calendar-remove" size={90} color="#ccc" />
          <Text style={styles.noEventsText}>No Events Found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FF6600"]} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => console.log("👉 Event pressed:", item)}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.tag, { backgroundColor: "#FF6600" }]}>
                  <Icon name="calendar-star" size={14} color="#fff" />
                  <Text style={styles.tagText}>{item.event_type || "Event"}</Text>
                </View>
                <View style={styles.timeRow}>
                  <Icon name="clock-outline" size={14} color="#777" />
                  <Text style={styles.time}>
                    {item.start_time} - {item.end_time}
                  </Text>
                </View>
              </View>

              <Text style={styles.title}>
                {item.celebrant_name || item.full_name || "Unknown"}'s Event
              </Text>

              <View style={styles.row}>
                <Icon name="map-marker" size={16} color="#FF6600" />
                <Text style={styles.detail}>{item.location || "No location"}</Text>
              </View>
              <View style={styles.row}>
                <Icon name="calendar-month" size={16} color="#FF6600" />
                <Text style={styles.detail}>{item.event_date}</Text>
              </View>
              <View style={styles.row}>
                <Icon name="account-group" size={16} color="#FF6600" />
                <Text style={styles.detail}>{item.guest_count || 0} Guests</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 17, marginTop: 60 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  headerSubtitle: { fontSize: 13, color: "#777" },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    padding: 5,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 6 },
  tabText: { color: "#555", fontWeight: "500" },
  activeTab: { backgroundColor: "#FF6600" },
  activeTabText: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  tag: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { color: "#fff", marginLeft: 4, fontSize: 12, fontWeight: "bold" },
  timeRow: { flexDirection: "row", alignItems: "center" },
  time: { marginLeft: 4, fontSize: 12, color: "#777" },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  detail: { fontSize: 13, color: "#444", marginLeft: 6, paddingTop: 2 },
  noEvents: { flex: 1, justifyContent: "center", alignItems: "center" },
  noEventsText: { marginTop: 10, fontSize: 20, color: "#999", fontWeight: "600" },
});
