// src/screens/ReportsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { db } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { PieChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const ReportsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedBookingsByMonth, setCompletedBookingsByMonth] = useState({});
  const [bookingsByPackage, setBookingsByPackage] = useState({});
  const [salesByPackage, setSalesByPackage] = useState({});
  const [totalSales, setTotalSales] = useState(0);
  const [mostSalePackage, setMostSalePackage] = useState('');

  const packagePrices = {
    'Package A': 3000,
    'Package B': 4000,
    'Package C': 5000,
    'Package D': 6000,
  };

  // Helper function to generate random colors for pie chart
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    const fetchBookingData = () => {
      const historyRef = ref(db, 'history'); // Fetching from 'history' node
      onValue(
        historyRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const formattedData = Object.values(data);
            processBookingData(formattedData); // Process the data
          } else {
            setLoading(false);
          }
        },
        (error) => {
          setError(error.message);
          setLoading(false);
        }
      );
    };

    fetchBookingData();
  }, []);

  const processBookingData = (data) => {
    const bookingsByMonth = {};
    const bookingsByPackageCount = {};
    const salesByPackageCount = {};
    let totalSalesValue = 0;
    let maxSalesPackage = '';
    let maxSalesValue = 0;

    data.forEach((booking) => {
      const bookingDate = new Date(booking.date);
      const month = bookingDate.toLocaleString('default', { month: 'long' });

      // Only consider completed bookings
      if (booking.status === 'completed') {
        // Group by month
        if (!bookingsByMonth[month]) {
          bookingsByMonth[month] = 1;
        } else {
          bookingsByMonth[month]++;
        }

        // Group by package and calculate sales
        const packageName = booking.package || 'Unknown'; // Handle undefined package names
        const packagePrice = packagePrices[packageName] || 0;

        // Count bookings by package
        if (!bookingsByPackageCount[packageName]) {
          bookingsByPackageCount[packageName] = 1;
        } else {
          bookingsByPackageCount[packageName]++;
        }

        // Calculate sales by package
        if (!salesByPackageCount[packageName]) {
          salesByPackageCount[packageName] = packagePrice;
        } else {
          salesByPackageCount[packageName] += packagePrice;
        }

        // Increment total sales
        totalSalesValue += packagePrice;

        // Determine the most sale package
        if (salesByPackageCount[packageName] > maxSalesValue) {
          maxSalesValue = salesByPackageCount[packageName];
          maxSalesPackage = packageName;
        }
      }
    });

    setCompletedBookingsByMonth(bookingsByMonth);
    setBookingsByPackage(bookingsByPackageCount);
    setSalesByPackage(salesByPackageCount);
    setTotalSales(totalSalesValue); // Set total sales
    setMostSalePackage(maxSalesPackage); // Set most sale package
    setLoading(false);
  };

  const pieChartData = Object.keys(completedBookingsByMonth).map((month) => ({
    name: month,
    count: completedBookingsByMonth[month],
    color: getRandomColor(),
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  const bookingsBarChartData = {
    labels: Object.keys(bookingsByPackage), // Package names dynamically from data
    datasets: [
      {
        data: Object.values(bookingsByPackage), // Corresponding counts for each package
      },
    ],
  };

  const salesBarChartData = {
    labels: Object.keys(salesByPackage), // Package names dynamically from data
    datasets: [
      {
        data: Object.values(salesByPackage), // Corresponding sales for each package
      },
    ],
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading Booking Data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error fetching data: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerText}>Reports</Text>
        <View style={styles.greetingContainer}>
          <Text style={styles.welcomeText}>Your Booking Reports</Text>
          <Text style={styles.subText}>View your completed and package-based statistics.</Text>
        </View>
      </View>

      {/* Sales and Most Sale Package Cards */}
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Sales</Text>
          <Text style={styles.cardValue}>₱{totalSales.toLocaleString()}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Most Sale Package</Text>
          <Text style={styles.cardValue}>{mostSalePackage}</Text>
        </View>
      </View>

      {/* Pie Chart for Completed Bookings by Month */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Completed Bookings by Month</Text>
        {pieChartData.length > 0 ? (
          <PieChart
            data={pieChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <Text>No completed bookings data available.</Text>
        )}
      </View>

      {/* Bar Chart for Bookings by Package */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Bookings by Package</Text>
        {Object.keys(bookingsByPackage).length > 0 ? (
          <BarChart
            data={bookingsBarChartData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#1cc910',
              backgroundGradientFrom: '#eff3ff',
              backgroundGradientTo: '#efefef',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              paddingRight: 50, // Increase padding for label visibility
            }}
            verticalLabelRotation={15} // Reduce rotation angle for better readability
            fromZero // Ensure the chart starts from zero
          />
        ) : (
          <Text>No package data available.</Text>
        )}
      </View>

      {/* Bar Chart for Sales by Package */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Sales by Package</Text>
        {Object.keys(salesByPackage).length > 0 ? (
          <BarChart
            data={salesBarChartData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel="₱"
            chartConfig={{
              backgroundColor: '#1cc910',
              backgroundGradientFrom: '#eff3ff',
              backgroundGradientTo: '#efefef',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              paddingRight: 50, // Increase padding for label visibility
            }}
            verticalLabelRotation={15} // Reduce rotation angle for better readability
            fromZero // Ensure the chart starts from zero
          />
        ) : (
          <Text>No sales data available.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: 'white',
    paddingBottom: 20,
  },
  loaderContainer: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  headerSection: {
    marginBottom: 20,
  },
  headerText: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
  },
  greetingContainer: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
  },
  subText: {
    fontSize: 16,
    color: 'black',
    marginTop: 5,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  cardValue: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  chartContainer: {
    marginTop: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default ReportsScreen;