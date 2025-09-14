'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import TenantRegistrationForm from '@/components/auth/TenantRegistrationForm';

type AuthMode = 'login' | 'register' | 'tenant' | 'dashboard';

const AuthPage = () => {
  const { isLoading } = useAuth();
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

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

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
      </div>
    </div>
  );
};

export default AuthPage;
