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
import * as Animatable from "react-native-animatable";
import { supabase } from "../supabase";

export default function Events() {
  const [tab, setTab] = useState("Approved");
  const tabs = ["Approved", "Pending", "All"];
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Fetch bookings from Supabase (exclude rejected)
  const fetchBookings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .not("booking_status", "eq", "rejected") // ✅ excludes rejected bookings
        .order("event_date", { ascending: true });

      if (error) {
        console.error("❌ Supabase error:", error.message);
        setEvents([]);
      } else {
        console.log("✅ Bookings fetched:", data.length);
        setEvents(data || []);
      }
    } catch (err) {
      console.error("⚠️ Unexpected error:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, []);

  // ✅ Filter events based on selected tab
  const filteredEvents = events.filter((e) => {
    if (tab === "Approved") return e.booking_status === "approved";
    if (tab === "Pending") return e.booking_status === "pending";
    return true; // All
  });

  const getEmptyMessage = () => {
    if (tab === "Approved") return "No approved events found ✅";
    if (tab === "Pending") return "No pending bookings ⏳";
    return "No events found 📭";
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Icon name="calendar" size={28} color="#FF0000" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Event Schedule</Text>
          <Text style={styles.headerSubtitle}>Staff Dashboard</Text>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.activeTab]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CONTENT */}
      {loading ? (
        <ActivityIndicator size="large" color="#FF0000" style={{ marginTop: 60 }} />
      ) : filteredEvents.length === 0 ? (
        <View style={styles.noEvents}>
          <Icon name="calendar-remove" size={90} color="#ccc" />
          <Text style={styles.noEventsText}>{getEmptyMessage()}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FF0000"]}
            />
          }
          renderItem={({ item, index }) => (
            <Animatable.View
              animation="fadeInUp"
              delay={index * 150}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.tag,
                    {
                      backgroundColor:
                        item.booking_status === "approved"
                          ? "green"
                          : item.booking_status === "pending"
                          ? "orange"
                          : "#999",
                    },
                  ]}
                >
                  <Icon name="calendar-star" size={14} color="#fff" />
                  <Text style={styles.tagText}>
                    {item.booking_status?.charAt(0).toUpperCase() +
                      item.booking_status?.slice(1)}
                  </Text>
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
                <Icon name="map-marker" size={16} color="#FF0000" />
                <Text style={styles.detail}>{item.location || "No location"}</Text>
              </View>

              <View style={styles.row}>
                <Icon name="calendar-month" size={16} color="#FF0000" />
                <Text style={styles.detail}>{item.event_date}</Text>
              </View>

              <View style={styles.row}>
                <Icon name="account-group" size={16} color="#FF0000" />
                <Text style={styles.detail}>
                  {item.guest_count || 0} Guests
                </Text>
              </View>
            </Animatable.View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F5",
    padding: 20,
    marginTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#777",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 6,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabText: {
    color: "#555",
    fontWeight: "600",
  },
  activeTab: {
    backgroundColor: "#FF0000",
  },
  activeTabText: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "bold",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    marginLeft: 4,
    fontSize: 12,
    color: "#777",
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  detail: {
    fontSize: 13,
    color: "#444",
    marginLeft: 6,
    paddingTop: 2,
  },
  noEvents: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  noEventsText: {
    marginTop: 10,
    fontSize: 17,
    color: "#999",
    fontWeight: "600",
    textAlign: "center",
  },
});
