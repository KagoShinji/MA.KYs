import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import BookingScreen from './screens/BookingScreen';
import CalendarScreen from './screens/CalendarScreen';
import HistoryScreen from './screens/HistoryScreen';
import ArchivesScreen from './screens/ArchivesScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Hide headers in tab navigator
        tabBarOptions: {
          activeTintColor: '#000', // Color of active tab
          inactiveTintColor: '#888', // Color of inactive tabs
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Booking" component={BookingScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Archives" component={ArchivesScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
