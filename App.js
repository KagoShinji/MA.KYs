import React, { useEffect } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screen components
import HomeScreen from './src/screens/HomeScreen';
import BookingScreen from './src/screens/BookingScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ReportsScreen from './src/screens/ReportsScreen';

// Import SVG icons from the src/assets/icons folder
import HomeIcon from './src/assets/icons/homebar.svg';
import BookingIcon from './src/assets/icons/bookingsbar.svg';
import CalendarIcon from './src/assets/icons/calendarbar.svg';
import HistoryIcon from './src/assets/icons/historybar.svg';
import ReportsIcon from './src/assets/icons/reportsbar.svg';

// Import the HistoryContext
import { HistoryProvider } from './src/context/HistoryContext';

// Create Stack Navigator for the application flow
const Stack = createStackNavigator();

// Create Bottom Tab Navigator for the main app screens
const Tab = createBottomTabNavigator();

// SplashScreen Component
const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Simulate a loading process and navigate to Home
    setTimeout(() => {
      navigation.replace('Main');
    }, 2000); // Adjust the delay as needed
  }, [navigation]);

  return (
    <View style={styles.splashContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      <Image
        source={require('./assets/logo.png')} // Update the path to your logo file if necessary
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="black" style={styles.loader} />
    </View>
  );
};

// Main Tab Navigator for the App Screens
const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let IconComponent;

          switch (route.name) {
            case 'Home':
              IconComponent = HomeIcon;
              break;
            case 'Booking':
              IconComponent = BookingIcon;
              break;
            case 'Calendar':
              IconComponent = CalendarIcon;
              break;
            case 'History':
              IconComponent = HistoryIcon;
              break;
            case 'Reports':
              IconComponent = ReportsIcon;
              break;
            default:
              IconComponent = HomeIcon;
          }

          // Render the SVG icon
          return <IconComponent width={size} height={size} fill={color} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'black',
          borderTopWidth: 0,
          height: 65,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        headerShown: false, // Hide header for each tab screen
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Booking" component={BookingScreen} options={{ tabBarLabel: 'Booking' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarLabel: 'Calendar' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ tabBarLabel: 'Reports' }} />
    </Tab.Navigator>
  );
};

// Main App Component
const App = () => {
  return (
    <HistoryProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
        <Stack.Navigator initialRouteName="Splash">
          {/* Stack Screen for Splash Screen */}
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          
          {/* Stack Screen for the Main Tabs */}
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </HistoryProvider>
  );
};

// Styles for SplashScreen
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: 150,
    height: 150,
  },
  loader: {
    marginTop: 20,
  },
});

export default App;