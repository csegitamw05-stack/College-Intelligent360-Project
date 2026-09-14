import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,   // Required: sends HttpOnly refresh cookie on every request
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token (this relies on the HttpOnly cookie being sent automatically)
        const res = await apiClient.post('/auth/refresh');
        
        if (res.status === 200) {
          const { access_token } = res.data;
          
          import('js-cookie').then((Cookies) => {
             Cookies.default.set('access_token', access_token);
          });
          
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, we should redirect to login
        import('js-cookie').then((Cookies) => {
           Cookies.default.remove('access_token');
        });
        delete apiClient.defaults.headers.common['Authorization'];
        
        // Use window location for hard redirect if in browser
        if (typeof window !== 'undefined') {
           window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
