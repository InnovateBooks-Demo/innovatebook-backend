import api from "./api";

export const authService = {
  async register(userData) {
    const response = await api.post(`/api/auth/register`, userData);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(credentials) {
    try {
      const standardUrl = `${api.defaults.baseURL}/api/auth/login`;
      console.log(`[Auth] Attempting standard login to: ${standardUrl}`);

      const response = await api.post(`/api/auth/login`, credentials);
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.log(`[Auth] Login error status: ${error.response?.status}`);

      // Fallback condition: ANY 401 Unauthorized
      if (error.response?.status === 401) {
        const enterpriseUrl = `${api.defaults.baseURL}/api/enterprise/auth/login`;
        console.log(`[Auth] 401 detected. Entering fallback. Attempting enterprise login to: ${enterpriseUrl}`);

        try {
          const entResponse = await api.post(`/api/enterprise/auth/login`, credentials);
          console.log(`[Auth] Enterprise login status: ${entResponse.status}`);

          if (entResponse.data.access_token) {
            localStorage.setItem('access_token', entResponse.data.access_token);
            localStorage.setItem('user', JSON.stringify(entResponse.data.user));
          }
          return entResponse.data;
        } catch (entError) {
          console.log(`[Auth] Enterprise login failed with status: ${entError.response?.status}`);
          throw entError;
        }
      }
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('access_token') || localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

export const getAuthHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
