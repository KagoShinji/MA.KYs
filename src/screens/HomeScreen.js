import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import moment from 'moment-timezone';
import { db } from '../firebaseConfig';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';

const HomeScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [bookingsForDate, setBookingsForDate] = useState([]);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [confirmedBookings, setConfirmedBookings] = useState(0);
  const [cancelledBookings, setCancelledBookings] = useState(0);
  const [totalSales, setTotalSales] = useState(0); // New state for total sales
  const [recentBooking, setRecentBooking] = useState(null); // Recent booking
  const [filterType, setFilterType] = useState('morning');
  const [loading, setLoading] = useState(true);

  const PHILIPPINE_TIMEZONE = 'Asia/Manila';
  const currentDate = moment.tz(new Date(), PHILIPPINE_TIMEZONE).format('YYYY-MM-DD');
  const currentMonth = moment.tz(new Date(), PHILIPPINE_TIMEZONE).format('YYYY-MM'); // Current month for filtering

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);

        // Fetch Pending Bookings
        const bookingsRef = ref(db, 'bookings');
        onValue(bookingsRef, (snapshot) => {
          const bookings = snapshot.val();
          const pendingCount = bookings ? Object.keys(bookings).length : 0;
          setPendingBookings(pendingCount);

        // Sort by `date_time` using moment.js
        const recent = bookings 
          ? Object.values(bookings).sort((a, b) => {
              // Parse `date_time` field using moment with custom format
              const dateA = moment(a.date_time, 'MMMM D, YYYY [at] hh:mm A');
              const dateB = moment(b.date_time, 'MMMM D, YYYY [at] hh:mm A');
              return dateB.diff(dateA); // Sort in descending order
            })[0] 
          : null;
        setRecentBooking(recent);
      });

        // Fetch Confirmed Bookings and Total Sales
        const historyRef = ref(db, 'history');
        const confirmedQuery = query(historyRef, orderByChild('status'), equalTo('confirmed'));
        onValue(confirmedQuery, (snapshot) => {
          const confirmedBookingsList = snapshot.val();
          const confirmedCount = confirmedBookingsList ? Object.keys(confirmedBookingsList).length : 0;
          setConfirmedBookings(confirmedCount);

          // Calculate total sales for the current month
          let sales = 0;
          if (confirmedBookingsList) {
            Object.values(confirmedBookingsList).forEach((booking) => {
              if (booking.date.startsWith(currentMonth)) {
                sales += extractPriceFromPackage(booking.package); // Assuming package has price
              }
            });
          }
          setTotalSales(sales);
        });

        // Fetch Cancelled Bookings
        const cancelledQuery = query(historyRef, orderByChild('status'), equalTo('canceled'));
        onValue(cancelledQuery, (snapshot) => {
          const cancelledBookingsList = snapshot.val();
          const cancelledCount = cancelledBookingsList ? Object.keys(cancelledBookingsList).length : 0;
          setCancelledBookings(cancelledCount);
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings data: ", error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentMonth]);


  const fetchBookingsForDate = (date) => {
    const historyRef = ref(db, 'history');
    const dateQuery = query(historyRef, orderByChild('date'), equalTo(date));

    onValue(dateQuery, (snapshot) => {
      const bookings = snapshot.val();
      const bookingsArray = bookings ? Object.values(bookings) : [];
      setBookingsForDate(bookingsArray);
      if (bookingsArray.some(booking => booking.time.includes('AM'))) {
        setFilterType('morning');
      } else {
        setFilterType('afternoon');
      }
      setModalVisible(true); // Open modal after fetching bookings
    });
  };

  const toggleImageModal = (url) => {
    setImageUrl(url);
    setImageModalVisible(true);
  };

  const filterBookings = (bookings) => {
    return bookings.filter((booking) => {
      const timeRange = booking.time || '';
      if (filterType === 'morning') {
        return timeRange.includes('AM');
      } else {
        return timeRange.includes('PM');
      }
    });
  };

  const renderBookings = () => {
    const filteredBookings = filterBookings(bookingsForDate);
    if (filteredBookings.length > 0) {
      return filteredBookings.map((booking, index) => (
        <View key={index} style={styles.bookingItem}>
          <Text style={styles.bookingText}>{`${booking.first_name} ${booking.last_name}`}</Text>
          <Text style={styles.bookingText}>Package: {booking.package}</Text>
          <Text style={styles.bookingText}>Date: {booking.date}</Text>
          <Text style={styles.bookingText}>Time: {booking.time}</Text>
          <Text style={styles.bookingText}>Email: {booking.email_address}</Text>
          <Text style={styles.bookingText}>Contact: {booking.contact_number}</Text>
          <Text style={styles.bookingText}>Payment Method: {booking.payment_method}</Text>

          <TouchableOpacity style={styles.viewButton} onPress={() => toggleImageModal(booking.id_image_url)}>
            <Text style={styles.viewButtonText}>View ID Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewButton} onPress={() => toggleImageModal(booking.receipt_url)}>
            <Text style={styles.viewButtonText}>View Receipt</Text>
          </TouchableOpacity>
        </View>
      ));
    } else {
      return <Text style={styles.emptyText}>No {filterType} bookings available for this date.</Text>;
    }
  };

  const extractPriceFromPackage = (packageName) => {
    const packagePrices = {
      'Package A': 3000,
      'Package B': 4000,
      'Package C': 5000,
    };
    return packagePrices[packageName] || 0;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.fixedHeader}>
        <Text style={styles.headerText}>Home</Text>
        <View style={styles.greetingContainer}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          <Text style={styles.subText}>What would you like to do today?</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Today's Date and Bookings Card */}
        <View style={styles.dateCardContainer}>
          <TouchableOpacity style={styles.dateCard} onPress={() => fetchBookingsForDate(currentDate)}>
            <Text style={styles.dateText}>{moment.tz(new Date(), PHILIPPINE_TIMEZONE).format('MMMM D, YYYY')}</Text>
            {loading ? (
              <Text style={styles.bookingTodayText}>Loading...</Text>
            ) : (
              <Text style={styles.bookingTodayText}>{`Bookings for today: ${bookingsForDate.length}`}</Text>
            )}
          </TouchableOpacity>
        </View>

      {/* Modal for Today's Bookings */}
      <Modal visible={modalVisible} transparent={true} animationType="none" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bookings for {moment(currentDate).format('MMMM D, YYYY')}</Text>

            {/* Filter buttons */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                onPress={() => setFilterType('morning')}
                style={[
                  styles.filterButton,
                  filterType === 'morning' && styles.activeFilterButton,
                ]}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterType === 'morning' && styles.activeFilterButtonText,
                ]}>
                  Morning
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterType('afternoon')}
                style={[
                  styles.filterButton,
                  filterType === 'afternoon' && styles.activeFilterButton,
                ]}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterType === 'afternoon' && styles.activeFilterButtonText,
                ]}>
                  Afternoon
                </Text>
              </TouchableOpacity>
            </View>

            {renderBookings()}

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

        {/* Booking Status Cards */}
