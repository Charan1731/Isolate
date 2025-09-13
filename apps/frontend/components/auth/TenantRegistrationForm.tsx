'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Building } from 'lucide-react';

interface TenantRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TenantRegistrationForm: React.FC<TenantRegistrationFormProps> = ({ onSuccess, onCancel }) => {
  const { registerTenant, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.slug) {
      setError('Please fill in all fields');
      return;
    }

    // Basic slug validation
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(formData.slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    const result = await registerTenant(formData.name, formData.slug);
    
    if (result.success) {
      onSuccess?.();
    } else {
      setError(result.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: slug
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-background/80 backdrop-blur-md border border-border/60 rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building className="w-6 h-6 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Create Organization</h2>
          <p className="text-muted-foreground mt-2">Set up your organization</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Organization Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="Enter organization name"
              required
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2">
              Organization Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              placeholder="organization-slug"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL-friendly identifier (lowercase, numbers, hyphens only)
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Building className="w-4 h-4" />
                  <span>Create Organization</span>
                </>
              )}
            </button>
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenantRegistrationForm;
