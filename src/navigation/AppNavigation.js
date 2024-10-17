// src/navigation/AppNavigation.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomNavigation } from 'react-native-paper';

// Import screen components
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import BookingScreen from '../screens/BookingScreen';
import CalendarScreen from '../screens/CalendarScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ReportsScreen from '../screens/ReportsScreen'; // Import the Reports screen

// Create Stack Navigator for each tab
const HomeStack = createStackNavigator();
const BookingStack = createStackNavigator();
const CalendarStack = createStackNavigator();
const HistoryStack = createStackNavigator();
const ReportsStack = createStackNavigator();

// Define stacks for each tab
const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}> {/* Hide header for all screens in HomeStack */}
    <HomeStack.Screen 
      name="Home" 
      component={HomeScreen} 
    />
  </HomeStack.Navigator>
);

const BookingStackScreen = () => (
  <BookingStack.Navigator screenOptions={{ headerShown: false }}> {/* Hide header for all screens in BookingStack */}
    <BookingStack.Screen 
      name="Booking" 
      component={BookingScreen} 
    />
  </BookingStack.Navigator>
);

const CalendarStackScreen = () => (
  <CalendarStack.Navigator screenOptions={{ headerShown: false }}> {/* Hide header for all screens in CalendarStack */}
    <CalendarStack.Screen 
      name="Calendar" 
      component={CalendarScreen} 
    />
  </CalendarStack.Navigator>
);

const HistoryStackScreen = () => (
  <HistoryStack.Navigator screenOptions={{ headerShown: false }}> {/* Hide header for all screens in HistoryStack */}
    <HistoryStack.Screen 
      name="History" 
      component={HistoryScreen} 
    />
  </HistoryStack.Navigator>
);

const ReportsStackScreen = () => (
  <ReportsStack.Navigator screenOptions={{ headerShown: false }}> {/* Hide header for all screens in ReportsStack */}
    <ReportsStack.Screen 
      name="Reports" 
      component={ReportsScreen} 
    />
  </ReportsStack.Navigator>
);

// Bottom Navigation Component using React Native Paper
const MainTabs = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'home', title: 'Home', icon: 'home' },
    { key: 'booking', title: 'Booking', icon: 'calendar' },
    { key: 'calendar', title: 'Calendar', icon: 'calendar-outline' },
    { key: 'history', title: 'History', icon: 'history' },
    { key: 'reports', title: 'Reports', icon: 'chart-bar' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: HomeStackScreen,
    booking: BookingStackScreen,
    calendar: CalendarStackScreen,
    history: HistoryStackScreen,
    reports: ReportsStackScreen,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{ backgroundColor: 'black' }} // Customize the bar style here
      activeColor="white"
      inactiveColor="gray"
    />
  );
};

// Main App Navigation Component
export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}> {/* Hide header for stack */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
  