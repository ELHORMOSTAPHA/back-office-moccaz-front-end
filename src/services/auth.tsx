// ============================================
  // LOGIN FUNCTION

import api from "./api";

  // ============================================
  export const login = async ({ email, password }: { email: string; password: string }) => {
      // Initialize CSRF cookie before login
      console.log('login')
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      // if (!response.data.success) {
      //   throw new Error(response.data.message || "Login failed");
      // }
      console.log('Login response:', response.data);
      if(response.data.success ){ 
      // Set user in state
      api.saveTokens(response.data.data.access_token, response.data.data.refresh_token);
      return response.data.data;
      }else{
        throw new Error("vous n'avez pas la permission d'accéder à cette application");
      }
  };
  export const logout = () => {
      api.clearTokens();
  }
 