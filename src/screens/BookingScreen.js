import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { ref, onValue, set, remove } from 'firebase/database';

const BookingScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [confirmationType, setConfirmationType] = useState(''); // 'completed' or 'cancelled'
  const navigation = useNavigation();

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
              setModalVisible(false); // Close the modal after transfer
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

  const handleConfirm = () => {
    if (selectedBooking && confirmationType) {
      transferBookingToHistory(selectedBooking, confirmationType);
    }
  };

  const openModal = (booking, type) => {
    setSelectedBooking(booking);
    setConfirmationType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setConfirmationType('');
    setModalVisible(false);
  };

  const formatDateTime = (date, time) => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    return `${formattedDate} - ${time}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.fixedHeader}>
        <Text style={styles.headerText}>Bookings</Text>
        <View style={styles.greetingContainer}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          <Text style={styles.subText}>What would you like to do today?</Text>
        </View>
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
                  <TouchableOpacity onPress={() => openModal(booking, 'completed')} style={styles.iconButton}>
                    <Ionicons name="checkmark-circle" size={30} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openModal(booking, 'cancelled')} style={styles.iconButton}>
                    <Ionicons name="close-circle" size={30} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Confirmation Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm {confirmationType === 'completed' ? 'Completion' : 'Cancellation'}</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to mark this booking as {confirmationType}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleConfirm}>
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeModal}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 50,
  },
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
    color: 'black',
    textAlign: 'left', // Align text to the left
  },
  subText: {
    fontSize: 16,
    color: 'black',
    marginTop: 5,
    textAlign: 'left', // Align text to the left
  },
  sectionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 150, // Adjusted margin to accommodate the fixed header
    width: '100%',
    textAlign: 'left',
  },
  sectionBox: {
    width: '100%',
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    padding: 10,
    backgroundColor: '#f8f8f8',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
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
    color: 'black',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: 'black',
    marginTop: 5,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginHorizontal: 5,
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  // Modal styles
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: 'black',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'black',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingScreen;