<View style={styles.statusContainer}>
  <TouchableOpacity
    style={styles.statusCard}
    onPress={() => navigation.navigate('Booking')}
  >
    <Text style={styles.statusTitle}>Pending Bookings</Text>
    <Text style={styles.statusCount}>{pendingBookings}</Text>
  </TouchableOpacity>

  <TouchableOpacity
  style={styles.statusCard}
  onPress={() => navigation.navigate('History', { filterType: 'confirmed' })} // Pass filterType 'confirmed'
>
  <Text style={styles.statusTitle}>Confirmed Bookings</Text>
  <Text style={styles.statusCount}>{confirmedBookings}</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.statusCard}
  onPress={() => navigation.navigate('History', { filterType: 'canceled' })} // Pass filterType 'canceled'
>
  <Text style={styles.statusTitle}>Cancelled Bookings</Text>
  <Text style={styles.statusCount}>{cancelledBookings}</Text>
</TouchableOpacity>

</View>

        {/* Total Sales Card */}
        <TouchableOpacity 
  style={styles.salesCard} 
  onPress={() => navigation.navigate('Reports')} // Navigate to Reports screen when pressed
>
  <Text style={styles.salesCardTitle}>Total Sales for {moment(currentDate).format('MMMM YYYY')}</Text>
  <Text style={styles.salesCardAmount}>₱ {totalSales.toLocaleString()}</Text>
