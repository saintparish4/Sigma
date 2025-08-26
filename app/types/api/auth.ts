// User roles enum
export enum UserRole {
    ADMIN = 'admin',
    FINANCE = 'finance',
    EMPLOYEE = 'employee' 
}

// Authentication Types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    companyId: string;
    isEmailVerified: boolean;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date; 
}

export interface Company {
    id: string;
    name: string;
    domain?: string;
    industry?: string;
    size?: number;
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    settings: {
        allowSelfRegistration: boolean;
        requireEmailVerification: boolean;
        enableMFA: boolean;
        ssoProviders: string[]; 
    };
    createdAt: Date;
    updatedAt: Date; 
}

// Request/Response Types
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean; 
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName?: string;
    role: UserRole; 
}

export interface AuthResponse {
    user: User;
    company: Company;
    accessToken: string;
    refreshToken: string;
    expiresIn: number; 
}

export interface PasswordResetRequest {
    email: string; 
}

export interface PasswordResetConfirm {
    token: string;
    newPassword: string;  
}

// SSO Types
export interface SSOProvider {
    name: 'google' | 'microsoft';
    clientId: string;
    enabled: boolean; 
}

// MFA Types
export interface MFASetupResponse {
    secret: string;
    qrCode: string;
    backupCodes: string[]; 
}

export interface MFAVerifyRequest {
    code: string;
    type: 'totp' | 'backup'; 
}