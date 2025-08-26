import { create } from "zustand";
import AuthService from "../../services/auth/authService";
import { Company, User, UserRole } from "../../types/api/auth";

interface AuthState {
  // State
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName?: string;
    role: UserRole;
  }) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithMicrosoft: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;

  // MFA
  setupMFA: () => Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }>;
  verifyMFA: (code: string, type: "totp" | "backup") => Promise<void>;

  // Email verification
  resendVerificationEmail: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  company: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,

  // Initialize auth state from storage
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      const authData = await AuthService.initialize();

      if (authData) {
        set({
          user: authData.user,
          company: authData.company,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          company: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({
        error: "Failed to initialize authentication",
        isInitialized: true,
        isLoading: false,
      });
    }
  },

  // Login with email/password
  login: async (email: string, password: string, rememberMe = false) => {
    try {
      set({ isLoading: true, error: null });

      const response = await AuthService.login({ email, password, rememberMe });

      set({
        user: response.user,
        company: response.company,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await AuthService.register(userData);

      set({
        user: response.user,
        company: response.company,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Registration failed",
        isLoading: false,
      });
      throw error;
    }
  },

  // Google SSO login
  loginWithGoogle: async (idToken: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await AuthService.loginWithGoogle(idToken);

      set({
        user: response.user,
        company: response.company,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Google login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  // Microsoft SSO login
  loginWithMicrosoft: async (accessToken: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await AuthService.loginWithMicrosoft(accessToken);

      set({
        user: response.user,
        company: response.company,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Microsoft login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      set({ isLoading: true });

      await AuthService.logout();

      set({
        user: null,
        company: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      // Still clear state even if API call fails
      set({
        user: null,
        company: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // Password reset request
  requestPasswordReset: async (email: string) => {
    try {
      set({ isLoading: true, error: null });

      await AuthService.requestPasswordReset({ email });

      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Password reset request failed",
        isLoading: false,
      });
      throw error;
    }
  },

  // Confirm password reset
  confirmPasswordReset: async (token: string, newPassword: string) => {
    try {
      set({ isLoading: true, error: null });

      await AuthService.confirmPasswordReset({ token, newPassword });

      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Password reset failed",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update user data
  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...userData },
      });
    }
  },

  // MFA setup
  setupMFA: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await AuthService.setupMFA();

      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        error: error.message || "MFA setup failed",
        isLoading: false,
      });
      throw error;
    }
  },

  // MFA verification
  verifyMFA: async (code: string, type: "totp" | "backup") => {
    try {
      set({ isLoading: true, error: null });

      await AuthService.verifyMFA({ code, type });

      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "MFA verification failed",
        isLoading: false,
      });
      throw error;
    }
  },

  // Email verification
  resendVerificationEmail: async () => {
    try {
      set({ isLoading: true, error: null });

      await AuthService.resendVerificationEmail();

      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to resend verification email",
        isLoading: false,
      });
      throw error;
    }
  },

  verifyEmail: async (token: string) => {
    try {
      set({ isLoading: true, error: null });

      await AuthService.verifyEmail(token);

      // Update user as verified
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: { ...currentUser, isEmailVerified: true },
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || "Email verification failed",
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
