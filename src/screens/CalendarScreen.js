import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { db } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

const CalendarScreen = () => {
  const [calendarBookings, setCalendarBookings] = useState({});
  const [completedBookings, setCompletedBookings] = useState({});
  const [selectedDateBookings, setSelectedDateBookings] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [noHistoryData, setNoHistoryData] = useState(false);
  const [filterType, setFilterType] = useState('morning'); // Filter type for morning or afternoon
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState(null); // Store the URL of the image to display

  useEffect(() => {
    const historyRef = ref(db, 'history');

    const unsubscribe = onValue(
      historyRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setNoHistoryData(false); 
          const formattedBookings = {};
          const completedBookingsList = {};

          Object.keys(data).forEach((key) => {
            const booking = data[key];

            if (booking.status === 'confirmed') {
              const bookingDate = booking.date;

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

  // Filter the bookings based on the filterType (morning/afternoon)
  const filterBookings = (bookings) => {
    return bookings.filter((booking) => {
      const timeRange = booking.bookingDetails.time || '';
      if (filterType === 'morning') {
        return timeRange.includes('AM');
      } else {
        return timeRange.includes('PM');
      }
    });
  };

  // Handle filtering when the day is selected
  const handleDayPress = (day) => {
    const bookings = calendarBookings[day.dateString]?.dots || [];
    const morningBookings = bookings.filter((booking) => booking.bookingDetails.time.includes('AM'));

    if (morningBookings.length > 0) {
      setFilterType('morning');
    } else {
      setFilterType('afternoon');
    }

    setSelectedDateBookings(bookings);
    toggleModal(true);
  };

  const toggleModal = (visible) => {
    setModalVisible(visible);
  };

  const toggleImageModal = (url) => {
    setImageUrl(url);  // Set the image URL
    setImageModalVisible(true);  // Open the modal to view the image
  };

  // Render the filtered bookings based on morning/afternoon
  const renderBookings = () => {
    const filteredBookings = filterBookings(selectedDateBookings);
    if (filteredBookings.length > 0) {
      return filteredBookings.map((item) => (
        <View key={item.key} style={styles.bookingItem}>
          <Text style={styles.bookingText}>
            <Ionicons name="person-circle-outline" size={16} color="#000" />{' '}
            {item.bookingDetails.first_name} {item.bookingDetails.last_name}
          </Text>
          <Text style={styles.bookingText}>
            <Ionicons name="cube-outline" size={16} color="#000" /> Package:{' '}
            {item.bookingDetails.package}
          </Text>
          <Text style={styles.bookingText}>
            <Ionicons name="calendar-outline" size={16} color="#000" /> Date:{' '}
            {item.bookingDetails.date}
          </Text>
          <Text style={styles.bookingText}>
            <Ionicons name="time-outline" size={16} color="#000" /> Time:{' '}
            {item.bookingDetails.time}
          </Text>
          <Text style={styles.bookingText}>
            <Ionicons name="mail-outline" size={16} color="#000" /> Email:{' '}
            {item.bookingDetails.email_address}
          </Text>
          <Text style={styles.bookingText}>
            <Ionicons name="call-outline" size={16} color="#000" /> Contact: {item.bookingDetails.contact_number}
          </Text>
          <Text style={styles.bookingText}>
            <Ionicons name="card-outline" size={16} color="#000" /> Payment Method: {item.bookingDetails.payment_method}
          </Text>

          <TouchableOpacity style={styles.viewButton} onPress={() => toggleImageModal(item.bookingDetails.id_image_url)}>
            <Text style={styles.viewButtonText}>View ID Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewButton} onPress={() => toggleImageModal(item.bookingDetails.receipt_url)}>
            <Text style={styles.viewButtonText}>View Receipt</Text>
          </TouchableOpacity>
        </View>
      ));
    } else {
      return <Text style={styles.emptyText}>No {filterType} bookings available for this date.</Text>;
    }
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

      {/* Booking Modal */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="none"
        onRequestClose={() => toggleModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bookings</Text>

            {/* Filter buttons */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                onPress={() => setFilterType('morning')}
                style={[
                  styles.filterButton,
                  filterType === 'morning' && styles.activeFilterButton,
                ]}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterType === 'morning' && styles.activeFilterButtonText,
                  ]}
                >
                  Morning
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterType('afternoon')}
                style={[
                  styles.filterButton,
                  filterType === 'afternoon' && styles.activeFilterButton,
                ]}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterType === 'afternoon' && styles.activeFilterButtonText,
                  ]}
                >
                  Afternoon
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.bookingList}>
              {renderBookings()}
            </ScrollView>

            <TouchableOpacity style={styles.closeButton} onPress={() => toggleModal(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Modal */}
      <Modal
        transparent={true}
        visible={imageModalVisible}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalContainer}>
          <Image source={{ uri: imageUrl }} style={styles.modalImage} resizeMode="contain" />
          <TouchableOpacity style={styles.closeButton} onPress={() => setImageModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#ccc',
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#000',
  },
  filterButtonText: {
    color: '#000',
    fontSize: 16,
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  bookingList: {
    width: '100%',
    marginBottom: 20,
  },
  bookingItem: {
    marginBottom: 15,
  },
  bookingText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#000',
  },
  viewButton: {
    backgroundColor: '#000',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginVertical: 5,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
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
  imageModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalImage: {
    width: '90%',
    height: '90%',
  },
});

export default CalendarScreen;