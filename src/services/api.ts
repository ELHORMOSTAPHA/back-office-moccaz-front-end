
// ============================================
// services/api.ts
// ============================================
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Type for Laravel paginated responses
export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number
  to: number
}

class ApiService {
    public api: AxiosInstance;
    private isRefreshing: boolean = false;
    private refreshSubscribers: ((token: string) => void)[] = [];
    public onTokenExpired: (() => void) | null = null;

    constructor() {
        // Create axios instance with base configuration
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Accept': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    // ============================================
    // TOKEN MANAGEMENT
    // ============================================

    private getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    }

    private getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    private setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    }

    public  clearTokens(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    // ============================================
    // REFRESH TOKEN QUEUE MANAGEMENT
    // ============================================

    private subscribeTokenRefresh(callback: (token: string) => void): void {
        this.refreshSubscribers.push(callback);
    }

    private onTokenRefreshed(token: string): void {
        this.refreshSubscribers.forEach(callback => callback(token));
        this.refreshSubscribers = [];
    }

    // ============================================
    // REFRESH TOKEN LOGIC
    // ============================================

    private async refreshAccessToken(): Promise<string | null> {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            console.log('No refresh token available');
            return null;
        }

        try {
            console.log('Refreshing access token...');
            const response = await axios.post(`${API_URL}/auth/refresh`, {
                refresh_token: refreshToken,
            });

            if (response.data.success && response.data.access_token) {
                const { access_token, refresh_token } = response.data;

                // Store new tokens
                this.setTokens(access_token, refresh_token);

                console.log('Access token refreshed successfully');
                return access_token;
            }

            return null;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearTokens();
            return null;
        }
    }

    // ============================================
    // INTERCEPTORS SETUP
    // ============================================

    private setupInterceptors(): void {
        // REQUEST INTERCEPTOR - Add access token to headers and handle FormData
        this.api.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = this.getAccessToken();

                // Add token to Authorization header if available
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Handle FormData - don't set Content-Type to allow axios to set multipart/form-data
                if (config.data instanceof FormData) {
                    delete config.headers['Content-Type'];
                } else if (!config.headers['Content-Type'] && config.data) {
                    // Set default JSON content-type only for non-FormData requests
                    config.headers['Content-Type'] = 'application/json';
                }
                
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // RESPONSE INTERCEPTOR - Handle 401 errors and token refresh
        this.api.interceptors.response.use(
            (response) => {
                // If response is successful, just return it
                return response;
            },
            async (error) => {
                const originalRequest = error.config;

                // Check if error is 401 and not already retried
                if (
                    error.response?.status === 401 &&
                    !originalRequest._retry &&
                    !originalRequest.url.includes('/auth/login') &&
                    !originalRequest.url.includes('/auth/refresh') &&
                    !originalRequest.url.includes('/auth/register')
                ) {
                    console.log('Received 401 - Token may be expired');

                    // If already refreshing, queue this request
                    if (this.isRefreshing) {
                        console.log('Already refreshing, queuing request...');
                        return new Promise((resolve) => {
                            this.subscribeTokenRefresh((token: string) => {
                                if (originalRequest.headers) {
                                    originalRequest.headers.Authorization = `Bearer ${token}`;
                                }
                                resolve(this.api(originalRequest));
                            });
                        });
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        // Attempt to refresh the token
                        const newAccessToken = await this.refreshAccessToken();

                        if (newAccessToken) {
                            // Update the original request with new token
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                            }

                            // Notify all queued requests
                            this.onTokenRefreshed(newAccessToken);

                            // Retry the original request
                            return this.api(originalRequest);
                        } else {
                            // Refresh failed, trigger logout
                            if (this.onTokenExpired) {
                                this.onTokenExpired();
                            }
                            return Promise.reject(error);
                        }
                    } catch (refreshError) {
                        console.error('Token refresh error:', refreshError);

                        // Clear tokens and trigger logout
                        this.clearTokens();
                        if (this.onTokenExpired) {
                            this.onTokenExpired();
                        }

                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                // For other errors or if refresh failed, reject
                return Promise.reject(error);
            }
        );
    }

    // ============================================
    // TOKEN EXPIRED CALLBACK
    // ============================================

    setTokenExpiredCallback(callback: () => void): void {
        this.onTokenExpired = callback;
    }

    // ============================================
    // PUBLIC TOKEN METHODS
    // ============================================

    public saveTokens(accessToken: string, refreshToken: string): void {
        this.setTokens(accessToken, refreshToken);
    }

    public removeTokens(): void {
        this.clearTokens();
    }

    public hasTokens(): boolean {
        return !!(this.getAccessToken() && this.getRefreshToken());
    }

    // ============================================
    // HTTP METHOD WRAPPERS
    // ============================================

    get<T = any>(url: string, config = {}) {
        return this.api.get<T>(url, config);
    }

    post<T = any>(url: string, data?: any, config = {}) {
        return this.api.post<T>(url, data, config);
    }

    put<T = any>(url: string, data?: any, config = {}) {
        return this.api.put<T>(url, data, config);
    }

    patch<T = any>(url: string, data?: any, config = {}) {
        return this.api.patch<T>(url, data, config);
    }

    delete<T = any>(url: string, config = {}) {
        return this.api.delete<T>(url, config);
    }
}

// Export a single instance (singleton pattern)
export default new ApiService();
