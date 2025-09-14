/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ApiClient from '@/lib/api';
import { toast } from 'sonner';
import CreateNoteModal from '@/components/CreateNoteModal';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  TrendingUp,
  Users,
  Clock,
  ChevronDown,
  Eye,
  MoreVertical
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  tenantId: string;
  userId: string;
  deleted: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalNotes: number;
  todayNotes: number;
  weekNotes: number;
  recentActivity: string;
}

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [tenantNotes, setTenantNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'my' | 'tenant'>('my');
  const [limitReached, setLimitReached] = useState<boolean>(false)
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const [editNote, setEditNote] = useState({
    id: '',
    title: '',
    content: ''
  });

  const [userStats, setUserStats] = useState<UserStats>({
    totalNotes: 0,
    todayNotes: 0,
    weekNotes: 0,
    recentActivity: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotes();
    }
  }, [isAuthenticated, viewMode]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const [userNotesResponse, tenantNotesResponse] = await Promise.all([
        ApiClient.getUserNotes(),
        ApiClient.getTenantNotes()
      ]);

      if (userNotesResponse.success) {
        const data = userNotesResponse.data as { notes?: Note[] } | undefined;
        const userNotes = data && Array.isArray(data.notes) ? data.notes : [];
        setNotes(userNotes);
        if(userNotes.length >= 3){
          setLimitReached(true)
        }
        calculateStats(userNotes);
      }

      if (tenantNotesResponse.success) {
        const data = tenantNotesResponse.data as { notes?: Note[] } | undefined;
        const tNotes = data && Array.isArray(data.notes) ? data.notes : [];
        setTenantNotes(tNotes);
      }
    } catch (error) {
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userNotes: Note[]) => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const todayNotes = userNotes.filter(note => 
      new Date(note.createdAt).toDateString() === today.toDateString()
    ).length;
    
    const weekNotes = userNotes.filter(note => 
      new Date(note.createdAt) >= oneWeekAgo
    ).length;

    const recentNote = userNotes.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];

    setUserStats({
      totalNotes: userNotes.length,
      todayNotes,
      weekNotes,
      recentActivity: recentNote ? new Date(recentNote.updatedAt).toLocaleString() : 'No recent activity'
    });
  };

  const handleNoteCreated = () => {
    fetchNotes();
  };

  const handleUpdateNote = async () => {
    if (!editNote.title.trim() || !editNote.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    try {
      const response = await ApiClient.updateNote(editNote.id, editNote.title, editNote.content);
      if (response.success) {
        toast.success('Note updated successfully');
        setEditNote({ id: '', title: '', content: '' });
        setIsEditing(false);
        setSelectedNote(null);
        fetchNotes();
      } else {
        toast.error(response.error || 'Failed to update note');
      }
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await ApiClient.deleteNote(noteId);
      if (response.success) {
        toast.success('Note deleted successfully');
        setSelectedNote(null);
        fetchNotes();
      } else {
        toast.error(response.error || 'Failed to delete note');
      }
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const startEdit = (note: Note) => {
    setEditNote({
      id: note.id,
      title: note.title,
      content: note.content
    });
    setIsEditing(true);
  };

  const filteredNotes = () => {
    const currentNotes = viewMode === 'my' ? notes : tenantNotes;
    let filtered = currentNotes.filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter(note => {
        const noteDate = new Date(note.createdAt);
        switch (filterDate) {
          case 'today':
            return noteDate.toDateString() === now.toDateString();
          case 'week':
            return noteDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month':
            return noteDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h1>
          <p className="text-muted-foreground">Please sign in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 mt-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Welcome back, {user?.email.split('@')[0]}!
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your secure notes and collaborate with your team
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {user?.role}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Notes</p>
                <p className="text-3xl font-bold text-foreground">{userStats.totalNotes}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today</p>
                <p className="text-3xl font-bold text-foreground">{userStats.todayNotes}</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-3xl font-bold text-foreground">{userStats.weekNotes}</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Notes</p>
                <p className="text-3xl font-bold text-foreground">{tenantNotes.length}</p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('my')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'my'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  My Notes
                </button>
                <button
                  onClick={() => setViewMode('tenant')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'tenant'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  Team Notes
                </button>
              </div>

              <div className="relative">
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value as any)}
                  className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className={`bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-primary/90 transition-colors ${limitReached ? 'cursor-not-allowed' : ''}`}
              disabled={limitReached}
            >
              {limitReached ? <span>Note limit reached</span> : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>New Note</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notes List */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  {viewMode === 'my' ? 'My Notes' : 'Team Notes'} ({filteredNotes().length})
                </h2>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading notes...</p>
                  </div>
                ) : filteredNotes().length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No notes found</p>
                    {viewMode === 'my' && (
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-4 text-primary hover:text-primary/80 font-medium"
                      >
                        Create your first note
                      </button>
                    )}
                  </div>
                ) : (
                  filteredNotes().map((note) => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedNote?.id === note.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">{note.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {note.content.substring(0, 100)}...
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {viewMode === 'my' && note.userId === user?.id && (
                          <div className="ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="p-1 hover:bg-background rounded"
                            >
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Note Detail/Editor */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl overflow-hidden h-full">
              {isEditing ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground">
                      Edit Note
                    </h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleUpdateNote}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-primary/90 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditNote({ id: '', title: '', content: '' });
                        }}
                        className="bg-background border border-border text-foreground px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-muted transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                      <input
                        type="text"
                        value={editNote.title}
                        onChange={(e) => {
                          setEditNote({ ...editNote, title: e.target.value });
                        }}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        placeholder="Enter note title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                      <textarea
                        value={editNote.content}
                        onChange={(e) => {
                          setEditNote({ ...editNote, content: e.target.value });
                        }}
                        rows={15}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                        placeholder="Write your note content here..."
                      />
                    </div>
                  </div>
                </div>
              ) : selectedNote ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-foreground truncate">{selectedNote.title}</h2>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Created: {new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Edit3 className="w-4 h-4" />
                          <span>Updated: {new Date(selectedNote.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {viewMode === 'my' && selectedNote.userId === user?.id && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEdit(selectedNote)}
                          className="bg-background border border-border text-foreground px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-muted transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteNote(selectedNote.id)}
                          className="bg-destructive text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-destructive/90 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <div className="bg-background border border-border rounded-lg p-6 whitespace-pre-wrap">
                      {selectedNote.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center h-full flex items-center justify-center">
                  <div>
                    <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Select a note to view</h3>
                    <p className="text-muted-foreground">Choose a note from the list to see its content</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Note Modal */}
        <CreateNoteModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onNoteCreated={handleNoteCreated}
        />
        </div>
    </div>
  );
};

export default UserDashboard;
