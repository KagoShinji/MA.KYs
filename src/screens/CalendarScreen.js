import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Modal, Text, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { db } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for icons

const CalendarScreen = () => {
  const [calendarBookings, setCalendarBookings] = useState({});
  const [selectedDateBookings, setSelectedDateBookings] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [noHistoryData, setNoHistoryData] = useState(false);
  const [animation, setAnimation] = useState(new Animated.Value(0)); // Animation state

  // Fetch booking data from the 'history' node in Firebase
  useEffect(() => {
    const historyRef = ref(db, 'history');

    const unsubscribe = onValue(
      historyRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setNoHistoryData(false); // Reset no data state
          const formattedBookings = {};
          Object.keys(data).forEach((key) => {
            const booking = data[key];

            // Only process bookings that are not cancelled
            if (booking.status !== 'cancelled') {
              const bookingDate = booking.date;

              if (formattedBookings[bookingDate]) {
                formattedBookings[bookingDate].dots.push({
                  key,
                  color: '#000', // Black dot for booking
                  bookingDetails: booking, // Store booking details for modal
                });
              } else {
                formattedBookings[bookingDate] = {
                  dots: [
                    { key, color: '#000', bookingDetails: booking }
                  ],
                  marked: true
                };
              }
            }
          });

          setCalendarBookings(formattedBookings);
        } else {
          // If no data is available in the history node
          setNoHistoryData(true);
          setCalendarBookings({});
        }
      },
      (error) => {
        console.error("Error fetching booking data:", error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle selecting a day on the calendar
  const handleDayPress = (day) => {
    const bookings = calendarBookings[day.dateString]?.dots || [];
    if (bookings.length > 0) {
      setSelectedDateBookings(bookings);
      toggleModal(true);
    } else {
      setSelectedDateBookings([]);
      toggleModal(true);
    }
  };

  // Animate the modal visibility
  const toggleModal = (visible) => {
    setModalVisible(visible);
    Animated.timing(animation, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  };

  // Modal Animation Style
  const modalAnimationStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [300, 0],
        }),
      },
    ],
    opacity: animation,
  };

  return (
    <View style={styles.container}>
      {/* Display calendar only if history data is available */}
      {noHistoryData ? (
        <Text style={styles.noDataText}>No bookings available.</Text>
      ) : (
        <>
          <Calendar
            markingType={'multi-dot'}
            markedDates={calendarBookings}
            onDayPress={handleDayPress}
            theme={{
              backgroundColor: '#fff',
              calendarBackground: '#fff',
              textSectionTitleColor: '#000',
              selectedDayBackgroundColor: '#000',
              selectedDayTextColor: '#fff',
              todayTextColor: '#000',
              dayTextColor: '#000',
              textDisabledColor: '#d9e1e8',
              dotColor: '#000',
              selectedDotColor: '#fff',
              arrowColor: '#000',
              monthTextColor: '#000',
              indicatorColor: '#000',
              textDayFontWeight: 'bold',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
            style={styles.calendar}
          />

          {/* Modal for displaying bookings */}
          <Modal
            transparent={true}
            visible={isModalVisible}
            animationType="none"
            onRequestClose={() => toggleModal(false)}
          >
            <View style={styles.modalContainer}>
              <Animated.View style={[styles.modalContent, modalAnimationStyle]}>
                <Text style={styles.modalTitle}>Bookings</Text>
                <ScrollView style={styles.bookingList}>
                  {/* Display all bookings for the selected date */}
                  {selectedDateBookings.length > 0 ? (
                    selectedDateBookings.map((item) => (
                      <View key={item.key} style={styles.bookingItem}>
                        <Text style={styles.bookingText}>
                          <Ionicons name="person-circle-outline" size={16} color="#000" /> {item.bookingDetails.first_name} {item.bookingDetails.last_name}
                        </Text>
                        <Text style={styles.bookingText}><Ionicons name="cube-outline" size={16} color="#000" /> Package: {item.bookingDetails.package}</Text>
                        <Text style={styles.bookingText}><Ionicons name="calendar-outline" size={16} color="#000" /> Date: {item.bookingDetails.date}</Text>
                        <Text style={styles.bookingText}><Ionicons name="time-outline" size={16} color="#000" /> Time: {item.bookingDetails.time}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No bookings found for this date.</Text>
                  )}
                </ScrollView>
                <TouchableOpacity style={styles.closeButton} onPress={() => toggleModal(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  calendar: {
    width: Dimensions.get('window').width - 20,
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)', // Darker overlay
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white', // Black background for modal
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black', // White text for title
    marginBottom: 10,
  },
  bookingList: {
    width: '100%',
    marginBottom: 20,
  },
  bookingItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#555', // Gray border for items
  },
  bookingText: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black', // White text for booking details,
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa', // Light gray for empty message
    textAlign: 'center',
    marginTop: 10,
  },
  closeButton: {
    width: '100%',
    padding: 10,
    backgroundColor: 'black', // White button background
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white', // Black text for button
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CalendarScreen;