import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Hello!</Text>

      {/* Booking Section */}
      <TouchableOpacity style={styles.sectionTouchable}>
        <Text style={styles.sectionText}>Booking</Text>
        <View style={styles.sectionBox}>
          <Text style={styles.boxContent}>Booking Details</Text>
        </View>
      </TouchableOpacity>

      {/* History Section */}
      <TouchableOpacity style={styles.sectionTouchable}>
        <Text style={styles.sectionText}>History</Text>
        <View style={styles.sectionBox}>
          <Text style={styles.boxContent}>History Details</Text>
        </View>
      </TouchableOpacity>

      {/* Archives Section */}
      <TouchableOpacity style={styles.sectionTouchable}>
        <Text style={styles.sectionText}>Archives</Text>
        <View style={styles.sectionBox}>
          <Text style={styles.boxContent}>Archive Details</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
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
  welcomeText: {
    fontSize: 50,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: -20,
    marginBottom: 10,
  },
  sectionTouchable: {
    width: '100%',
    marginBottom: 20,
  },
  sectionText: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 10,
    color: '#000',
  },
  sectionBox: {
    width: '100%',
    height: 125,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  boxContent: {
    fontSize: 14,
    color: '#000',
  },
  button: {
    height: 45,
    width: '40%',
    backgroundColor: '#000',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default HomeScreen;
