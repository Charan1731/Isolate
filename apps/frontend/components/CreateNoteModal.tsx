/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Save, Sparkles } from 'lucide-react';
import ApiClient from '@/lib/api';
import { toast } from 'sonner';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteCreated: () => void;
}

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  isOpen,
  onClose,
  onNoteCreated,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setContent('');
      setIsLoading(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiClient.createNote(title.trim(), content.trim());
      
      if (response.success) {
        toast.success('Note created successfully! ✨');
        onNoteCreated();
        onClose();
      } else {
        toast.error(response.error || 'Failed to create note');
      }
    } catch (error) {
      toast.error('Failed to create note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Animated backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/20 rounded-2xl blur-xl animate-pulse" />
        
        {/* Modal content */}
        <div className="relative bg-background/95 backdrop-blur-md border-2 border-border/60 rounded-2xl shadow-2xl shadow-black/20 ring-1 ring-primary/10 transform transition-all duration-300 scale-100 animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/60">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Create New Note</h2>
                <p className="text-sm text-muted-foreground">Capture your thoughts securely</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 hover:bg-muted rounded-lg transition-colors group disabled:opacity-50"
            >
              <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label htmlFor="note-title" className="block text-sm font-semibold text-foreground">
                Note Title
              </label>
              <div className="relative">
                <input
                  id="note-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a compelling title..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/60 disabled:opacity-50 text-lg"
                  autoFocus
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
              </div>
            </div>

            {/* Content Input */}
            <div className="space-y-2">
              <label htmlFor="note-content" className="block text-sm font-semibold text-foreground">
                Note Content
              </label>
              <div className="relative">
                <textarea
                  id="note-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note content here... You can use markdown formatting!"
                  disabled={isLoading}
                  rows={12}
                  className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/60 disabled:opacity-50 resize-none"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tip: Use ** for bold, * for italic, and - for lists</span>
                <span>{content.length} characters</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              <div className="text-sm text-muted-foreground">
                <span className="inline-flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Auto-saving enabled</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-background border-2 border-border text-foreground rounded-xl font-medium hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading || !title.trim() || !content.trim()}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium flex items-center space-x-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Create Note</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNoteModal;
