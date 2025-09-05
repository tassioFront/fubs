import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { User, UserByEmail } from '../types/index.js';
import { getInternalApiToken } from '../utils/getToken.js';

@Injectable()
export class UsersServiceClient {
  private readonly logger = new Logger(UsersServiceClient.name);
  private readonly httpClient: AxiosInstance;
  private readonly usersServiceUrl: string;

  constructor() {
    this.usersServiceUrl = process.env.USERS_SERVICE_URL as string;
    this.httpClient = axios.create({
      baseURL: this.usersServiceUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
        return Promise.reject(
          error instanceof Error ? error : new Error(error)
        );
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
        return Promise.reject(
          error instanceof Error ? error : new Error(error)
        );
      }
    );
  }

  /**
   * Validates a JWT token with the users-service
   * This method sends the full JWT token to users-service for validation
   */
  async validateToken(token: string): Promise<User | null> {
    try {
      const response = await this.httpClient.get('/api/users/validate-token/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data) {
        return response.data as User;
      }

      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Token validation failed:', errorMessage);
      return null;
    }
  }

  async getUserById({
    userId,
    token,
  }: {
    userId: string;
    token: string;
  }): Promise<User | null> {
    try {
      const response = await this.httpClient.get(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data) {
        return response.data;
      }

      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to get user ${userId}:`, errorMessage);
      return null;
    }
  }

  async getUsersByIds({
    userIds,
    token,
  }: {
    userIds: string[];
    token: string;
  }): Promise<User[]> {
    try {
      const response = await this.httpClient.post(
        '/api/users/batch',
        {
          user_ids: userIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Failed to get users batch:', errorMessage);
      return [];
    }
  }

  async getUserByEmail({
    email,
  }: {
    email: string;
  }): Promise<UserByEmail | null> {
    try {
      const token = getInternalApiToken({ serviceName: 'sugarfoot' });
      const response = await this.httpClient.get<User>(
        `/api/users/internal/by-email/${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data) {
        return {
          ...response.data,
          role: response.data.type,
        };
      }

      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to get user by email ${email}:`, errorMessage);
      return null;
    }
  }
}
