import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BookingModal = ({ isVisible, onClose, bookings, filterType, setFilterType, toggleImageModal }) => {
  // Filter bookings based on the selected type (morning or afternoon)
  const filterBookings = (bookings) => {
    return bookings.filter((booking) => {
      const timeRange = booking.time || '';
      if (filterType === 'morning') {
        return timeRange.includes('AM');
      } else {
        return timeRange.includes('PM');
      }
    });
  };

  // Render bookings based on the selected filter
  const renderBookings = () => {
    const filteredBookings = filterBookings(bookings);
    if (filteredBookings.length > 0) {
      return filteredBookings.map((item, index) => (
        <View key={index} style={styles.bookingItem}>
          <Text style={styles.bookingText}>
            <Ionicons name="person-circle-outline" size={16} color="#000" /> {item.first_name} {item.last_name}
          </Text>
          {/* Additional booking details */}
          <Text style={styles.bookingText}><Ionicons name="time-outline" size={16} color="#000" /> {item.time}</Text>
          <TouchableOpacity style={styles.viewButton} onPress={() => toggleImageModal && toggleImageModal(item.id_image_url)}>
            <Text style={styles.viewButtonText}>View ID Image</Text>
          </TouchableOpacity>
        </View>
      ));
    } else {
      return <Text style={styles.emptyText}>No {filterType} bookings available for this date.</Text>;
    }
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Bookings</Text>

          {/* Filter buttons */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              onPress={() => setFilterType('morning')}
              style={[styles.filterButton, filterType === 'morning' && styles.activeFilterButton]}
            >
              <Text style={[styles.filterButtonText, filterType === 'morning' && styles.activeFilterButtonText]}>
                Morning
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilterType('afternoon')}
              style={[styles.filterButton, filterType === 'afternoon' && styles.activeFilterButton]}
            >
              <Text style={[styles.filterButtonText, filterType === 'afternoon' && styles.activeFilterButtonText]}>
                Afternoon
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bookingList}>
            {renderBookings()}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
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
});

export default BookingModal;
