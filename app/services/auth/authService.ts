import {
  AuthResponse,
  Company,
  LoginRequest,
  MFASetupResponse,
  MFAVerifyRequest,
  PasswordResetConfirm,
  PasswordResetRequest,
  RegisterRequest,
  User,
} from "../../types/api/auth";
import { apiClient } from "../api/client";
import secureStorage from "../storage/secureStorage";

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Initialize auth state from storage
  async initialize(): Promise<{ user: User; company: Company } | null> {
    try {
      const { accessToken, refreshToken } = await secureStorage.getTokens();

      if (!accessToken || !refreshToken) {
        return null;
      }

      // Set token in API client
      apiClient.setAccessToken(accessToken);

      // Verify token is still valid
      try {
        const response = await apiClient.get<{
          user: User;
          company: Company;
        }>("/auth/me");
        return response;
      } catch (error) {
        // Token might be expired, try refreshing
        return await this.refreshTokens(refreshToken);
      }
    } catch (error) {
      console.error("Auth initialization failed: ", error);
      await this.clearAuth();
      return null;
    }
  }

  // Login with email and password
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/login",
        credentials
      );

      // Stire tokens securely
      await secureStorage.setTokens(
        response.accessToken,
        response.refreshToken
      );

      // Store user and company data
      await Promise.all([
        secureStorage.setItem("user_data", JSON.stringify(response.user)),
        secureStorage.setItem("company_data", JSON.stringify(response.company)),
      ]);

      // Set access token in API client
      apiClient.setAccessToken(response.accessToken);

      return response;
    } catch (error) {
      console.error("Login failed: ", error);
      throw error;
    }
  }

  // Register new user/company
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/register",
        userData
      );

      // Store tokens and data
      await secureStorage.setTokens(
        response.accessToken,
        response.refreshToken
      );
      await Promise.all([
        secureStorage.setItem("user_data", JSON.stringify(response.user)),
        secureStorage.setItem("company_data", JSON.stringify(response.company)),
      ]);

      apiClient.setAccessToken(response.accessToken);
      return response;
    } catch (error) {
      console.error("Registration failed: ", error);
      throw error;
    }
  }

  // Google SSO
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/google", {
        idToken,
      });

      await secureStorage.setTokens(
        response.accessToken,
        response.refreshToken
      );
      await Promise.all([
        secureStorage.setItem("user_data", JSON.stringify(response.user)),
        secureStorage.setItem("company_data", JSON.stringify(response.company)),
      ]);

      apiClient.setAccessToken(response.accessToken);
      return response;
    } catch (error) {
      console.error("Google login failed: ", error);
      throw error;
    }
  }

  // Microsoft SSO
  async loginWithMicrosoft(accessToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/microsoft", {
        accessToken,
      });

      await secureStorage.setTokens(
        response.accessToken,
        response.refreshToken
      );
      await Promise.all([
        secureStorage.setItem("user_data", JSON.stringify(response.user)),
        secureStorage.setItem("company_data", JSON.stringify(response.company)),
      ]);

      apiClient.setAccessToken(response.accessToken);
      return response;
    } catch (error) {
      console.error("Microsoft login failed: ", error);
      throw error;
    }
  }

  // Request password reset
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    try {
      await apiClient.post("/auth/password-reset/request", data);
    } catch (error) {
      console.error("Password reset request failed:", error);
      throw error;
    }
  }

  // Confirm password reset
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    try {
      await apiClient.post("/auth/password-reset/confirm", data);
    } catch (error) {
      console.error("Password reset confirmation failed", error);
      throw error;
    }
  }

  // Refresh access token
  async refreshTokens(
    refreshToken?: string
  ): Promise<{ user: User; company: Company } | null> {
    try {
      const token =
        refreshToken || (await secureStorage.getTokens()).refreshToken;

      if (!token) {
        throw new Error("No refresh token found");
      }

      const response = await apiClient.post<AuthResponse>("/auth/refresh", {
        refreshToken: token,
      });

      await secureStorage.setTokens(
        response.accessToken,
        response.refreshToken
      );
      apiClient.setAccessToken(response.accessToken);

      return { user: response.user, company: response.company };
    } catch (error) {
      console.error("Token refresh failed: ", error);
      await this.clearAuth();
      return null;
    }
  }

  // Setup MFA
  async setupMFA(): Promise<MFASetupResponse> {
    try {
      const response = await apiClient.post<MFASetupResponse>(
        "/auth/mfa/setup"
      );

      // Store MFA secret
      await secureStorage.setItem("mfa_secret", response.secret);

      return response;
    } catch (error) {
      console.error("MFA verification failed:", error);
      throw error;
    }
  }

  // Verify MFA code
  async verifyMFA(data: MFAVerifyRequest): Promise<void> {
    try {
      await apiClient.post("/auth/mfa/verify", data);
    } catch (error) {
      console.error("MFA verification failed:", error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const { refreshToken } = await secureStorage.getTokens();

      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      await this.clearAuth();
    }
  }

  // Clear authentication state
  private async clearAuth(): Promise<void> {
    await secureStorage.clear();
    apiClient.setAccessToken(null);
  }

  // Email verification
  async resendVerificationEmail(): Promise<void> {
    try {
      await apiClient.post("/auth/verify-email/resend");
    } catch (error) {
      console.error("Resend verification failed:", error);
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.post("/auth/verify-email", { token });
    } catch (error) {
      console.error("Email verification failed:", error);
      throw error;
    }
  }
}

export default AuthService.getInstance();
