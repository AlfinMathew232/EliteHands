const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add CSRF token if available
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'include', // Include cookies for session authentication
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.response = { data: errorData, status: response.status };
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health/');
  }

  // Authentication endpoints
  async register(userData) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout/', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/auth/profile/');
  }

  async updateProfile(userData) {
    return this.request('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Service endpoints
  async getServiceCategories() {
    return this.request('/services/categories/');
  }

  async getServices(categoryId = null) {
    const params = categoryId ? `?category=${categoryId}` : '';
    return this.request(`/services/${params}`);
  }

  async getServiceDetail(serviceId) {
    return this.request(`/services/${serviceId}/`);
  }

  // Booking endpoints
  async getBookings() {
    return this.request('/bookings/');
  }

  async createBooking(bookingData) {
    return this.request('/bookings/', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBookingDetail(bookingId) {
    return this.request(`/bookings/${bookingId}/`);
  }

  async updateBooking(bookingId, bookingData) {
    return this.request(`/bookings/${bookingId}/`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  }

  async deleteBooking(bookingId) {
    return this.request(`/bookings/${bookingId}/`, {
      method: 'DELETE',
    });
  }

  // Review endpoints
  async getReviews() {
    return this.request('/reviews/');
  }

  async createReview(reviewData) {
    return this.request('/reviews/', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Notification endpoints
  async getNotifications() {
    return this.request('/notifications/');
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/mark-read/`, {
      method: 'POST',
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 