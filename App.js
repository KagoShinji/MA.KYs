import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screen components
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import BookingScreen from './src/screens/BookingScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ReportsScreen from './src/screens/ReportsScreen'; // New Reports Screen

// Import the HistoryContext
import { HistoryProvider } from './src/context/HistoryContext';

// Create Stack Navigator for the application flow
const Stack = createStackNavigator();

// Create Bottom Tab Navigator for the main app screens
const Tab = createBottomTabNavigator();

// Main Tab Navigator for the App Screens
const MainTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Booking':
              iconName = 'calendar';
              break;
            case 'Calendar':
              iconName = 'calendar-outline';
              break;
            case 'History':
              iconName = 'time';
              break;
            case 'Reports': // New Reports Tab
              iconName = 'bar-chart-outline';
              break;
            default:
              iconName = 'home';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'black',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
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
        <Stack.Navigator initialRouteName="Login">
          {/* Stack Screen for Login */}
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          
          {/* Stack Screen for the Main Tabs */}
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />

          {/* Optionally, add Calendar screen as part of Stack for nested navigation */}
          <Stack.Screen 
            name="Calendar" 
            component={CalendarScreen} 
            options={{ title: 'Booking Calendar' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </HistoryProvider>
  );
};

export default App;