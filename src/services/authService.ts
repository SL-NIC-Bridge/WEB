// Mock Authentication Service
import { LoginRequest, LoginResponse, User } from '@/types';
import { mockUsers } from './mockData';

class AuthService {
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Simulate API delay
    await this.delay(1000);

    const user = mockUsers.find(u => 
      u.email === credentials.email
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // For GN users, check approval status
    if (user.role === 'GN' && user.currentStatus !== 'ACTIVE') {
      if (user.currentStatus === 'PENDING_APPROVAL') {
        throw new Error('Account pending DS approval');
      } else if (user.currentStatus === 'REJECTED') {
        throw new Error('Registration was rejected');
      }
    }

    // In a real app, verify password hash here
    // For demo, accept any password for existing users

    // Generate mock tokens
    const accessToken = `mock-access-token-${user.id}-${Date.now()}`;
    const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;

    return {
      accessToken,
      refreshToken,
      user: { ...user }
    };
  }

  async getCurrentUser(): Promise<User> {
    // Simulate API delay
    await this.delay(500);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }

    // Extract user ID from mock token (in real app, decode JWT)
    const userId = token.split('-')[3];
    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    return { ...user };
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    // Simulate API delay
    await this.delay(500);

    // Extract user ID from mock token
    const userId = refreshToken.split('-')[4];
    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const accessToken = `mock-access-token-${user.id}-${Date.now()}`;
    const newRefreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: { ...user }
    };
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export const authService = new AuthService();