// firebaseConfig.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQZEe6k0aVnf5d0S-tKM1zosdWrjJxjGM",
  authDomain: "makys-e0be3.firebaseapp.com",
  databaseURL: "https://makys-e0be3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "makys-e0be3",
  storageBucket: "makys-e0be3.appspot.com",
  messagingSenderId: "733517582583",
  appId: "1:733517582583:web:f5127b932875a553f443f2",
  measurementId: "G-LSRS5L4J64"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Realtime Database
const db = getDatabase(app);

// Initialize Firebase Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Export the initialized services
export { auth, db };
