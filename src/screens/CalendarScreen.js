import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Modal, Text, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { db } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for icons

const CalendarScreen = () => {
  const [calendarBookings, setCalendarBookings] = useState({});
  const [completedBookings, setCompletedBookings] = useState({});
  const [selectedDateBookings, setSelectedDateBookings] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [noHistoryData, setNoHistoryData] = useState(false);
  const [animation] = useState(new Animated.Value(0)); // Animation state

  // Fetch booking data from Firebase
  useEffect(() => {
    const historyRef = ref(db, 'history');

    const unsubscribe = onValue(
      historyRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setNoHistoryData(false); // Reset no data state
          const formattedBookings = {};
          const completedBookingsList = {};
          Object.keys(data).forEach((key) => {
            const booking = data[key];

            if (booking.status === 'confirmed') {
              const bookingDate = booking.date;

              // Group bookings for the calendar
              if (formattedBookings[bookingDate]) {
                formattedBookings[bookingDate].dots.push({
                  key,
                  color: 'red',
                  bookingDetails: booking,
                });
              } else {
                formattedBookings[bookingDate] = {
                  dots: [{ key, color: 'red', bookingDetails: booking }],
                  marked: true,
                };
              }

              // Group completed bookings by date
              if (completedBookingsList[bookingDate]) {
                completedBookingsList[bookingDate].push(booking);
              } else {
                completedBookingsList[bookingDate] = [booking];
              }
            }
          });

          setCalendarBookings(formattedBookings);
          setCompletedBookings(completedBookingsList);
        } else {
          setNoHistoryData(true);
          setCalendarBookings({});
          setCompletedBookings({});
        }
      },
      (error) => console.error('Error fetching booking data:', error)
    );

    return () => unsubscribe();
  }, []);

  // Handle selecting a day on the calendar
  const handleDayPress = (day) => {
    const bookings = calendarBookings[day.dateString]?.dots || [];
    setSelectedDateBookings(bookings);
    toggleModal(true);
  };

  // Animate modal visibility
  const toggleModal = (visible) => {
    setModalVisible(visible);
    Animated.timing(animation, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  };

  // Modal animation style
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Calendar</Text>
        <View style={styles.greetingContainer}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          <Text style={styles.subText}>What would you like to do today?</Text>
        </View>
      </View>

      {/* Calendar or No Data */}
      {noHistoryData ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No bookings available.</Text>
        </View>
      ) : (
        <View style={styles.calendarContainer}>
          <Calendar
            markingType={'multi-dot'}
            markedDates={calendarBookings}
            onDayPress={handleDayPress}
            theme={calendarTheme}
            style={styles.calendar}
          />
        </View>
      )}

      {/* Booking modal */}
      <Modal transparent={true} visible={isModalVisible} animationType="none" onRequestClose={() => toggleModal(false)}>
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalContent, modalAnimationStyle]}>
            <Text style={styles.modalTitle}>Bookings</Text>
            <ScrollView style={styles.bookingList}>
              {selectedDateBookings.length > 0 ? (
                selectedDateBookings.map((item) => (
                  <View key={item.key} style={styles.bookingItem}>
                    <Text style={styles.bookingText}>
                      <Ionicons name="person-circle-outline" size={16} color="#000" /> {item.bookingDetails.first_name} {item.bookingDetails.last_name}
                    </Text>
                    <Text style={styles.bookingText}>
                      <Ionicons name="cube-outline" size={16} color="#000" /> Package: {item.bookingDetails.package}
                    </Text>
                    <Text style={styles.bookingText}>
                      <Ionicons name="calendar-outline" size={16} color="#000" /> Date: {item.bookingDetails.date}
                    </Text>
                    <Text style={styles.bookingText}>
                      <Ionicons name="time-outline" size={16} color="#000" /> Time: {item.bookingDetails.time}
                    </Text>
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
    </View>
  );
};

const calendarTheme = {
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    padding: 20,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 10,
    left: 0,
    zIndex: 10,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'left',
  },
  greetingContainer: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
  },
  subText: {
    fontSize: 16,
    color: 'black',
    marginTop: 5,
  },
  calendarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendar: {
    width: Dimensions.get('window').width - 20,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  bookingList: {
    width: '100%',
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#f44336',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CalendarScreen;