import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { ref, onValue, set, remove } from 'firebase/database';

const BookingScreen = () => {
  const [bookings, setBookings] = useState([]);
  const navigation = useNavigation();

  // Fetch bookings from Firebase Realtime Database
  useEffect(() => {
    const bookingsRef = ref(db, 'bookings');

    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bookingArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setBookings(bookingArray);
      }
    });

    return () => unsubscribe();
  }, []);

  // Function to transfer booking to history and remove from current bookings
  const transferBookingToHistory = (booking, status) => {
    if (!booking || !booking.id) {
      console.error("Invalid booking object or missing ID:", booking);
      return;
    }

    try {
      const { id, ...bookingWithoutId } = booking;
      const historyRef = ref(db, `history/${id}`);

      set(historyRef, {
        ...bookingWithoutId,
        status: status,
        timestamp: Date.now()
      })
        .then(() => {
          const bookingRef = ref(db, `bookings/${id}`);
          remove(bookingRef)
            .then(() => {
              setBookings((prevBookings) => prevBookings.filter(b => b.id !== id));
            })
            .catch((error) => {
              console.error("Error removing booking from Firebase:", error);
            });
        })
        .catch((error) => {
          console.error("Error saving to history:", error);
        });
    } catch (error) {
      console.error("An error occurred in handleCheck:", error);
    }
  };

  // Confirmation and handling for check button (Completed)
  const handleCheck = (booking) => {
    Alert.alert(
      "Confirm Check",
      "Are you sure you want to mark this booking as completed and move it to the history?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm",
          onPress: () => transferBookingToHistory(booking, 'completed')
        }
      ]
    );
  };

  // Confirmation and handling for cross button (Cancelled)
  const handleCross = (booking) => {
    Alert.alert(
      "Confirm Remove",
      "Are you sure you want to mark this booking as cancelled and move it to the history?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm",
          onPress: () => transferBookingToHistory(booking, 'cancelled')
        }
      ]
    );
  };

  // Function to format the date and time
  const formatDateTime = (date, time) => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    return `${formattedDate} - ${time}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.greetingContainer}>
        <Text style={styles.welcomeText}>Hello!</Text>
      </View>
      <Text style={styles.sectionText}>Bookings</Text>

      <View style={styles.sectionBox}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {bookings.map((booking) => (
            <View key={booking.id} style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>Name: {booking.first_name} {booking.last_name}</Text>
                  <Text style={styles.cardDescription}>Package: {booking.package}</Text>
                  <Text style={styles.cardDescription}>
                    {formatDateTime(booking.date, booking.time)}
                  </Text>
                </View>
                <View style={styles.iconContainer}>
                  <TouchableOpacity onPress={() => handleCheck(booking)} style={styles.iconButton}>
                    <Ionicons name="checkmark-circle" size={30} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleCross(booking)} style={styles.iconButton}>
                    <Ionicons name="close-circle" size={30} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
  },
  greetingContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionText: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 10,
    color: '#000',
  },
  sectionBox: {
    width: '100%',
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginBottom: 20,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginHorizontal: 5,
  },
});

export default BookingScreen;