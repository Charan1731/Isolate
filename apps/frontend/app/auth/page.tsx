'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import TenantRegistrationForm from '@/components/auth/TenantRegistrationForm';
import { User, Building, LogOut, Shield, Clock } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'tenant' | 'dashboard';

const AuthPage = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-background/80 backdrop-blur-md border border-border/60 rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold">Welcome Back!</h1>
              <p className="text-muted-foreground mt-2">You are successfully authenticated</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-card border border-border/50 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">User Information</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID:</span>
                    <span className="font-mono text-xs">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tenant ID:</span>
                    <span className="font-mono text-xs">{user.tenantId}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-card border border-border/50 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Security Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">JWT Token Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">Multi-tenant Isolation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Session expires in 7 days</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={logout}
                className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg font-medium hover:bg-destructive/90 transition-colors flex items-center space-x-2 mx-auto"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Authentication Demo
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Test the complete authentication system with login, registration, and tenant management
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setAuthMode('login')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                authMode === 'login'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                authMode === 'register'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => setAuthMode('tenant')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                authMode === 'tenant'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Tenant
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          {authMode === 'login' && (
            <LoginForm
              onSuccess={() => setAuthMode('dashboard')}
              onSwitchToRegister={() => setAuthMode('register')}
            />
          )}
          {authMode === 'register' && (
            <RegisterForm
              onSuccess={() => setAuthMode('dashboard')}
              onSwitchToLogin={() => setAuthMode('login')}
            />
          )}
          {authMode === 'tenant' && (
            <TenantRegistrationForm
              onSuccess={() => {
                setAuthMode('register');
                // You could show a success message here
              }}
              onCancel={() => setAuthMode('login')}
            />
          )}
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-card border border-border/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">How to Test</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">1. Create Tenant</h3>
                <p className="text-sm text-muted-foreground">
                  First, create an organization using the &quot;Create Tenant&quot; tab
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">2. Register User</h3>
                <p className="text-sm text-muted-foreground">
                  Register a new user with the tenant slug you just created
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">3. Login & Test</h3>
                <p className="text-sm text-muted-foreground">
                  Login with your credentials and see the authenticated state
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
