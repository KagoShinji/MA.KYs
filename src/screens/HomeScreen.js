import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, ScrollView } from 'react-native';
import BookingsIcon from '../assets/icons/bookings.svg'; // Update the path as necessary
import CalendarIcon from '../assets/icons/calendar.svg';
import HistoryIcon from '../assets/icons/history.svg';
import ReportsIcon from '../assets/icons/reports.svg';
import moment from 'moment-timezone';
import { db } from '../firebaseConfig';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';

const HomeScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [confirmedBookings, setConfirmedBookings] = useState(0);
  const [cancelledBookings, setCancelledBookings] = useState(0);
  const [bookingsToday, setBookingsToday] = useState([]);
  const [loading, setLoading] = useState(true);

  const PHILIPPINE_TIMEZONE = 'Asia/Manila';

  // Get current date in Philippine timezone using moment-timezone
  const currentDate = moment.tz(new Date(), PHILIPPINE_TIMEZONE).format('YYYY-MM-DD');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);

        // Fetch Pending Bookings
        const bookingsRef = ref(db, 'bookings');
        onValue(bookingsRef, (snapshot) => {
          const bookings = snapshot.val();
          const pendingCount = bookings ? Object.keys(bookings).length : 0;
          setPendingBookings(pendingCount);
        });

        // Fetch Confirmed Bookings
        const historyRef = ref(db, 'history');
        const confirmedQuery = query(historyRef, orderByChild('status'), equalTo('completed'));
        onValue(confirmedQuery, (snapshot) => {
          const confirmedBookingsList = snapshot.val();
          const confirmedCount = confirmedBookingsList ? Object.keys(confirmedBookingsList).length : 0;
          setConfirmedBookings(confirmedCount);
        });

        // Fetch Cancelled Bookings
        const cancelledQuery = query(historyRef, orderByChild('status'), equalTo('cancelled'));
        onValue(cancelledQuery, (snapshot) => {
          const cancelledBookingsList = snapshot.val();
          const cancelledCount = cancelledBookingsList ? Object.keys(cancelledBookingsList).length : 0;
          setCancelledBookings(cancelledCount);
        });

        // Fetch Bookings for Today
        const todayQuery = query(historyRef, orderByChild('date'), equalTo(currentDate));
        onValue(todayQuery, (snapshot) => {
          const bookings = snapshot.val();
          const todayBookings = bookings ? Object.values(bookings) : [];
          setBookingsToday(todayBookings);
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings data: ", error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentDate]);

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  const animatedValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale: animatedValue }],
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.fixedHeader}>
        <Text style={styles.headerText}>Home</Text>
        <View style={styles.greetingContainer}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          <Text style={styles.subText}>What would you like to do today?</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Today's Date and Bookings Card */}
        <View style={styles.dateCardContainer}>
          <TouchableOpacity style={styles.dateCard} onPress={() => setModalVisible(true)}>
            <Text style={styles.dateText}>{moment.tz(new Date(), PHILIPPINE_TIMEZONE).format('MMMM D, YYYY')}</Text>
            {loading ? (
              <Text style={styles.bookingTodayText}>Loading...</Text>
            ) : (
              <Text style={styles.bookingTodayText}>{`Bookings for today: ${bookingsToday.length}`}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Booking Status Cards */}
        <View style={styles.statusContainer}>
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Pending Bookings</Text>
            <Text style={styles.statusCount}>{pendingBookings}</Text>
          </View>
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Completed Bookings</Text>
            <Text style={styles.statusCount}>{confirmedBookings}</Text>
          </View>
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Cancelled Bookings</Text>
            <Text style={styles.statusCount}>{cancelledBookings}</Text>
          </View>
        </View>

        {/* Actions Section */}
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.boxContainer}>
          {[
            { name: 'Booking', icon: BookingsIcon, screen: 'Booking' },
            { name: 'Calendar', icon: CalendarIcon, screen: 'Calendar' },
            { name: 'History', icon: HistoryIcon, screen: 'History' },
            { name: 'Reports', icon: ReportsIcon, screen: 'Reports' },
          ].map((item) => (
            <TouchableOpacity
              style={[styles.box, animatedStyle]}
              key={item.name}
              onPress={() => navigateToScreen(item.screen)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.8}
            >
              <View style={styles.innerBox}>
                <item.icon width={25} height={25} style={styles.boxIcon} />
                <Text style={styles.boxText}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Modal for Today's Bookings */}
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Today's Bookings</Text>
              <ScrollView style={styles.modalScroll}>
                {bookingsToday.length === 0 ? (
                  <Text style={styles.modalBooking}>No bookings for today</Text>
                ) : (
                  bookingsToday.map((booking, index) => (
                    <Text style={styles.modalBooking} key={index}>
                      {`${booking.first_name} ${booking.last_name} - ${booking.time}`}
                    </Text>
                  ))
                )}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
// Updated styles

fixedHeader: {
  width: '100%',
  backgroundColor: 'transparent',
  position: 'absolute',
  top: 10,
  left: 0,
  right: 0,
  zIndex: 10,
  padding: 20,
  borderBottomColor: 'black',
  alignItems: 'flex-start', // Align content to the left
},
headerText: {
  fontSize: 30,
  fontWeight: 'bold',
  color: 'black',
  textAlign: 'left', // Align text to the left
},
greetingContainer: {
  alignItems: 'flex-start', // Align container content to the left
  marginTop: 10,
},
welcomeText: {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#333',
  textAlign: 'left', // Align text to the left
},
subText: {
  fontSize: 16,
  color: 'black',
  marginTop: 5,
  textAlign: 'left', // Align text to the left
},
  scrollViewContent: {
    paddingTop: 150, // Spacing for fixed header and greeting
    paddingHorizontal: 20,
  },
  dateCardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateCard: {
    width: '90%',
    padding: 20,
    backgroundColor: 'black',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  dateText: {
    fontSize: 25,
    color: '#FFF',
    fontWeight: 'bold',
  },
  bookingTodayText: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusCard: {
    flex: 1,
    padding: 5,
    margin: 5,
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: 'thin',
    color: 'black',
  },
  statusCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 15,
  },
  boxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  box: {
    width: '45%',
    height: 100,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  innerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  boxIcon: {
    marginRight: 10,
  },
  boxText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'black',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  modalScroll: {
    marginBottom: 20,
  },
  modalBooking: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
  },
  modalCloseButton: {
    backgroundColor: 'black',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#FFF',
  },
});

export default HomeScreen;
