// src/screens/ReportScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { db } from '../firebaseConfig'; // Ensure this path is correct
import { ref, onValue } from 'firebase/database'; // Import functions from Firebase database

const ReportScreen = () => {
  const [bookingData, setBookingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to handle errors

  // Fetch booking data from Firebase
  useEffect(() => {
    const fetchBookingData = () => {
      const bookingsRef = ref(db, 'bookings');
      onValue(
        bookingsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const formattedData = Object.values(data); // Convert data to array format
            setBookingData(formattedData);
          } else {
            setBookingData([]);
          }
          setLoading(false); // Stop loading once data is fetched
        },
        (error) => {
          setError(error.message); // Handle errors during data fetching
          setLoading(false); // Stop loading if there's an error
        }
      );
    };

    fetchBookingData();
  }, []);

  // Calculate total bookings
  const totalBookings = bookingData.length;

  // Calculate bookings per package
  const bookingsByPackage = bookingData.reduce((acc, booking) => {
    const packageName = booking.package || 'Unknown'; // Handle undefined package names
    if (!acc[packageName]) {
      acc[packageName] = 1;
    } else {
      acc[packageName] += 1;
    }
    return acc;
  }, {});

  // Calculate number of cancellations
  const totalCancellations = bookingData.filter((booking) => booking.status === 'cancelled').length;

  // Render loading indicator or report content
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading Booking Data...</Text>
      </View>
    );
  }

  // Render error message if there is an error
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error fetching data: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Booking Report</Text>

      {/* Total Bookings */}
      <View style={styles.reportSection}>
        <Text style={styles.sectionTitle}>Total Bookings</Text>
        <Text style={styles.sectionContent}>{totalBookings}</Text>
      </View>

      {/* Bookings by Package */}
      <View style={styles.reportSection}>
        <Text style={styles.sectionTitle}>Bookings by Package</Text>
        {Object.entries(bookingsByPackage).map(([packageName, count]) => (
          <View key={packageName} style={styles.item}>
            <Text style={styles.itemLabel}>{packageName}:</Text>
            <Text style={styles.itemValue}>{count}</Text>
          </View>
        ))}
      </View>

      {/* Total Cancellations */}
      <View style={styles.reportSection}>
        <Text style={styles.sectionTitle}>Total Cancellations</Text>
        <Text style={styles.sectionContent}>{totalCancellations}</Text>
      </View>
    </ScrollView>
  );
};

// Styles for the Report Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  reportSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: '#555',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  itemLabel: {
    fontSize: 16,
    color: '#333',
  },
  itemValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReportScreen;