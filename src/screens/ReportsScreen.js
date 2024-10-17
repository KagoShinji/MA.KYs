import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const ReportsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedBookingsByMonth, setCompletedBookingsByMonth] = useState({});
  const [bookingsByPackage, setBookingsByPackage] = useState({});
  const [salesByPackage, setSalesByPackage] = useState({});
  const [totalSales, setTotalSales] = useState(0);
  const [mostSalePackage, setMostSalePackage] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');

  const packagePrices = {
    'Package A': 3000,
    'Package B': 4000,
    'Package C': 5000,
    'Package D': 6000,
  };

  const monthsList = [
    'All',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  useEffect(() => {
    const fetchBookingData = () => {
      const historyRef = ref(db, 'history');
      onValue(
        historyRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const formattedData = Object.values(data);
            processBookingData(formattedData);
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

    // Loop through each booking in the data
    data.forEach((booking) => {
      const bookingDate = new Date(booking.date);
      const month = bookingDate.toLocaleString('default', { month: 'long' });

      // Only consider completed bookings (confirmed)
      if (booking.status === 'confirmed') {
        if (!bookingsByMonth[month]) {
          bookingsByMonth[month] = [];
        }
        bookingsByMonth[month].push(booking);

        const packageName = booking.package || 'Unknown';
        const packagePrice = packagePrices[packageName] || 0;

        if (!bookingsByPackageCount[packageName]) {
          bookingsByPackageCount[packageName] = 1;
        } else {
          bookingsByPackageCount[packageName]++;
        }

        if (!salesByPackageCount[packageName]) {
          salesByPackageCount[packageName] = packagePrice;
        } else {
          salesByPackageCount[packageName] += packagePrice;
        }

        totalSalesValue += packagePrice;

        if (salesByPackageCount[packageName] > maxSalesValue) {
          maxSalesValue = salesByPackageCount[packageName];
          maxSalesPackage = packageName;
        }
      }
    });

    setCompletedBookingsByMonth(bookingsByMonth);
    setBookingsByPackage(bookingsByPackageCount);
    setSalesByPackage(salesByPackageCount);
    setTotalSales(totalSalesValue);
    setMostSalePackage(maxSalesPackage);
    setLoading(false);
  };

  const filterDataByMonth = () => {
    if (selectedMonth === 'All') {
      return {
        bookingsByPackage,
        salesByPackage,
        totalSales,
      };
    }

    const filteredBookingsByPackage = {};
    const filteredSalesByPackage = {};
    let filteredTotalSales = 0;

    const bookingsInMonth = completedBookingsByMonth[selectedMonth] || [];

    bookingsInMonth.forEach((booking) => {
      const packageName = booking.package || 'Unknown';
      const packagePrice = packagePrices[packageName] || 0;

      if (!filteredBookingsByPackage[packageName]) {
        filteredBookingsByPackage[packageName] = 1;
      } else {
        filteredBookingsByPackage[packageName]++;
      }

      if (!filteredSalesByPackage[packageName]) {
        filteredSalesByPackage[packageName] = packagePrice;
      } else {
        filteredSalesByPackage[packageName] += packagePrice;
      }

      filteredTotalSales += packagePrice;
    });

    return {
      bookingsByPackage: filteredBookingsByPackage,
      salesByPackage: filteredSalesByPackage,
      totalSales: filteredTotalSales, // Updated total sales for the selected month
    };
  };

  const { bookingsByPackage: filteredBookingsByPackage, salesByPackage: filteredSalesByPackage, totalSales: filteredTotalSales } = filterDataByMonth();

  const bookingsBarChartData = {
    labels: Object.keys(filteredBookingsByPackage),
    datasets: [
      {
        data: Object.values(filteredBookingsByPackage),
      },
    ],
  };

  const salesBarChartData = {
    labels: Object.keys(filteredSalesByPackage),
    datasets: [
      {
        data: Object.values(filteredSalesByPackage),
      },
    ],
  };

  const dynamicWidthForBars = (dataLength) => {
    const barWidth = 50;
    const minWidth = screenWidth - 40;
    return Math.max(barWidth * dataLength, minWidth);
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
      <View style={styles.headerSection}>
        <Text style={styles.headerText}>Reports</Text>
        <View style={styles.greetingContainer}>
          <Text style={styles.welcomeText}>Your Booking Reports</Text>
          <Text style={styles.subText}>View your completed and package-based statistics.</Text>
        </View>
      </View>

      {/* Month Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Filter by Month:</Text>
        <Picker
          selectedValue={selectedMonth}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedMonth(itemValue)}
        >
          {monthsList.map((month) => (
            <Picker.Item key={month} label={month} value={month} />
          ))}
        </Picker>
      </View>

      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Total Sales {selectedMonth !== 'All' ? `for ${selectedMonth}` : ''}
          </Text>
          <Text style={styles.cardValue}>₱{filteredTotalSales.toLocaleString()}</Text>
        </View>
      </View>

      {/* Bar Chart for Bookings by Package */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>
          Bookings by Package {selectedMonth !== 'All' ? `for ${selectedMonth}` : ''}
        </Text>
        <ScrollView horizontal>
          <BarChart
            data={bookingsBarChartData}
            width={dynamicWidthForBars(Object.keys(filteredBookingsByPackage).length)}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: 'white',
              backgroundGradientFrom: 'white',
              backgroundGradientTo: 'white',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            verticalLabelRotation={15}
            fromZero
          />
        </ScrollView>
      </View>

      {/* Bar Chart for Sales by Package */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>
          Sales by Package {selectedMonth !== 'All' ? `for ${selectedMonth}` : ''}
        </Text>
        <ScrollView horizontal>
          <BarChart
            data={salesBarChartData}
            width={dynamicWidthForBars(Object.keys(filteredSalesByPackage).length)}
            height={220}
            yAxisLabel="₱"
            chartConfig={{
              backgroundColor: 'white',
              backgroundGradientFrom: 'white',
              backgroundGradientTo: 'white',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            verticalLabelRotation={15}
            fromZero
          />
        </ScrollView>
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
  pickerContainer: {
    marginVertical: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    height: 50,
    width: screenWidth - 40,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'black',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'black',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default ReportsScreen;