// Shared types for BẠC MÔN HUB Platform

export type UserRole = 'OWNER' | 'IB' | 'USER';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export type LicenseStatus = 'UNUSED' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED';
export type LicenseServiceType = 'trading' | 'ai' | 'courses' | 'calendar';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'CONSULTING' | 'CONVERTED' | 'REJECTED';
export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export const PERMISSIONS = {
  // User Management
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE_KEYS: 'users.manage_keys',

  // License Key Management
  KEYS_VIEW: 'keys.view',
  KEYS_CREATE: 'keys.create',
  KEYS_REVOKE: 'keys.revoke',
  KEYS_EXTEND: 'keys.extend',
  KEYS_ASSIGN: 'keys.assign',

  // Trading Module
  TRADING_VIEW: 'trading.view',
  TRADING_MANAGE: 'trading.manage',

  // Bạc Môn AI
  AI_CHAT: 'ai.chat',
  AI_ANALYSIS: 'ai.chart_analysis',
  AI_MANAGE_PROMPTS: 'ai.manage_prompts',

  // Courses & Education
  COURSES_VIEW: 'courses.view',
  COURSES_PREMIUM: 'courses.premium',
  COURSES_CREATE: 'courses.create',
  COURSES_EDIT: 'courses.edit',
  COURSES_DELETE: 'courses.delete',

  // Economic Calendar
  CALENDAR_VIEW: 'calendar.view',
  CALENDAR_MANAGE: 'calendar.manage',

  // IB CRM & Leads
  CRM_VIEW: 'crm.view',
  CRM_CREATE: 'crm.create',
  CRM_EDIT: 'crm.edit',
  CRM_DELETE: 'crm.delete',

  // Landing Page Builder
  LANDING_CREATE: 'landing.create',
  LANDING_EDIT: 'landing.edit',
  LANDING_PUBLISH: 'landing.publish',
  LANDING_DELETE: 'landing.delete',

  // System Administration
  SYSTEM_UPDATE: 'system.update',
  SYSTEM_SETTINGS: 'system.settings',
  SYSTEM_LOGS: 'system.logs',
} as const;

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  ibId?: string | null;
  assignedIbName?: string | null;
  activeLicenseKey?: string | null;
  licenseExpiresAt?: string | null;
  permissions: string[];
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface LicenseKeyDto {
  id: string;
  keyCode: string;
  status: LicenseStatus;
  userId?: string | null;
  userEmail?: string | null;
  ibId?: string | null;
  createdById: string;
  activatedAt?: string | null;
  expiresAt?: string | null;
  maxDevices: number;
  currentDevicesCount: number;
  allowedServices: LicenseServiceType[];
  notes?: string | null;
  createdAt: string;
}

export interface DeviceDto {
  id: string;
  keyId: string;
  userId: string;
  deviceIdentifier: string;
  deviceName: string;
  osVersion: string;
  lastActiveAt: string;
  createdAt: string;
}

export interface MT5AccountSummary {
  accountNumber: number;
  broker: string;
  serverName: string;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  profit: number;
  isConnected: boolean;
  lastPingAt: string;
}

export interface MT5PositionDto {
  id: string;
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  sl: number;
  tp: number;
  profit: number;
  openTime: string;
}

export interface AIAnalysisResult {
  marketBias: 'BUY' | 'SELL' | 'NEUTRAL';
  confidence: number; // 0 - 100
  entry: string;
  stopLoss: string;
  takeProfit: string;
  riskReward: string;
  reasoning: string;
  keyLevels: string[];
  marketStructure: string;
  signals: string[];
  invalidation: string;
  educationalExplanation: string;
}

export interface CourseDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl?: string | null;
  category: string;
  isPremium: boolean;
  isPublished: boolean;
  chaptersCount?: number;
  lessonsCount?: number;
  createdAt: string;
}

export interface EconomicEventDto {
  id: string;
  eventTime: string;
  country: string;
  currency: string;
  eventName: string;
  impact: ImpactLevel;
  actual?: string | null;
  forecast?: string | null;
  previous?: string | null;
}

export interface LeadDto {
  id: string;
  ibId: string;
  landingPageId?: string | null;
  fullName: string;
  phone: string;
  email?: string | null;
  status: LeadStatus;
  notes?: string | null;
  tags: string[];
  createdAt: string;
  lastContactAt?: string | null;
}

export interface AppVersionDto {
  id: string;
  version: string;
  downloadUrl: string;
  releaseNotes: string;
  releaseDate: string;
  isMandatory: boolean;
  minSupportedVersion?: string | null;
  isPublished: boolean;
}
