import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { db } from '../firebaseConfig';
import { ref, onValue, remove, set } from 'firebase/database';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

// Utility function to capitalize the first letter of a string
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Utility function to separate start and end times
const separateBookingTime = (timeRange) => {
  // Split the time range into start and end times
  const [startTime, endTime] = timeRange.split('-');
  return { startTime: startTime.trim(), endTime: endTime.trim() };
};

const HistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const screenWidth = Dimensions.get('window').width; // Get screen width

  useEffect(() => {
    const historyRef = ref(db, 'history');

    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const historyArray = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key]
          }))
          .sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp, most recent first

        setHistory(historyArray);
      } else {
        setHistory([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle delete action
  const handleDelete = (item) => {
    Alert.alert(
      "Delete Booking",
      `Are you sure you want to delete the ${item.status} booking for ${item.first_name} ${item.last_name}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            const historyRef = ref(db, `history/${item.id}`);
            remove(historyRef).then(() => {
              setHistory((prevHistory) => prevHistory.filter((historyItem) => historyItem.id !== item.id));
            }).catch((error) => {
              console.error("Error deleting booking from history:", error);
            });
          },
          style: "destructive"
        }
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

      const bookingRef = ref(db, `bookings/${id}`); // Reference to the bookings node

      set(bookingRef, {
        ...itemWithoutId, // Copy all fields from the history item except 'id'
        status: 'active', // Reset status to active when moved back to bookings
        timestamp: Date.now(), // Set a new timestamp for the booking
      })
        .then(() => {
          // Remove booking from the history node
          const historyRef = ref(db, `history/${id}`);
          remove(historyRef).then(() => {
            setHistory((prevHistory) => prevHistory.filter((historyItem) => historyItem.id !== id));
            Alert.alert("Success", "Booking moved back to active bookings.");
          }).catch((error) => {
            console.error("Error removing booking from history:", error);
          });
        })
        .catch((error) => {
          console.error("Error moving booking back to active:", error);
        });
    } catch (error) {
      console.error("An error occurred in handleUndo:", error);
    }
  };

  // Render right swipe actions for delete and undo
  const renderRightActions = (item) => {
    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.undoButton]} onPress={() => handleUndo(item)}>
          <Ionicons name="arrow-undo" size={24} color="#000" />
          <Text style={styles.actionText}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item)}>
          <Ionicons name="trash" size={24} color="#000" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      {history.length === 0 ? (
        <Text style={styles.emptyMessage}>No completed or cancelled bookings yet.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {history.map((item) => {
            const { startTime, endTime } = separateBookingTime(item.time); // Separate start and end times

            return (
              <Swipeable
                key={item.id}
                renderRightActions={() => renderRightActions(item)}
              >
                <View style={[styles.card, item.status === 'cancelled' ? styles.cancelledCard : styles.completedCard, { width: screenWidth - 30 }]}>
                  <Text style={styles.cardTitle}>{item.first_name} {item.last_name}</Text>
                  
                  {/* Display Package */}
                  <Text style={styles.cardDescription}>Package: {item.package ? capitalizeFirstLetter(item.package) : 'N/A'}</Text>
                  
                  {/* Display Date and Time Separately */}
                  <Text style={styles.cardDescription}>Date: {formatDate(item.date)}</Text>
                  <Text style={styles.cardDescription}>Time: {capitalizeFirstLetter(startTime)} - {capitalizeFirstLetter(endTime)}</Text>
                  
                  <Text style={styles.cardDescription}>
                    {item.status === 'cancelled' ? 'Cancelled on:' : 'Completed on:'} {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </View>
              </Swipeable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#000', // Black text for the title
  },
  emptyMessage: {
    fontSize: 16,
    color: '#777',
    marginTop: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  card: {
    backgroundColor: '#f8f8f8', // Light background for a clean look
    borderRadius: 10,
    padding: 20, // Increased padding for better spacing
    marginBottom: 15,
    borderLeftWidth: 5, // Accent border
    borderLeftColor: '#000', // Black border accent for minimalistic style
  },
  completedCard: {
    borderLeftColor: '#28a745', // Green for completed bookings
  },
  cancelledCard: {
    borderLeftColor: '#ff3b30', // Red for cancelled bookings
  },
  cardTitle: {
    fontSize: 18, // Slightly larger font size for the title
    fontWeight: '500',
    marginBottom: 10,
    color: '#000', // Black text for the title
  },
  cardDescription: {
    fontSize: 14,
    color: '#333', // Darker text for better readability
    marginBottom: 5, // Added margin between description items
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
    backgroundColor: '#fff', // White background for buttons
    borderColor: '#000', // Black border for minimalistic look
    borderWidth: 1,
  },
  deleteButton: {
    marginLeft: 10,
  },
  undoButton: {
    marginRight: 10,
  },
  actionText: {
    color: '#000', // Black text for button labels
    fontSize: 12,
    marginTop: 5,
  },
});

export default HistoryScreen;