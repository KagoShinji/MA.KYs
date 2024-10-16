import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, TextInput, Modal, Image } from 'react-native';
import { db } from '../firebaseConfig';
import { ref, onValue, remove, set } from 'firebase/database';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const separateBookingTime = (timeRange) => {
  const [startTime, endTime] = timeRange.split('-');
  return { startTime: startTime.trim(), endTime: endTime.trim() };
};

const HistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]); // Filtered history state
  const [searchQuery, setSearchQuery] = useState(''); // Search query state
  const [filterType, setFilterType] = useState('all'); // Filter state: 'all', 'completed', 'canceled'
  const [modalVisible, setModalVisible] = useState(false); // Modal state
  const [selectedBooking, setSelectedBooking] = useState(null); // Selected booking for the modal
  const [imageModalVisible, setImageModalVisible] = useState(false); // State for image modal
  const [imageToShow, setImageToShow] = useState(null); // URL of the image to show
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const historyRef = ref(db, 'history');

    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const historyArray = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .sort((a, b) => new Date(b.actionTimestamp) - new Date(a.actionTimestamp)); // Sort by actionTimestamp, most recent first

        setHistory(historyArray);
        setFilteredHistory(historyArray); // Initially set the filtered history
      } else {
        setHistory([]);
        setFilteredHistory([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle delete action
  const handleDelete = (item) => {
    Alert.alert(
      'Delete Booking',
      `Are you sure you want to delete the ${item.status} booking for ${item.first_name} ${item.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            const historyRef = ref(db, `history/${item.id}`);
            remove(historyRef)
              .then(() => {
                setHistory((prevHistory) => prevHistory.filter((historyItem) => historyItem.id !== item.id));
              })
              .catch((error) => {
                console.error('Error deleting booking from history:', error);
              });
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Handle undo action
  const handleUndo = (item) => {
    if (!item || !item.id) {
      return;
    }

    try {
      const { id, ...itemWithoutId } = item;
      const bookingRef = ref(db, `bookings/${id}`);

      set(bookingRef, {
        ...itemWithoutId,
        status: 'active',
        actionTimestamp: new Date().toISOString(), // Store actionTimestamp as ISO string
      })
        .then(() => {
          const historyRef = ref(db, `history/${id}`);
          remove(historyRef).then(() => {
            setHistory((prevHistory) => prevHistory.filter((historyItem) => historyItem.id !== id));
            Alert.alert('Success', 'Booking moved back to active bookings.');
          }).catch((error) => {
            console.error('Error removing booking from history:', error);
          });
        })
        .catch((error) => {
          console.error('Error moving booking back to active:', error);
        });
    } catch (error) {
      console.error('An error occurred in handleUndo:', error);
    }
  };

  // Handle filtering by completed/canceled status
  const handleFilterChange = (status) => {
    setFilterType(status);

    if (status === 'confirmed') {
      setFilteredHistory(history.filter((item) => item.status === 'confirmed'));
    } else if (status === 'canceled') {
      setFilteredHistory(history.filter((item) => item.status === 'canceled'));
    } else {
      setFilteredHistory(history);
    }
  };

  // Handle search query input
  const handleSearchQuery = (query) => {
    setSearchQuery(query);

    const filtered = history.filter((item) => {
      const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
      return fullName.includes(query.toLowerCase());
    });

    setFilteredHistory(filtered);
  };

  // Open modal for booking details
  const openModal = (booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setSelectedBooking(null);
    setModalVisible(false);
  };

  // Open image modal (for ID and Receipt)
  const openImageModal = (url) => {
    setImageToShow(url);
    setImageModalVisible(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setImageToShow(null);
    setImageModalVisible(false);
  };

  const renderRightActions = (item) => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={[styles.actionButton, styles.undoButton]} onPress={() => handleUndo(item)}>
        <Ionicons name="arrow-undo" size={24} color="white" />
        <Text style={styles.actionText}>Undo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item)}>
        <Ionicons name="trash" size={24} color="white" />
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.fixedHeader}>
        <Text style={styles.headerText}>History</Text>
        <View style={styles.greetingContainer}>
          <Text style={styles.welcomeText}>Your Booking History</Text>
          <Text style={styles.subText}>Manage your completed and cancelled bookings.</Text>
        </View>

        {/* Search Bar */}
        <TextInput
          style={styles.searchBar}
          placeholder="Search by name"
          value={searchQuery}
          onChangeText={handleSearchQuery}
        />

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' ? styles.activeFilter : null]}
            onPress={() => handleFilterChange('all')}
          >
            <Text style={[styles.filterButtonText, filterType === 'all' ? styles.activeFilterText : null]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'confirmed' ? styles.activeFilter : null]}
            onPress={() => handleFilterChange('confirmed')}
          >
            <Text style={[styles.filterButtonText, filterType === 'confirmed' ? styles.activeFilterText : null]}>
              Completed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'canceled' ? styles.activeFilter : null]}
            onPress={() => handleFilterChange('canceled')}
          >
            <Text style={[styles.filterButtonText, filterType === 'canceled' ? styles.activeFilterText : null]}>
              Cancelled
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Card List */}
      <View style={styles.cardListContainer}>
        {filteredHistory.length === 0 ? (
          <Text style={styles.emptyMessage}>No bookings found.</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {filteredHistory.map((item) => {
              const { startTime, endTime } = separateBookingTime(item.time);

              return (
                <Swipeable key={item.id} renderRightActions={() => renderRightActions(item)}>
                  <TouchableOpacity
                    style={[styles.card, item.status === 'canceled' ? styles.cancelledCard : styles.completedCard]}
                    onPress={() => openModal(item)} // Open modal on card press
                  >
                    <Text style={styles.cardTitle}>
                      {item.first_name} {item.last_name}
                    </Text>
                    <Text style={styles.cardDescription}>
                      Package: {item.package ? capitalizeFirstLetter(item.package) : 'N/A'}
                    </Text>
                    <Text style={styles.cardDescription}>Date: {formatDate(item.date)}</Text>
                    <Text style={styles.cardDescription}>
                      {item.status === 'canceled' ? 'Canceled on:' : 'Completed on:'} {new Date(item.actionTimestamp).toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                </Swipeable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <Text style={styles.modalText}>
                <Ionicons name="person-circle-outline" size={16} color="#000" /> {selectedBooking.first_name} {selectedBooking.last_name}
              </Text>
              <Text style={styles.modalText}>
                <Ionicons name="calendar-outline" size={16} color="#000" /> Date: {formatDate(selectedBooking.date)}
              </Text>
              <Text style={styles.modalText}>
                <Ionicons name="time-outline" size={16} color="#000" /> Time: {selectedBooking.time}
              </Text>
              <Text style={styles.modalText}>
                <Ionicons name="cube-outline" size={16} color="#000" /> Package: {selectedBooking.package}
              </Text>
              <Text style={styles.modalText}>
                <Ionicons name="mail-outline" size={16} color="#000" /> Email: {selectedBooking.email_address}
              </Text>
              <Text style={styles.modalText}>
                <Ionicons name="call-outline" size={16} color="#000" /> Contact: {selectedBooking.contact_number}
              </Text>
              <Text style={styles.modalText}>
                <Ionicons name="time-outline" size={16} color="#000" /> {selectedBooking.status === 'canceled' ? 'Canceled on:' : 'Completed on:'} {new Date(selectedBooking.actionTimestamp).toLocaleString()}
              </Text>

              {/* View ID and View Receipt Buttons */}
              <TouchableOpacity
                style={styles.imageButton}
                onPress={() => openImageModal(selectedBooking.id_image_url)}
              >
                <Text style={styles.buttonText}>View ID Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={() => openImageModal(selectedBooking.receipt_url)}
              >
                <Text style={styles.buttonText}>View Receipt</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Image Modal */}
      {imageToShow && (
        <Modal
        transparent={true}
        visible={imageModalVisible}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.imageModalBackground}>
          <View style={styles.imageModalContainer}>
            <Image
              source={{ uri: imageToShow }}
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
    paddingTop: 150,
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
    marginVertical: 10,
    width: '100%',
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
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 16,
    color: 'black',
  },
  activeFilter: {
    backgroundColor: 'black',
    borderColor: 'black',
  },
  activeFilterText: {
    color: 'white',
  },
  cardListContainer: {
    flex: 1, // Allow the card list to take the remaining space
    marginTop: 120, // Ensure it's below the filter buttons and search bar
    paddingHorizontal: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'black',
    minHeight: 90,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  cardDescription: {
    fontSize: 14,
    color: 'black',
    marginTop: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '100%',
    padding: 10,
    marginRight: 10,
  },
  actionButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#333',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    marginLeft: 10,
  },
  undoButton: {
    backgroundColor: '#28a745',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#777',
    marginTop: 20,
  },
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
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'left',
  },
  modalCloseButton: {
    backgroundColor: '#f44336',
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
  imageModalCloseButton: {
    backgroundColor: '#f44336',  // Different background color for the close button
    borderRadius: 12,            // Larger border radius for more rounded button
    paddingVertical: 12,         // Increased padding for a larger button
    paddingHorizontal: 30,       // Increased horizontal padding for more width
    alignItems: 'center',        // Center the text
    marginTop: 20,               // Margin to separate the button from the image
  },
  imageModalCloseText: {
    color: 'white',              // Text color
    fontSize: 18,                // Larger font size for more prominence
    fontWeight: 'bold',          // Bold text for emphasis
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
});

export default HistoryScreen;