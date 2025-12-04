/**
 * API Service Layer for BatStateU Parking System
 * 
 * This file handles all HTTP requests to the backend API.
 * It manages authentication tokens and provides typed interfaces.
 * 
 * Usage:
 * 1. Configure API_BASE_URL to point to your backend
 * 2. Import and use the API methods in your components
 * 
 * Example:
 * import { parkingAPI } from './services/api';
 * const slots = await parkingAPI.getParkingSlots();
 */

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user';
  };
}

export interface ParkingSlotResponse {
  id: number;
  slotNumber: number;
  isOccupied: boolean;
  vehicle?: {
    plateNumber: string;
    vehicleType: 'car' | 'motorcycle' | 'suv' | 'truck';
    checkInTime: string;
  };
}

export interface CheckInRequest {
  plateNumber: string;
  vehicleType: 'car' | 'motorcycle' | 'suv' | 'truck';
}

export interface TransactionResponse {
  id: string;
  plateNumber: string;
  vehicleType: string;
  slotId: number;
  checkInTime: string;
  checkOutTime: string;
  duration: number;
  cost: number;
}

export interface ReservationRequest {
  username: string;
  plateNumber: string;
  vehicleType: 'car' | 'motorcycle' | 'suv' | 'truck';
  slotId: number;
  date: string;
}

export interface ReservationResponse {
  id: string;
  username: string;
  plateNumber: string;
  vehicleType: string;
  slotId: number;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

// Token Management
class TokenManager {
  private static TOKEN_KEY = 'parking_auth_token';

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static hasToken(): boolean {
    return !!this.getToken();
  }
}

// HTTP Client
class HTTPClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = TokenManager.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token && !endpoint.includes('/auth/')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          TokenManager.removeToken();
          window.location.href = '/login';
        }
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// API Service
class ParkingAPI {
  private client: HTTPClient;

  constructor(baseURL: string) {
    this.client = new HTTPClient(baseURL);
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>(
      '/auth/login',
      credentials
    );
    TokenManager.setToken(response.access_token);
    return response;
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<{ message: string }> {
    return this.client.post('/auth/register', data);
  }

  logout(): void {
    TokenManager.removeToken();
  }

  isAuthenticated(): boolean {
    return TokenManager.hasToken();
  }

  // Parking Slots
  async getParkingSlots(): Promise<ParkingSlotResponse[]> {
    return this.client.get('/parking-slots');
  }

  async checkInVehicle(
    slotId: number,
    data: CheckInRequest
  ): Promise<{ message: string }> {
    return this.client.post(`/parking-slots/${slotId}/check-in`, data);
  }

  async checkOutVehicle(
    slotId: number
  ): Promise<{ message: string; transaction: any }> {
    return this.client.post(`/parking-slots/${slotId}/check-out`);
  }

  // Pricing
  async getPricingRates(): Promise<any[]> {
    return this.client.get('/pricing');
  }

  async updatePricingRate(
    rateId: number,
    hourlyRate: number
  ): Promise<{ message: string }> {
    return this.client.put(`/pricing/${rateId}`, { hourlyRate });
  }

  // Transactions
  async getTransactions(): Promise<TransactionResponse[]> {
    return this.client.get('/transactions');
  }

  // Reservations
  async getReservations(): Promise<ReservationResponse[]> {
    return this.client.get('/reservations');
  }

  async createReservation(
    data: ReservationRequest
  ): Promise<{ message: string }> {
    return this.client.post('/reservations', data);
  }

  async updateReservation(
    reservationId: number,
    status: string
  ): Promise<{ message: string }> {
    return this.client.put(`/reservations/${reservationId}`, { status });
  }

  // Users (Admin only)
  async getUsers(): Promise<any[]> {
    return this.client.get('/users');
  }

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    role: string;
  }): Promise<{ message: string }> {
    return this.client.post('/auth/register', data);
  }

  async updateUserStatus(
    userId: number,
    status: string
  ): Promise<{ message: string }> {
    return this.client.put(`/users/${userId}`, { status });
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    return this.client.delete(`/users/${userId}`);
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    // This would be a custom endpoint for analytics data
    return this.client.get('/analytics');
  }
}

// Export singleton instance
export const parkingAPI = new ParkingAPI(API_BASE_URL);

// Export token manager for auth checks
export { TokenManager };

// Export types
export type { HTTPClient };

/**
 * Usage Examples:
 * 
 * // Login
 * const loginData = await parkingAPI.login({ username: 'admin', password: 'admin123' });
 * 
 * // Get parking slots
 * const slots = await parkingAPI.getParkingSlots();
 * 
 * // Check in vehicle
 * await parkingAPI.checkInVehicle(1, {
 *   plateNumber: 'ABC1234',
 *   vehicleType: 'car'
 * });
 * 
 * // Check out vehicle
 * const result = await parkingAPI.checkOutVehicle(1);
 * 
 * // Get transactions
 * const transactions = await parkingAPI.getTransactions();
 * 
 * // Create reservation
 * await parkingAPI.createReservation({
 *   username: 'user1',
 *   plateNumber: 'XYZ5678',
 *   vehicleType: 'motorcycle',
 *   slotId: 5,
 *   date: '2024-12-15T10:00:00'
 * });
 * 
 * // Check if authenticated
 * if (parkingAPI.isAuthenticated()) {
 *   // User is logged in
 * }
 * 
 * // Logout
 * parkingAPI.logout();
 */
