import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Image, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { ref, onValue, remove, set } from 'firebase/database';
import { Swipeable } from 'react-native-gesture-handler';

// Helper function to check if a booking is recent (within the last 7 days)
const isRecentBooking = (bookingDateTime) => {
  const bookingDate = new Date(bookingDateTime);
  const currentDate = new Date();
  const timeDiff = Math.abs(currentDate - bookingDate);
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24); // Convert time difference to days
  return daysDiff <= 7; // Return true if booking is within the last 7 days
};

// Helper function to check if a booking is pending
const isPendingBooking = (bookingStatus) => {
  return bookingStatus === 'pending'; // Assuming bookings marked as 'pending' are pending
};

const BookingScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false); // State for image modal
  const [selectedImageUrl, setSelectedImageUrl] = useState(null); // State for the image URL
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // State for the search query
  const [animation] = useState(new Animated.Value(0)); // Animation state for modal

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

    const { id, ...bookingWithoutId } = booking;
    const historyRef = ref(db, `history/${id}`);

    // Add booking to history with status and actionTimestamp (replacing timestamp)
    set(historyRef, {
      ...bookingWithoutId,
      status: status,
      actionTimestamp: new Date().toISOString(), // Use ISO string for actionTimestamp
    })
      .then(() => {
        // Remove booking from bookings node after transferring to history
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
  };

  // Confirm booking action
  const handleConfirm = (booking) => {
    Alert.alert(
      "Confirm Booking",
      "Are you sure you want to mark this booking as completed?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm",
          onPress: () => transferBookingToHistory(booking, 'confirmed'),
        }
      ]
    );
  };

  // Cancel booking action
  const handleDelete = (booking) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Cancel Booking",
          onPress: () => transferBookingToHistory(booking, 'canceled'),
          style: "destructive",
        }
      ]
    );
  };

  // Delete booking action (permanently remove from bookings)
  const handlePermanentDelete = (booking) => {
    Alert.alert(
      "Delete Booking",
      "Are you sure you want to delete this booking permanently?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            const bookingRef = ref(db, `bookings/${booking.id}`);
            remove(bookingRef)
              .then(() => {
                setBookings((prevBookings) => prevBookings.filter(b => b.id !== booking.id));
              })
              .catch((error) => {
                console.error("Error deleting booking from Firebase:", error);
              });
          },
          style: "destructive",
        }
      ]
    );
  };

  const openBookingDetailsModal = (booking) => {
    setSelectedBooking(booking);
    toggleModal(true); // Use the animated toggle
  };

  const closeModal = () => {
    setSelectedBooking(null);
    toggleModal(false); // Use the animated toggle
  };

  // Toggle modal visibility with animation (including fade effect)
  const toggleModal = (visible) => {
    setModalVisible(visible);
    Animated.timing(animation, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  };

  // Function to open Image Modal
  const openImageModal = (url) => {
    setSelectedImageUrl(url); // Set the image URL
    setImageModalVisible(true); // Open the modal
  };

  // Close the Image Modal
  const closeImageModal = () => {
    setSelectedImageUrl(null); // Clear the image URL
    setImageModalVisible(false); // Close the modal
  };

  // Modal animation style with fade effect
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
    opacity: animation, // Add opacity for fade effect
  };

  // Filter bookings based on search query (by Name, Month, and Date)
  const filteredBookings = bookings.filter((booking) => {
    const fullName = `${booking.first_name} ${booking.last_name}`.toLowerCase();
    const bookingDate = new Date(booking.date);
    const bookingMonth = bookingDate.toLocaleString('en-US', { month: 'long' }).toLowerCase();
    const bookingDay = bookingDate.getDate().toString();
    
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      bookingMonth.includes(query) ||
      bookingDay.includes(query)
    );
  });

  const renderRightActions = (booking) => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={[styles.actionButton, styles.confirmButton]} onPress={() => handleConfirm(booking)}>
        <Ionicons name="checkmark-circle" size={30} color="white" />
        <Text style={styles.actionText}>Confirm</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(booking)}>
        <Ionicons name="close-circle" size={30} color="white" />
        <Text style={styles.actionText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handlePermanentDelete(booking)}>
        <Ionicons name="trash-outline" size={30} color="white" />
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const formatDateTime = (date) => {
    const bookingDate = new Date(date);
    return bookingDate.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.fixedHeader}>
        <Text style={styles.headerText}>Bookings</Text>
        <View style={styles.greetingContainer}>
          <Text style={styles.welcomeText}>Your Recent Bookings</Text>
          <Text style={styles.subText}>Manage your upcoming and recent bookings with ease.</Text>
        </View>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name, month, or date"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

