import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper'; // Import from react-native-paper
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

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
      {/* Logo and Title */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>WELCOME!</Text>
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Email"
          mode="outlined"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          theme={{ colors: { primary: '#000' } }} // Primary color for outline
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Password"
          mode="outlined"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          theme={{ colors: { primary: '#000' } }}
        />
      </View>

      {/* Error Message */}
      {errorMessage ? (
        <HelperText type="error" visible={true} style={styles.errorMessage}>
          {errorMessage}
        </HelperText>
      ) : null}

      {/* Forgot Password Link */}
      <Button
        mode="text"
        onPress={handleForgotPassword}
        style={styles.forgotPasswordButton}
        labelStyle={styles.forgotPasswordText}
      >
        Forgot password?
      </Button>

      {/* Sign In Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          Sign In
        </Button>
      </View>
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
    marginBottom: 30,
  },
  logo: {
    width: 125,
    height: 125,
    borderRadius: 62.5,
    borderWidth: 2,
  },
  title: {
    fontSize: 40,
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff', // White background for input fields
    borderRadius: 25, // Rounded corners for input
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  forgotPasswordButton: {
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#000',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#000', // Black background for button
    borderRadius: 25, // Rounded corners for button
  },
  buttonContent: {
    height: 45,
  },
  buttonLabel: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default LoginScreen;
