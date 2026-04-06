// ============================================
// providers/AuthProvider.tsx
// ============================================
import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import api from "../services/api";

interface User {
  id: string | number;
  name: string;
  email: string;
  nom: string;
  prenom: string;
  profile: {
    id: number;
    nom: string;
  };
  roles?: string[] | string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  client?: {
    id: number;
    nom: string;
    prenom: string;
    raison_sociale?: string;
    email: string;
    telephone: string;
    type_client: "particulier" | "societe";
  };
  chauffeur?: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

//fake user
const user_fake: User = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  nom: "Doe",
  prenom: "John",
  profile: {
    id: 1,
    nom: "Admin",
  },
};
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(user_fake);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ============================================
  // INITIALIZATION
  // ============================================
  useEffect(() => {
      // Set token expired callback
      api.setTokenExpiredCallback(() => {
          handleTokenExpiration();
      });

      // Check if user is already authenticated on app load
      checkAuth();
      // Only run on mount, don't add location as dependency
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // CHECK AUTHENTICATION STATUS
  // ============================================
  const checkAuth = async () => {
    try {
      console.log("Checking authentication...");

      // Check if tokens exist in localStorage
      if (!api.hasTokens()) {
        console.log("No tokens found");
        setUser(null);
        setLoading(false);

        // Redirect to login if on protected route
        if (
          !location.pathname.startsWith("/login") &&
          !location.pathname.startsWith("/register")
        ) {
          navigate("/login");
        }
        return;
      }

      // Fetch user details using access token
      const response = await api.get("/auth/user");

      if (response.data.success && response.data.user) {
        const userData = response.data.user;

        console.log("User authenticated:", userData);
        setUser(userData);
      } else {
        console.log("Failed to fetch user details");
        setUser(null);
        api.removeTokens();

        if (
          !location.pathname.startsWith("/login") &&
          !location.pathname.startsWith("/register")
        ) {
          navigate("/login");
        }
      }
    } catch (error: any) {
      console.log("Authentication check failed:", error);
      setUser(null);
      api.removeTokens();

      // Redirect to login if on protected route
      if (
        !location.pathname.startsWith("/login") &&
        !location.pathname.startsWith("/register")
      ) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HANDLE TOKEN EXPIRATION
  // ============================================
  const handleTokenExpiration = () => {
    console.log("Tokens expired, logging out...");
    setUser(null);
    api.removeTokens();
    navigate("/login");
  };
  // ============================================
  // LOGOUT FUNCTION
  // ============================================
  const logout = () => {
    // Clear user state and tokens
    console.log("clear user data");
    setUser(null);
    api.removeTokens();
    // Redirect to login page
    navigate("/login");
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value: AuthContextType = {
    user,
    loading,
    setUser,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================
// CUSTOM HOOK
// ============================================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
