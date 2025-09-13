'use client';

import React, { ReactNode } from 'react';
import { useAuth, UserType } from '@/context/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: UserType;
  fallback?: ReactNode;
  inverse?: boolean; // Show children only when NOT authenticated
}

/**
 * A lightweight auth guard component for conditional rendering
 * Use this when you want to conditionally show/hide content based on auth state
 * For full page protection, use ProtectedRoute instead
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  fallback = null,
  inverse = false
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Don't render anything while loading
  if (isLoading) {
    return null;
  }

  // Inverse mode: show children only when NOT authenticated
  if (inverse) {
    return !isAuthenticated ? <>{children}</> : <>{fallback}</>;
  }

  // Normal mode: show children only when authenticated
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Check role requirement
  if (requiredRole && user.role !== requiredRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AuthGuard;
