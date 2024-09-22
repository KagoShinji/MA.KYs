import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import icons for use in the card

const HomeScreen = ({ navigation }) => {
  // Navigate to the respective screens
  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      {/* Greeting Container */}
      <View style={styles.greetingContainer}>
        <Text style={styles.welcomeText}>Hello!</Text>
      </View>

      {/* Main Navigation Boxes */}
      <View style={styles.boxContainer}>
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigateToScreen('Booking')}
        >
          {/* Add an Icon and Text */}
          <Ionicons name="book" size={24} color="#333" /> 
          <Text style={styles.boxText}>Booking</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={() => navigateToScreen('Calendar')}
        >
          {/* Add an Icon and Text */}
          <Ionicons name="calendar" size={24} color="#333" /> 
          <Text style={styles.boxText}>Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={() => navigateToScreen('History')}
        >
          {/* Add an Icon and Text */}
          <Ionicons name="time" size={24} color="#333" /> 
          <Text style={styles.boxText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={() => navigateToScreen('Reports')}
        >
          {/* Add an Icon and Text */}
          <Ionicons name="bar-chart" size={24} color="#333" /> 
          <Text style={styles.boxText}>Reports</Text>
        </TouchableOpacity>
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
  // Container for the 4 navigation boxes
  boxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow wrapping to the next line
    justifyContent: 'center', // Center boxes horizontally
    alignItems: 'center', // Center boxes vertically
    width: '100%',
    marginTop: 30,
  },
  // Style for individual boxes
  box: {
    width: '40%', // Box width
    height: 100, // Box height
    backgroundColor: '#f0f0f0', // Box background color
    justifyContent: 'center', // Center text horizontally
    alignItems: 'center', // Center text vertically
    margin: 10, // Margin between boxes
    borderRadius: 10, // Rounded corners
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 0.3, // Shadow opacity for iOS
    shadowRadius: 5, // Shadow radius for iOS
  },
  // Text inside the box
  boxText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5, // Space between icon and text
  },
});

export default HomeScreen;