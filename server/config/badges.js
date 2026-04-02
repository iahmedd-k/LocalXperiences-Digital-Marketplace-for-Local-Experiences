module.exports = [
  {
    id: 'first-booking',
    label: 'First Booking',
    icon: 'ticket',
    condition: { event: 'booking_completed', count: 1 },
  },
  {
    id: 'first-checkin',
    label: 'Checked In',
    icon: 'map-pin',
    condition: { event: 'check_in', count: 1 },
  },
  {
    id: 'food-lover',
    label: 'Food Lover',
    icon: 'utensils',
    condition: { category: 'food', count: 5 },
  },
];
