// src/screens/LoginScreen.js

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Alert, Dimensions } from 'react-native';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

const { width } = Dimensions.get('window'); // Get screen width

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, username, password);
      navigation.replace('Main');
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-email':
          setErrorMessage('Invalid email address.');
          break;
        case 'auth/user-disabled':
          setErrorMessage('User account is disabled.');
          break;
        case 'auth/user-not-found':
          setErrorMessage('User not found. Please check your username.');
          break;
        case 'auth/wrong-password':
          setErrorMessage('Incorrect password.');
          break;
        default:
          setErrorMessage('Login failed. Please try again.');
      }
      setUsername('');
      setPassword('');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Please contact support for password recovery.');
  };

  return (
    <View style={styles.container}>
      {/* Foreground Content */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
        />
      </View>
      <Text style={styles.title}>WELCOME!</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      {errorMessage ? (
        <Text style={styles.errorMessage}>{errorMessage}</Text>
      ) : null}
      <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 125,
    height: 125,
    borderRadius: 62.5,
    borderWidth: 2,
  },
  title: {
    fontSize: 45,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
    letterSpacing: 2,
  },
  input: {
    height: 45,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 30,
    marginBottom: 15,
    paddingHorizontal: 15,
    color: '#000',
    width: '100%',
    backgroundColor: '#F5F5F5',
    fontSize: 14,
    fontWeight: '400',
  },
  button: {
    height: 45,
    width: '50%',
    backgroundColor: '#000',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
  },
  forgotPassword: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#000',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  errorMessage: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;