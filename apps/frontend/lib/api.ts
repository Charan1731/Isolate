/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ApiClient {
  private static getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data,
          message: data.message,
        };
      } else {
        return {
          success: false,
          error: data.message || 'Request failed',
          message: data.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  // Auth-specific methods
  static async login(email: string, password: string) {
    return this.post('/auth/login', { email, password });
  }

  static async register(email: string, password: string, role: 'ADMIN' | 'MEMBER', slug: string) {
    return this.post('/auth/register', { email, password, role, slug });
  }

  static async registerTenant(name: string, slug: string) {
    return this.post('/auth/register-tenant', { name, slug });
  }

  // Admin-specific methods
  static async getTenantUsers() {
    return this.get('/admin/users');
  }

  static async deleteUser(userId: string) {
    return this.post('/admin/delete-user', { userId });
  }

  static async updateUserRole(userId: string, role: string) {
    return this.post('/admin/update-user-role', { userId, role });
  }

  static async updateUserPlan(userId: string, plan: string) {
    return this.post('/admin/update-user-plan', { userId, plan });
  }

  static async updateTenantPlan(plan: string) {
    return this.post('/admin/update-tenant-plan', { plan });
  }

  static async sendInvitation(email: string) {
    return this.post('/admin/send-invitation', { email });
  }

  static async getPendingInvitations() {
    return this.get('/admin/invitations');
  }

  static async getTenantStats() {
    return this.get('/admin/stats');
  }

  static async getAuditLogs(page: number = 1, limit: number = 50) {
    return this.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
  }

  static async getAdminTenantNotes() {
    return this.get('/admin/notes');
  }

  // User-specific note methods
  static async createNote(title: string, content: string) {
    return this.post('/user/create-node', { title, content });
  }

  static async getUserNotes() {
    return this.get('/user/get-user-notes');
  }

  static async getTenantNotes() {
    return this.get('/user/get-tenant-notes');
  }

  static async getNote(noteId: string) {
    return this.get(`/user/get-note?id=${noteId}`);
  }

  static async updateNote(noteId: string, title: string, content: string) {
    return this.put(`/user/update?id=${noteId}`, { title, content });
  }

  static async deleteNote(noteId: string) {
    return this.delete(`/user/delete?id=${noteId}`);
  }
}

export default ApiClient;
