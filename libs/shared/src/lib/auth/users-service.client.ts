import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { User } from '../types/index.js';

/*
 * Those URLs must be created yet. It is an example of how to use
 */

@Injectable()
export class UsersServiceClient {
  private readonly logger = new Logger(UsersServiceClient.name);
  private readonly httpClient: AxiosInstance;
  private readonly usersServiceUrl: string;

  constructor() {
    this.usersServiceUrl = process.env.USERS_SERVICE_URL as string;

    this.httpClient = axios.create({
      baseURL: this.usersServiceUrl,
      timeout: 5000, // 5 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request/response interceptors for logging
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(
          `Making request to users-service: ${config.method?.toUpperCase()} ${
            config.url
          }`
        );
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error.message);
        return Promise.reject(error);
      }
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(
          `Users-service response: ${response.status} ${response.statusText}`
        );
        return response;
      },
      (error) => {
        this.logger.error(
          `Users-service error: ${error.response?.status} ${error.message}`
        );
        return Promise.reject(error);
      }
    );
  }

  /**
   * Validates a user exists and is active in the users-service
   * This is called during JWT token validation
   */
  async validateUser(userId: number): Promise<User | null> {
    try {
      const response = await this.httpClient.get(`/api/users/${userId}`);

      if (response.status === 200 && response.data) {
        return {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
        };
      }

      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to validate user ${userId}:`, errorMessage);
      return null;
    }
  }

  /**
   * Validates a JWT token with the users-service
   * Alternative approach: let users-service validate the entire token
   */
  async validateToken(token: string): Promise<User | null> {
    try {
      const response = await this.httpClient.post(
        '/api/auth/validate',
        { token },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.user) {
        return {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
        };
      }

      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Token validation failed:', errorMessage);
      return null;
    }
  }

  /**
   * Get user details by ID
   * Useful for getting user information for workspace members
   */
  async getUserById(userId: number): Promise<User | null> {
    try {
      const response = await this.httpClient.get(`/api/users/${userId}`);

      if (response.status === 200 && response.data) {
        return {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
        };
      }

      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to get user ${userId}:`, errorMessage);
      return null;
    }
  }

  /**
   * Get multiple users by IDs
   * Useful for getting workspace member details
   */
  async getUsersByIds(userIds: number[]): Promise<User[]> {
    try {
      const response = await this.httpClient.post('/api/users/batch', {
        user_ids: userIds,
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        return response.data.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
        }));
      }

      return [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Failed to get users batch:', errorMessage);
      return [];
    }
  }
}