<ScrollView contentContainerStyle={styles.scrollContainer}>
  {filteredBookings.map((booking) => (
    <Swipeable
      key={booking.id}
      renderRightActions={() => renderRightActions(booking)}
      friction={1.5}
      overshootFriction={8}
    >
      <TouchableOpacity
        onPress={() => openBookingDetailsModal(booking)}
        style={styles.card}
      >
        <View style={styles.cardContent}>
          {/* Display the booking ID */}
          <Text style={styles.cardTitle}>Booking ID: {booking.id}</Text>
          <Text style={styles.cardTitle}>Name: {booking.first_name} {booking.last_name}</Text>

          {/* Display the booking date and time */}
          <Text style={styles.cardDescription}>Booking Date: {formatDateTime(booking.date)}</Text>
          <Text style={styles.cardDescription}>Booking Time: {booking.time}</Text>

          <Text style={styles.cardDescription}>Package: {booking.package}</Text>

          {/* Static "Pending" Badge - Displayed on every card */}
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  ))}
</ScrollView>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="none"
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackground}>
            <Animated.View style={[styles.modalContainer, modalAnimationStyle]}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.modalText}>
                  <Ionicons name="person-circle-outline" size={16} color="#000" /> {selectedBooking.first_name} {selectedBooking.last_name}
                </Text>
                <Text style={styles.modalText}>
                  <Ionicons name="calendar-outline" size={16} color="#000" /> Date: {formatDateTime(selectedBooking.date)}
                </Text>
                <Text style={styles.modalText}>
                  <Ionicons name="time-outline" size={16} color="#000" /> Time: {selectedBooking.time}
                </Text>
                <Text style={styles.modalText}>
                  <Ionicons name="cube-outline" size={16} color="#000" /> Package: {selectedBooking.packageName}
                </Text>
                <Text style={styles.modalText}>
                  <Ionicons name="cash-outline" size={16} color="#000" /> Payment Method: {selectedBooking.payment_method}
                </Text>
                <Text style={styles.modalText}>
                  <Ionicons name="mail-outline" size={16} color="#000" /> Email: {selectedBooking.email_address}
                </Text>
                <Text style={styles.modalText}>
                  <Ionicons name="call-outline" size={16} color="#000" /> Contact: {selectedBooking.contact_number}
                </Text>
                <Text style={styles.modalText}>
                  <Ionicons name="time-outline" size={16} color="#000" /> Booking Sent: {selectedBooking.date_time}
                </Text>

                {/* Button to open ID Image */}
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={() => openImageModal(selectedBooking.id_image_url)}
                >
                  <Text style={styles.buttonText}>View ID Image</Text>
                </TouchableOpacity>

                {/* Button to open Receipt */}
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={() => openImageModal(selectedBooking.receipt_url)}
                >
                  <Text style={styles.buttonText}>View Receipt</Text>
                </TouchableOpacity>
              </ScrollView>
              <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      )}

      {/* Image Modal */}
      {selectedImageUrl && (
        <Modal
        transparent={true}
        visible={imageModalVisible}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.imageModalBackground}>
          <View style={styles.imageModalContainer}>
            <Image
              source={{ uri: selectedImageUrl }}
              style={styles.modalImage}
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.imageModalCloseButton} onPress={closeImageModal}>
              <Text style={styles.imageModalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>      
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 150, // Adjusted to leave space for the fixed header
  },
  fixedHeader: {
    width: '100%',
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    padding: 20,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
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
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    borderWidth: 1,
    borderColor: 'black',
    minHeight: 90, // Reduce the height to make it minimalist
    position: 'relative',
  },
  cardContent: {
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: 18, // Larger font for title
    fontWeight: 'bold',
    color: 'black',
  },
  cardDescription: {
    fontSize: 14,
    color: 'black',
    marginTop: 5,
  },
  recentBookingText: {
    fontSize: 14,
    color: 'green',
    fontWeight: 'bold',
    marginTop: 10,
  },
    // Updated pending badge style to match the history screen
    pendingBadge: {
      position: 'absolute',
      top: -5, // Aligns the badge closer to the top-right corner
      right: 0, // Aligns the badge closer to the right edge
      backgroundColor: 'orange',
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
  pendingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 150, // Match the card height
    padding: 10,
  },
  actionButton: {
    width: 80,
    height: 125,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#333',
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    marginLeft: 10,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
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
  modalScroll: {
    maxHeight: 1000,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'left',
  },
  modalCloseButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageButton: {
    backgroundColor: 'black',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageModalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  imageModalContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  imageModalCloseButton: {
    backgroundColor: '#f44336', // Different color (blue) for close button
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30, // Larger button
    alignItems: 'center',
    marginTop: 20,
  },
  imageModalCloseText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookingScreen;
