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
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Eye,
  BookOpen,
  BarChart3,
  RefreshCw,
  Download,
  Copy,
  XCircle,
  User,
  Activity,
  Award
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
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

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
  }, [isAuthenticated, viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

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
    } catch {
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
    } catch {
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
    } catch {
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

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    return 'Just now';
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
    <div className="min-h-screen bg-background pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.email.split('@')[0]}!
              </h1>
              <p className="text-muted-foreground">Manage your secure notes and collaborate with your team</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="w-4 h-4" />
              <span className="capitalize">{user?.role} Plan</span>
            </div>
            <button
              onClick={fetchNotes}
              className="flex items-center space-x-1 hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-card rounded-xl border p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Notes</p>
                <p className="text-3xl font-bold">{userStats.totalNotes}</p>
                <div className="flex items-center mt-2 text-xs">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-green-500">Your collection</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="group bg-card rounded-xl border p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today</p>
                <p className="text-3xl font-bold">{userStats.todayNotes}</p>
                <div className="flex items-center mt-2 text-xs">
                  <Activity className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-green-500">New today</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="group bg-card rounded-xl border p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-3xl font-bold">{userStats.weekNotes}</p>
                <div className="flex items-center mt-2 text-xs">
                  <Clock className="w-3 h-3 text-purple-500 mr-1" />
                  <span className="text-purple-500">Recent activity</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
          
          <div className="group bg-card rounded-xl border p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Notes</p>
                <p className="text-3xl font-bold">{tenantNotes.length}</p>
                <div className="flex items-center mt-2 text-xs">
                  <Users className="w-3 h-3 text-orange-500 mr-1" />
                  <span className="text-orange-500">Shared workspace</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                <Users className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Notes Management Header */}
        <div className="bg-card rounded-xl border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                {viewMode === 'my' ? 'My Notes' : 'Team Notes'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {viewMode === 'my' 
                  ? 'Create and manage your personal notes' 
                  : 'Browse notes shared by your team members'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setDisplayMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    displayMode === 'grid' 
                      ? 'bg-background shadow-sm' 
                      : 'hover:bg-background/50'
                  }`}
                  title="Grid view"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDisplayMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    displayMode === 'list' 
                      ? 'bg-background shadow-sm' 
                      : 'hover:bg-background/50'
                  }`}
                  title="List view"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search notes by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex space-x-3">
              <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('my')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'my'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  My Notes
                </button>
                <button
                  onClick={() => setViewMode('tenant')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'tenant'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Team Notes
                </button>
              </div>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value as any)}
                className="px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <button
                onClick={fetchNotes}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Refresh notes"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Button */}
          {viewMode === 'my' && (
            <div className="flex justify-center">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className={`bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-primary/90 transition-colors ${
                  limitReached ? 'cursor-not-allowed opacity-50' : ''
                }`}
                disabled={limitReached}
              >
                {limitReached ? (
                  <span>Note limit reached (Free Plan)</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create New Note</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Notes Display */}
        <div className="bg-card rounded-xl border p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredNotes().length > 0 ? (
            displayMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes().map((note) => (
                  <div 
                    key={note.id} 
                    className="group bg-gradient-to-br from-card via-card to-muted/10 border rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {note.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{viewMode === 'my' ? 'My Note' : 'Team Note'}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                            v{note.version}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(note.content);
                          }}
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy content"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {viewMode === 'my' && note.userId === user?.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(note);
                            }}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit note"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {note.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {truncateContent(note.content)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeAgo(note.updatedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>{note.content.length} chars</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredNotes().map((note) => (
                  <div 
                    key={note.id} 
                    className="group bg-card border rounded-xl p-6 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {note.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                              {note.title}
                            </h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                              v{note.version}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {truncateContent(note.content, 200)}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Updated {getTimeAgo(note.updatedAt)}</span>
                            <span>•</span>
                            <span>Created {formatDate(note.createdAt)}</span>
                            <span>•</span>
                            <span>{note.content.length} characters</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(note.content);
                          }}
                          className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy content"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {viewMode === 'my' && note.userId === user?.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(note);
                            }}
                            className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit note"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No notes found</p>
              <p className="text-sm text-muted-foreground mb-6">
                {searchTerm || filterDate !== 'all' 
                  ? 'Try adjusting your search filters' 
                  : viewMode === 'my'
                    ? 'Create your first note to get started'
                    : 'Your team hasn\'t shared any notes yet'
                }
              </p>
              {viewMode === 'my' && !searchTerm && filterDate === 'all' && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-primary/90 transition-colors mx-auto"
                  disabled={limitReached}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Note</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Note Detail Modal */}
        {selectedNote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {selectedNote.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedNote.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {viewMode === 'my' ? 'Your note' : 'Team note'} • Version {selectedNote.version}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(selectedNote.content)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Copy content"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {viewMode === 'my' && selectedNote.userId === user?.id && (
                    <>
                      <button
                        onClick={() => startEdit(selectedNote)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Edit note"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(selectedNote.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-destructive"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="flex items-center space-x-4 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(selectedNote.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Updated {formatDate(selectedNote.updatedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{selectedNote.content.length} characters</span>
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground bg-muted/30 rounded-lg p-4">
                    {selectedNote.content}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Note Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Edit Note</h2>
                    <p className="text-sm text-muted-foreground">Make changes to your note</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleUpdateNote}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditNote({ id: '', title: '', content: '' });
                    }}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Note Title</label>
                    <input
                      type="text"
                      value={editNote.title}
                      onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter note title..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Note Content</label>
                    <textarea
                      value={editNote.content}
                      onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                      rows={15}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Write your note content here..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
