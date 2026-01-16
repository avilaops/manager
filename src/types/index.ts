// ============================================
// TYPES & INTERFACES - Gerenciador Pessoal
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  readingGoal: number;
  notifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  timezone: string;
}

// ============================================
// CALENDAR
// ============================================

export interface CalendarEvent {
  id: string; // Changed from number to string
  title: string;
  description?: string;
  startDate: string; // Changed from 'start' to 'startDate'
  endDate?: string; // Changed from 'end' to 'endDate'
  startTime?: string;
  endTime?: string;
  category: EventCategory;
  reminder?: number; // Made optional
  allDay: boolean;
  color: string;
  location?: string;
  attendees?: string[];
  recurrence?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  reminderFired?: boolean;
  createdAt: string; // Changed from 'created' to 'createdAt'
  updatedAt?: string;
}

export type EventCategory = 'work' | 'personal' | 'health' | 'finance' | 'study' | 'social' | 'other';

export interface CalendarView {
  type: 'month' | 'week' | 'day' | 'list';
  currentDate: Date;
  selectedDate: Date;
}

// ============================================
// CRM & LEADS
// ============================================

export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone?: string; // Made optional
  company?: string;
  position?: string;
  source: ContactSource;
  status: ContactStatus;
  tags?: string[];
  notes?: string;
  lastContactDate?: string;
  createdAt: string;
  updatedAt?: string;
  emailsSent?: number;
  nextEmailDate?: string;
}

export type ContactSource = 'site' | 'indicacao' | 'linkedin' | 'facebook' | 'instagram' | 'email' | 'evento' | 'manual' | 'direct' | 'import' | 'website' | 'outro';

export type ContactStatus = 'novo' | 'contato' | 'proposta' | 'negociacao' | 'ganho' | 'perdido' | 'new' | 'contacted' | 'qualified' | 'converted' | 'active';

export interface Lead extends Contact {
  phone: string; // Required in Lead
  tags?: string[];
  tipoProjeto?: string;
  orcamento?: string;
  extras?: LeadExtra[];
}

export interface LeadExtra {
  item: string;
  price: string;
  reason: string;
}

// ============================================
// E-READER & DIARY
// ============================================

export interface Book {
  id: string;
  title: string;
  author: string;
  pages: number;
  totalPages: number;
  currentPage: number;
  progress: number;
  filePath: string;
  coverImage?: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  mood: DiaryMood;
  content: string;
  gratitude?: string;
  goals?: string[];
  achievements?: string[];
}

export type DiaryMood = 'excelente' | 'bom' | 'neutro' | 'ruim' | 'pessimo';

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  totalPages: number;
  percentage: number;
  lastRead: string;
  dailyGoalMet: boolean;
}

export interface ReadingStatistics {
  totalLivros?: number;
  livrosLidos?: number;
  paginasLidas?: number;
  totalPagesRead: number;
  consecutiveDays: number;
  diaryEntries: number;
  diasConsecutivos?: number;
  entradasDiario?: number;
  booksRead: number;
  currentBooks: number;
}

// ============================================
// NOTIFICATIONS
// ============================================

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon?: string;
}

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

// ============================================
// FINANCIAL
// ============================================

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  account?: string;
}

export interface FinancialSummary {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  period: string;
}

// ============================================
// GITHUB
// ============================================

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language?: string;
  updated_at: string;
  private: boolean;
}

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

// ============================================
// MONGODB
// ============================================

export interface DatabaseInfo {
  name: string;
  sizeOnDisk: number;
  collections: CollectionInfo[];
}

export interface CollectionInfo {
  name: string;
  count: number;
  documentCount?: number;
}

// ============================================
// GMAIL
// ============================================

export interface GmailAccount {
  email: string;
  name: string;
  authenticated: boolean;
  lastSync?: string;
}

export interface GmailMessage {
  id: string;
  account: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  date: string;
  labels: string[];
  read: boolean;
}

export interface GmailStats {
  totalEmails: number;
  accountsCount: number;
  accounts?: Array<{
    account: string;
    emails: number;
  }>;
  byAccount: Array<{
    account: string;
    count: number;
  }>;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// ============================================
// SETTINGS
// ============================================

export interface SystemSettings {
  general: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    email: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
  };
}

// ============================================
// FORM DATA
// ============================================

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: ContactSource;
  status: ContactStatus;
  notes?: string;
}

export interface EventFormData {
  title: string;
  description?: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  category: EventCategory;
  reminder: number;
  allDay: boolean;
  color: string;
}
