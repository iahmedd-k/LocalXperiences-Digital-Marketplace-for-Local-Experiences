import { MOCK_EXPERIENCES, MOCK_USER, MOCK_BOOKINGS, MOCK_ITINERARIES } from '../data/mockData.js';

// Create a mock API object instead of an Axios instance
const api = {
  get: async (url) => {
    console.log('[Mock API GET]', url);
    if (url.includes('/experiences/featured')) {
      return { data: { data: MOCK_EXPERIENCES.slice(0, 3) } };
    }
    if (url.includes('/experiences/host/my-listings')) {
      return { data: { data: MOCK_EXPERIENCES } };
    }
    if (url.includes('/experiences/')) {
      const id = url.split('/').pop();
      // Handle the case where id might be 'exp1', 'exp2' etc.
      const exp = MOCK_EXPERIENCES.find(e => e._id === id) || MOCK_EXPERIENCES[0];
      return { data: { data: exp } };
    }
    if (url.includes('/experiences')) {
      return { data: { data: { experiences: MOCK_EXPERIENCES, totalPages: 1, currentPage: 1 } } };
    }
    if (url.includes('/auth/me')) {
      return { data: { data: MOCK_USER } };
    }
    if (url.includes('/bookings/')) {
      const id = url.split('/').pop();
      return { data: { data: { _id: id, experienceId: MOCK_EXPERIENCES[0], amount: 120 * 100, status: 'confirmed', slot: { date: new Date().toISOString() }, guestCount: 2 } } };
    }
    if (url.includes('/bookings')) {
      return { data: { data: MOCK_BOOKINGS } };
    }
    if (url.includes('/itineraries')) {
      return { data: { data: MOCK_ITINERARIES } };
    }
    return { data: { data: [] } };
  },
  post: async (url, data) => {
    console.log('[Mock API POST]', url, data);
    if (url.includes('/auth/login') || url.includes('/auth/signup')) {
      return { data: { user: MOCK_USER, token: 'demo-token-xyz' } };
    }
    if (url.includes('/create-payment-intent')) {
      return { data: { data: { clientSecret: 'pi_demo_secret', paymentIntentId: 'pi_demo_id' } } };
    }
    if (url.includes('/bookings')) {
      return { data: { data: { _id: 'demo-booking-idx' } } };
    }
    return { data: { success: true, data: { _id: 'new-id-' + Date.now() } } };
  },
  put: async (url, data) => {
    console.log('[Mock API PUT]', url, data);
    return { data: { success: true } };
  },
  delete: async (url) => {
    console.log('[Mock API DELETE]', url);
    return { data: { success: true } };
  }
};

export default api;