</TouchableOpacity>


        {/* Recent Booking Card */}
        {recentBooking && (
  <TouchableOpacity 
    style={styles.recentBookingCard} 
    onPress={() => navigation.navigate('Booking', { bookingId: recentBooking.id })} // Navigate to BookingScreen with bookingId
  >
    <Text style={styles.recentBookingTitle}>Recent Booking</Text>
    <View style={styles.recentBookingContent}>
      <Text style={styles.recentBookingText}>Name: {recentBooking.first_name} {recentBooking.last_name}</Text>
      <Text style={styles.recentBookingText}>
        Date: {moment(recentBooking.date).format('MMMM D, YYYY')} {/* Format the date */}
      </Text>
      <Text style={styles.recentBookingText}>Package: {recentBooking.package}</Text>
    </View>
    <View style={styles.recentBadge}>
      <Text style={styles.badgeText}>Recent</Text>
    </View>
  </TouchableOpacity>
)}

      </View>

      {/* Image Modal */}
      <Modal transparent={true} visible={imageModalVisible} animationType="fade" onRequestClose={() => setImageModalVisible(false)}>
        <View style={styles.imageModalContainer}>
          <Image source={{ uri: imageUrl }} style={styles.modalImage} resizeMode="contain" />
          <TouchableOpacity style={styles.closeButton} onPress={() => setImageModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  fixedHeader: {
    width: '100%',
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 20,
    borderBottomColor: 'black',
    alignItems: 'flex-start',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'left',
  },
  greetingContainer: {
    alignItems: 'flex-start',
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'left',
  },
  subText: {
    fontSize: 16,
    color: 'black',
    marginTop: 5,
    textAlign: 'left',
  },
  contentContainer: {
    paddingTop: 150,
    paddingHorizontal: 20,
  },
  dateCardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dateCard: {
    width: '90%',
    padding: 20,
    backgroundColor: 'black',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  dateText: {
    fontSize: 25,
    color: '#FFF',
    fontWeight: 'bold',
  },
  bookingTodayText: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusCard: {
    flex: 1,
    padding: 5,
    margin: 5,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'black',
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: 'thin',
    color: 'black',
  },
  statusCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 5,
  },
  salesCard: {
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
  },
  salesCardTitle: {
    fontSize: 20,
    color: '#FFF',
    marginBottom: 10,
  },
  salesCardAmount: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
  },
  recentBookingCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,    // Stroke width
    borderColor: 'black',  // Stroke color
    minHeight: 90,    // Make it compact
  },  
  recentBookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  recentBookingContent: {
    flexDirection: 'column',
  },
  recentBookingText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 5,
  },
  recentBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'green',
    borderRadius: 20,
    padding: 5,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#ccc',
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#000',
  },
  filterButtonText: {
    color: '#000',
    fontSize: 16,
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  bookingItem: {
    marginBottom: 15,
  },
  bookingText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#000',
  },
  viewButton: {
    backgroundColor: '#000',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginVertical: 5,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  modalCloseButton: {
    padding: 10,
    backgroundColor: '#f44336',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalImage: {
    width: '90%',
    height: '90%',
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#f44336',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noBookingText: {
    fontSize: 16,
    color: '#777', // Grey text color for the fallback
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default HomeScreen;