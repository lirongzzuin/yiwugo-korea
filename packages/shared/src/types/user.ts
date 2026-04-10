export enum AuthProvider {
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
  APPLE = 'APPLE',
  EMAIL = 'EMAIL',
  YIWUGO = 'YIWUGO',
}

export enum MemberType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
}

export enum Role {
  USER = 'USER',
  BUSINESS = 'BUSINESS',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
  provider?: AuthProvider;
  providerId?: string;
  memberType: MemberType;
  businessNumber?: string;
  businessName?: string;
  yiwugoUserId?: string;
  role: Role;
  customsCode?: string;
  points: number;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  marketingConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label?: string;
  name: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  isDefault: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  memberType: MemberType;
  businessNumber?: string;
  businessName?: string;
  marketingConsent?: boolean;
}

export interface SocialLoginRequest {
  provider: AuthProvider;
  accessToken: string;
  idToken?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
