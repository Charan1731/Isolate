/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, BarChart3, Shield, Mail, Trash2, Crown, 
  RefreshCw, Award, Building, ArrowUp, Settings, 
  TrendingUp, Activity, CheckCircle, XCircle,
  Download, Upload, Search,
  Eye, Edit2, Clock, ArrowRight, FileText, Calendar,
  BookOpen, User, Copy
} from 'lucide-react';
import ApiClient from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
  _count: { notes: number };
}

interface TenantStats {
  userCount: number;
  noteCount: number;
  invitationCount: number;
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
}

interface AuditLog {
  id: string;
  action: string;
  createdAt: string;
  user: {
    email: string;
    role: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

interface AdminNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  user: {
    id: string;
    email: string;
    role: string;
    plan: string;
  };
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'MEMBER'>('ALL');
  const [planFilter, setPlanFilter] = useState<'ALL' | 'FREE' | 'PRO'>('ALL');
  const [notesSearchTerm, setNotesSearchTerm] = useState('');
  const [notesUserFilter, setNotesUserFilter] = useState<string>('ALL');
  const [selectedNote, setSelectedNote] = useState<AdminNote | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes, auditRes, invitationsRes, notesRes] = await Promise.all([
        ApiClient.getTenantUsers(),
        ApiClient.getTenantStats(),
        ApiClient.getAuditLogs(1, 10),
        ApiClient.getPendingInvitations(),
        ApiClient.getAdminTenantNotes()
      ]);

      if (usersRes.success) setUsers((usersRes.data as any).users);
      if (statsRes.success) setStats((statsRes.data as any).stats);
      if (auditRes.success) setAuditLogs((auditRes.data as any).auditLogs || []);
      if (invitationsRes.success) setPendingInvitations((invitationsRes.data as any).invitations || []);
      if (notesRes.success) setAdminNotes((notesRes.data as any).notes || []);
    } catch {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      const response = await ApiClient.sendInvitation(inviteEmail);
      if (response.success) {
        toast.success('Invitation sent successfully!');
        setInviteEmail('');
        fetchData();
      } else {
        toast.error(response.error || 'Failed to send invitation');
      }
    } catch {
      toast.error('Failed to send invitation');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await ApiClient.deleteUser(userId);
      if (response.success) {
        toast.success('User deleted successfully!');
        fetchData();
      } else {
        toast.error(response.error || 'Failed to delete user');
      }
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleUpgradePlan = async (userId: string, currentPlan: string) => {
    const newPlan = currentPlan === 'FREE' ? 'PRO' : 'FREE';
    const action = newPlan === 'PRO' ? 'upgrade' : 'downgrade';
    
    if (!confirm(`Are you sure you want to ${action} this user to ${newPlan}?`)) return;

    try {
      const response = await ApiClient.updateUserPlan(userId, newPlan);
      if (response.success) {
        toast.success(`User plan ${action}d to ${newPlan} successfully!`);
        fetchData();
      } else {
        toast.error(response.error || `Failed to ${action} user plan`);
      }
    } catch {
      toast.error(`Failed to ${action} user plan`);
    }
  };

  const handleUpdateUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      const response = await ApiClient.updateUserRole(userId, newRole);
      if (response.success) {
        toast.success(`User role updated to ${newRole} successfully!`);
        fetchData();
      } else {
        toast.error(response.error || 'Failed to update user role');
      }
    } catch {
      toast.error('Failed to update user role');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    
    if (!confirm(`Are you sure you want to ${bulkAction} ${selectedUsers.length} user(s)?`)) return;

    try {
      const promises = selectedUsers.map(userId => {
        switch (bulkAction) {
          case 'delete':
            return ApiClient.deleteUser(userId);
          case 'upgrade':
            const user = users.find(u => u.id === userId);
            return user?.plan === 'FREE' ? ApiClient.updateUserPlan(userId, 'PRO') : Promise.resolve({ success: true });
          case 'downgrade':
            const user2 = users.find(u => u.id === userId);
            return user2?.plan === 'PRO' ? ApiClient.updateUserPlan(userId, 'FREE') : Promise.resolve({ success: true });
          default:
            return Promise.resolve({ success: false });
        }
      });

      await Promise.all(promises);
      toast.success(`Bulk ${bulkAction} completed successfully!`);
      setSelectedUsers([]);
      setBulkAction('');
      fetchData();
    } catch {
      toast.error(`Failed to perform bulk ${bulkAction}`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesPlan = planFilter === 'ALL' || user.plan === planFilter;
    return matchesSearch && matchesRole && matchesPlan;
  });

  const filteredNotes = adminNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(notesSearchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(notesSearchTerm.toLowerCase());
    const matchesUser = notesUserFilter === 'ALL' || note.user.email === notesUserFilter;
    return matchesSearch && matchesUser;
  });

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

  if (user?.role !== 'ADMIN') {
    return (
      <div className='min-h-screen bg-background pt-32 pb-20 px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <Shield className='w-16 h-16 text-destructive mx-auto mb-4' />
          <h1 className='text-3xl font-bold mb-2'>Access Denied</h1>
          <p className='text-muted-foreground'>You don&apos;t have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'invitations', label: 'Invitations', icon: Mail },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className='min-h-screen bg-background pt-32 pb-20 px-4'>
      <Toaster />
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-4'>
            <div className='w-12 h-12 bg-primary rounded-xl flex items-center justify-center'>
              <Shield className='w-6 h-6 text-primary-foreground' />
            </div>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Admin Dashboard</h1>
              <p className='text-muted-foreground'>Manage your organization and users</p>
            </div>
          </div>
          
          {stats && (
            <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
              <div className='flex items-center space-x-1'>
                <Building className='w-4 h-4' />
                <span>{stats.tenant.name}</span>
              </div>
              <div className='flex items-center space-x-1'>
                <Award className='w-4 h-4' />
                <span className='capitalize'>{stats.tenant.plan} Plan</span>
              </div>
              <button
                onClick={fetchData}
                className='flex items-center space-x-1 hover:text-foreground transition-colors'
              >
                <RefreshCw className='w-4 h-4' />
                <span>Refresh</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className='border-b border-border mb-8'>
          <nav className='flex space-x-8'>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className='w-4 h-4' />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className='flex items-center justify-center h-64'>
            <RefreshCw className='w-8 h-8 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className='space-y-8'>
                {/* Enhanced Stats Cards */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  <div className='group bg-card rounded-xl border p-6 hover:shadow-lg transition-all duration-300'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-muted-foreground'>Total Users</p>
                        <p className='text-3xl font-bold'>{stats.userCount}</p>
                        <div className='flex items-center mt-2 text-xs'>
                          <TrendingUp className='w-3 h-3 text-green-500 mr-1' />
                          <span className='text-green-500'>+12% from last month</span>
                        </div>
                      </div>
                      <div className='w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors'>
                        <Users className='w-6 h-6 text-blue-500' />
                      </div>
                    </div>
                  </div>
                  
                  <div className='group bg-card rounded-xl border p-6 hover:shadow-lg transition-all duration-300'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-muted-foreground'>Total Notes</p>
                        <p className='text-3xl font-bold'>{stats.noteCount}</p>
                        <div className='flex items-center mt-2 text-xs'>
                          <TrendingUp className='w-3 h-3 text-green-500 mr-1' />
                          <span className='text-green-500'>+8% from last week</span>
                        </div>
                      </div>
                      <div className='w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors'>
                        <BarChart3 className='w-6 h-6 text-green-500' />
                      </div>
                    </div>
                  </div>
                  
                  <div className='group bg-card rounded-xl border p-6 hover:shadow-lg transition-all duration-300'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-muted-foreground'>Pending Invites</p>
                        <p className='text-3xl font-bold'>{stats.invitationCount}</p>
                        <div className='flex items-center mt-2 text-xs'>
                          <Clock className='w-3 h-3 text-orange-500 mr-1' />
                          <span className='text-orange-500'>{pendingInvitations.length} active</span>
                        </div>
                      </div>
                      <div className='w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors'>
                        <Mail className='w-6 h-6 text-orange-500' />
                      </div>
                    </div>
                  </div>
                  
                  <div className='group bg-card rounded-xl border p-6 hover:shadow-lg transition-all duration-300'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-muted-foreground'>Current Plan</p>
                        <p className='text-2xl font-bold capitalize'>{stats.tenant.plan}</p>
                        <div className='flex items-center mt-2 text-xs'>
                          <Award className='w-3 h-3 text-purple-500 mr-1' />
                          <span className='text-purple-500'>{stats.tenant.plan === 'PRO' ? 'Premium' : 'Basic'} features</span>
                        </div>
                      </div>
                      <div className='w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors'>
                        <Crown className='w-6 h-6 text-purple-500' />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className='bg-card rounded-xl border p-6'>
                  <h3 className='text-lg font-semibold mb-4 flex items-center'>
                    <Activity className='w-5 h-5 mr-2 text-primary' />
                    Quick Actions
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <button 
                      onClick={() => setActiveTab('invitations')}
                      className='p-4 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg transition-colors text-left group'
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium text-primary'>Send Invitation</p>
                          <p className='text-sm text-muted-foreground'>Invite new team members</p>
                        </div>
                        <ArrowRight className='w-4 h-4 text-primary group-hover:translate-x-1 transition-transform' />
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('audit')}
                      className='p-4 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 rounded-lg transition-colors text-left group'
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium text-blue-500'>View Audit Logs</p>
                          <p className='text-sm text-muted-foreground'>Track all activities</p>
                        </div>
                        <ArrowRight className='w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform' />
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('settings')}
                      className='p-4 bg-green-500/5 hover:bg-green-500/10 border border-green-500/20 rounded-lg transition-colors text-left group'
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium text-green-500'>Manage Settings</p>
                          <p className='text-sm text-muted-foreground'>Configure tenant options</p>
                        </div>
                        <ArrowRight className='w-4 h-4 text-green-500 group-hover:translate-x-1 transition-transform' />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className='space-y-6'>
                {/* Enhanced User Management Header */}
                <div className='bg-card rounded-xl border p-6'>
                  <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6'>
                    <div>
                      <h3 className='text-lg font-semibold flex items-center'>
                        <Users className='w-5 h-5 mr-2 text-primary' />
                        User Management
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Manage your organization&apos;s users and permissions
                      </p>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <button className='flex items-center space-x-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors'>
                        <Download className='w-4 h-4' />
                        <span>Export</span>
                      </button>
                      <button className='flex items-center space-x-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors'>
                        <Upload className='w-4 h-4' />
                        <span>Import</span>
                      </button>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className='flex flex-col lg:flex-row gap-4 mb-6'>
                    <div className='flex-1 relative'>
                      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                      <input
                        type='text'
                        placeholder='Search users by email...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary'
                      />
                    </div>
                    <div className='flex space-x-3'>
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'ADMIN' | 'MEMBER')}
                        className='px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary'
                      >
                        <option value='ALL'>All Roles</option>
                        <option value='ADMIN'>Admin</option>
                        <option value='MEMBER'>Member</option>
                      </select>
                      <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value as 'ALL' | 'FREE' | 'PRO')}
                        className='px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary'
                      >
                        <option value='ALL'>All Plans</option>
                        <option value='FREE'>Free</option>
                        <option value='PRO'>Pro</option>
                      </select>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedUsers.length > 0 && (
                    <div className='mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium text-primary'>
                          {selectedUsers.length} user(s) selected
                        </span>
                        <div className='flex items-center space-x-2'>
                          <select
                            value={bulkAction}
                            onChange={(e) => setBulkAction(e.target.value)}
                            className='px-3 py-1 text-sm border border-border rounded bg-background'
                          >
                            <option value=''>Select action</option>
                            <option value='upgrade'>Upgrade to Pro</option>
                            <option value='downgrade'>Downgrade to Free</option>
                            <option value='delete'>Delete Users</option>
                          </select>
                          <button
                            onClick={handleBulkAction}
                            disabled={!bulkAction}
                            className='px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors disabled:opacity-50'
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Users Table */}
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead>
                        <tr className='border-b border-border'>
                          <th className='text-left py-3 px-4 font-medium text-muted-foreground'>
                            <input
                              type='checkbox'
                              checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers(filteredUsers.map(u => u.id));
                                } else {
                                  setSelectedUsers([]);
                                }
                              }}
                              className='rounded border-border'
                            />
                          </th>
                          <th className='text-left py-3 px-4 font-medium text-muted-foreground'>User</th>
                          <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Role</th>
                          <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Plan</th>
                          <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Notes</th>
                          <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Joined</th>
                          <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className='border-b border-border/50 hover:bg-muted/30 transition-colors'>
                            <td className='py-3 px-4'>
                              <input
                                type='checkbox'
                                checked={selectedUsers.includes(user.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers([...selectedUsers, user.id]);
                                  } else {
                                    setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                  }
                                }}
                                className='rounded border-border'
                              />
                            </td>
                            <td className='py-3 px-4'>
                              <div className='flex items-center space-x-3'>
                                <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
                                  <span className='text-sm font-medium text-primary'>
                                    {user.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <span className='font-medium'>{user.email}</span>
                                  <p className='text-xs text-muted-foreground'>ID: {user.id.slice(-8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className='py-3 px-4'>
                              <div className='flex items-center space-x-2'>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === 'ADMIN' 
                                    ? 'bg-red-500/10 text-red-500' 
                                    : 'bg-blue-500/10 text-blue-500'
                                }`}>
                                  {user.role}
                                </span>
                                <button
                                  onClick={() => handleUpdateUserRole(user.id, user.role)}
                                  className='p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors'
                                  title='Change role'
                                >
                                  <Edit2 className='w-3 h-3' />
                                </button>
                              </div>
                            </td>
                            <td className='py-3 px-4'>
                              <div className='flex items-center space-x-2'>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.plan === 'PRO' 
                                    ? 'bg-green-500/10 text-green-500' 
                                    : 'bg-gray-500/10 text-gray-500'
                                }`}>
                                  {user.plan}
                                </span>
                                <button
                                  onClick={() => handleUpgradePlan(user.id, user.plan)}
                                  className={`p-1 rounded text-xs font-medium transition-colors ${
                                    user.plan === 'FREE'
                                      ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                      : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
                                  }`}
                                  title={user.plan === 'FREE' ? 'Upgrade to PRO' : 'Downgrade to FREE'}
                                >
                                  <ArrowUp className={`w-3 h-3 ${user.plan === 'PRO' ? 'rotate-180' : ''}`} />
                                </button>
                              </div>
                            </td>
                            <td className='py-3 px-4'>
                              <div className='flex items-center space-x-1'>
                                <span className='font-medium'>{user._count.notes}</span>
                                <span className='text-xs text-muted-foreground'>notes</span>
                              </div>
                            </td>
                            <td className='py-3 px-4'>
                              <div className='text-sm text-muted-foreground'>
                                {formatDate(user.createdAt)}
                              </div>
                            </td>
                            <td className='py-3 px-4'>
                              <div className='flex items-center space-x-1'>
                                <button
                                  className='p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors'
                                  title='View user details'
                                >
                                  <Eye className='w-4 h-4' />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className='p-1 hover:bg-muted rounded text-destructive hover:text-destructive/80 transition-colors'
                                  title='Delete user'
                                >
                                  <Trash2 className='w-4 h-4' />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                      <div className='text-center py-12'>
                        <Users className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                        <p className='text-muted-foreground'>No users found matching your criteria</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className='space-y-6'>
                {/* Notes Management Header */}
                <div className='bg-card rounded-xl border p-6'>
                  <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6'>
                    <div>
                      <h3 className='text-lg font-semibold flex items-center'>
                        <BookOpen className='w-5 h-5 mr-2 text-primary' />
                        Organization Notes
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        View and manage all notes created by team members
                      </p>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <button className='flex items-center space-x-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors'>
                        <Download className='w-4 h-4' />
                        <span>Export</span>
                      </button>
                      <div className='flex items-center space-x-2 bg-muted rounded-lg p-1'>
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-md transition-colors ${
                            viewMode === 'grid' 
                              ? 'bg-background shadow-sm' 
                              : 'hover:bg-background/50'
                          }`}
                          title='Grid view'
                        >
                          <BarChart3 className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-md transition-colors ${
                            viewMode === 'list' 
                              ? 'bg-background shadow-sm' 
                              : 'hover:bg-background/50'
                          }`}
                          title='List view'
                        >
                          <Eye className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className='flex flex-col lg:flex-row gap-4 mb-6'>
                    <div className='flex-1 relative'>
                      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                      <input
                        type='text'
                        placeholder='Search notes by title or content...'
                        value={notesSearchTerm}
                        onChange={(e) => setNotesSearchTerm(e.target.value)}
                        className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary'
                      />
                    </div>
                    <div className='flex space-x-3'>
                      <select
                        value={notesUserFilter}
                        onChange={(e) => setNotesUserFilter(e.target.value)}
                        className='px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary'
                      >
                        <option value='ALL'>All Authors</option>
                        {[...new Set(adminNotes.map(note => note.user.email))].map(email => (
                          <option key={email} value={email}>{email}</option>
                        ))}
                      </select>
                      <button
                        onClick={fetchData}
                        className='p-2 hover:bg-muted rounded-lg transition-colors'
                        title='Refresh notes'
                      >
                        <RefreshCw className='w-4 h-4' />
                      </button>
                    </div>
                  </div>

                  {/* Notes Statistics */}
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
                    <div className='bg-blue-500/5 border border-blue-500/20 rounded-lg p-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm text-blue-600 font-medium'>Total Notes</p>
                          <p className='text-2xl font-bold text-blue-700'>{adminNotes.length}</p>
                        </div>
                        <FileText className='w-8 h-8 text-blue-500' />
                      </div>
                    </div>
                    
                    <div className='bg-green-500/5 border border-green-500/20 rounded-lg p-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm text-green-600 font-medium'>Active Authors</p>
                          <p className='text-2xl font-bold text-green-700'>
                            {[...new Set(adminNotes.map(note => note.user.id))].length}
                          </p>
                        </div>
                        <Users className='w-8 h-8 text-green-500' />
                      </div>
                    </div>
                    
                    <div className='bg-purple-500/5 border border-purple-500/20 rounded-lg p-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm text-purple-600 font-medium'>This Week</p>
                          <p className='text-2xl font-bold text-purple-700'>
                            {adminNotes.filter(note => 
                              new Date(note.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                            ).length}
                          </p>
                        </div>
                        <Calendar className='w-8 h-8 text-purple-500' />
                      </div>
                    </div>
                    
                    <div className='bg-orange-500/5 border border-orange-500/20 rounded-lg p-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm text-orange-600 font-medium'>Avg. Length</p>
                          <p className='text-2xl font-bold text-orange-700'>
                            {adminNotes.length > 0 ? 
                              Math.round(adminNotes.reduce((acc, note) => acc + note.content.length, 0) / adminNotes.length)
                              : 0
                            }
                          </p>
                        </div>
                        <BarChart3 className='w-8 h-8 text-orange-500' />
                      </div>
                    </div>
                  </div>

                  {/* Notes Display */}
                  {filteredNotes.length > 0 ? (
                    viewMode === 'grid' ? (
                      /* Grid View */
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {filteredNotes.map((note) => (
                          <div 
                            key={note.id} 
                            className='group bg-gradient-to-br from-card via-card to-muted/10 border rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer'
                            onClick={() => setSelectedNote(note)}
                          >
                            <div className='flex items-start justify-between mb-4'>
                              <div className='flex items-center space-x-3'>
                                <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
                                  <span className='text-sm font-medium text-primary'>
                                    {note.user.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className='font-medium text-sm'>{note.user.email}</p>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    note.user.role === 'ADMIN' 
                                      ? 'bg-red-500/10 text-red-500' 
                                      : 'bg-blue-500/10 text-blue-500'
                                  }`}>
                                    {note.user.role}
                                  </span>
                                </div>
                              </div>
                              <div className='flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(note.content);
                                  }}
                                  className='p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors'
                                  title='Copy content'
                                >
                                  <Copy className='w-4 h-4' />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNote(note);
                                  }}
                                  className='p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors'
                                  title='View details'
                                >
                                  <Eye className='w-4 h-4' />
                                </button>
                              </div>
                            </div>
                            
                            <div className='mb-4'>
                              <h3 className='font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors'>
                                {note.title}
                              </h3>
                              <p className='text-sm text-muted-foreground line-clamp-3'>
                                {truncateContent(note.content)}
                              </p>
                            </div>
                            
                            <div className='flex items-center justify-between text-xs text-muted-foreground'>
                              <div className='flex items-center space-x-2'>
                                <Clock className='w-3 h-3' />
                                <span>{getTimeAgo(note.updatedAt)}</span>
                              </div>
                              <div className='flex items-center space-x-2'>
                                <span>v{note.version}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  note.user.plan === 'PRO' 
                                    ? 'bg-green-500/10 text-green-500' 
                                    : 'bg-gray-500/10 text-gray-500'
                                }`}>
                                  {note.user.plan}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* List View */
                      <div className='space-y-4'>
                        {filteredNotes.map((note) => (
                          <div 
                            key={note.id} 
                            className='group bg-card border rounded-xl p-6 hover:shadow-md transition-all duration-300 cursor-pointer'
                            onClick={() => setSelectedNote(note)}
                          >
                            <div className='flex items-start justify-between'>
                              <div className='flex items-start space-x-4 flex-1'>
                                <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center'>
                                  <span className='text-sm font-medium text-primary'>
                                    {note.user.email.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className='flex-1 min-w-0'>
                                  <div className='flex items-center space-x-3 mb-2'>
                                    <h3 className='font-semibold text-lg truncate group-hover:text-primary transition-colors'>
                                      {note.title}
                                    </h3>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      note.user.role === 'ADMIN' 
                                        ? 'bg-red-500/10 text-red-500' 
                                        : 'bg-blue-500/10 text-blue-500'
                                    }`}>
                                      {note.user.role}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      note.user.plan === 'PRO' 
                                        ? 'bg-green-500/10 text-green-500' 
                                        : 'bg-gray-500/10 text-gray-500'
                                    }`}>
                                      {note.user.plan}
                                    </span>
                                  </div>
                                  <p className='text-sm text-muted-foreground mb-3 line-clamp-2'>
                                    {truncateContent(note.content, 200)}
                                  </p>
                                  <div className='flex items-center space-x-4 text-xs text-muted-foreground'>
                                    <span>By {note.user.email}</span>
                                    <span>•</span>
                                    <span>Updated {getTimeAgo(note.updatedAt)}</span>
                                    <span>•</span>
                                    <span>Version {note.version}</span>
                                    <span>•</span>
                                    <span>{note.content.length} chars</span>
                                  </div>
                                </div>
                              </div>
                              <div className='flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(note.content);
                                  }}
                                  className='p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors'
                                  title='Copy content'
                                >
                                  <Copy className='w-4 h-4' />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNote(note);
                                  }}
                                  className='p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors'
                                  title='View details'
                                >
                                  <Eye className='w-4 h-4' />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className='text-center py-16'>
                      <BookOpen className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
                      <p className='text-lg font-medium text-muted-foreground mb-2'>No notes found</p>
                      <p className='text-sm text-muted-foreground'>
                        {notesSearchTerm || notesUserFilter !== 'ALL' 
                          ? 'Try adjusting your search filters' 
                          : 'Team members haven\'t created any notes yet'
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Note Detail Modal */}
                {selectedNote && (
                  <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-card rounded-xl border max-w-4xl w-full max-h-[90vh] overflow-hidden'>
                      <div className='flex items-center justify-between p-6 border-b border-border'>
                        <div className='flex items-center space-x-3'>
                          <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
                            <span className='text-sm font-medium text-primary'>
                              {selectedNote.user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h2 className='text-xl font-semibold'>{selectedNote.title}</h2>
                            <p className='text-sm text-muted-foreground'>by {selectedNote.user.email}</p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <button
                            onClick={() => copyToClipboard(selectedNote.content)}
                            className='p-2 hover:bg-muted rounded-lg transition-colors'
                            title='Copy content'
                          >
                            <Copy className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => setSelectedNote(null)}
                            className='p-2 hover:bg-muted rounded-lg transition-colors'
                          >
                            <XCircle className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                      
                      <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
                        <div className='flex items-center space-x-4 mb-6 text-sm text-muted-foreground'>
                          <div className='flex items-center space-x-2'>
                            <Calendar className='w-4 h-4' />
                            <span>Created {formatDate(selectedNote.createdAt)}</span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Clock className='w-4 h-4' />
                            <span>Updated {formatDate(selectedNote.updatedAt)}</span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <span>Version {selectedNote.version}</span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            selectedNote.user.role === 'ADMIN' 
                              ? 'bg-red-500/10 text-red-500' 
                              : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {selectedNote.user.role}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            selectedNote.user.plan === 'PRO' 
                              ? 'bg-green-500/10 text-green-500' 
                              : 'bg-gray-500/10 text-gray-500'
                          }`}>
                            {selectedNote.user.plan}
                          </span>
                        </div>
                        
                        <div className='prose prose-sm max-w-none'>
                          <pre className='whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground bg-muted/30 rounded-lg p-4'>
                            {selectedNote.content}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Invitations Tab */}
            {activeTab === 'invitations' && (
              <div className='space-y-6'>
                {/* Send Invitation */}
                <div className='bg-card rounded-xl border p-6'>
                  <h3 className='text-lg font-semibold mb-4 flex items-center'>
                    <UserPlus className='w-5 h-5 mr-2 text-primary' />
                    Send Team Invitation
                  </h3>
                  <p className='text-sm text-muted-foreground mb-4'>
                    Invite new members to join your organization with secure email invitations.
                  </p>
                  <form onSubmit={handleSendInvite} className='flex flex-col md:flex-row gap-4'>
                    <div className='flex-1'>
                      <input
                        type='email'
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder='Enter email address'
                        className='w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary'
                        required
                      />
                    </div>
                    <button
                      type='submit'
                      className='px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2'
                    >
                      <UserPlus className='w-4 h-4' />
                      <span>Send Invitation</span>
                    </button>
                  </form>
                </div>

                {/* Pending Invitations */}
                <div className='bg-card rounded-xl border p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold flex items-center'>
                      <Mail className='w-5 h-5 mr-2 text-primary' />
                      Pending Invitations
                    </h3>
                    <div className='flex items-center space-x-2'>
                      <span className='text-sm text-muted-foreground'>
                        {pendingInvitations.length} pending
                      </span>
                      <button
                        onClick={fetchData}
                        className='p-2 hover:bg-muted rounded-lg transition-colors'
                        title='Refresh invitations'
                      >
                        <RefreshCw className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                  
                  {pendingInvitations.length > 0 ? (
                    <div className='space-y-3'>
                      {pendingInvitations.map((invitation) => (
                        <div key={invitation.id} className='flex items-center justify-between p-4 bg-muted/30 rounded-lg'>
                          <div className='flex items-center space-x-3'>
                            <div className='w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center'>
                              <Mail className='w-5 h-5 text-orange-500' />
                            </div>
                            <div>
                              <p className='font-medium'>{invitation.email}</p>
                              <div className='flex items-center space-x-4 text-xs text-muted-foreground'>
                                <span>Sent {getTimeAgo(invitation.createdAt)}</span>
                                <span>Expires {formatDate(invitation.expiresAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              new Date(invitation.expiresAt) > new Date()
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {new Date(invitation.expiresAt) > new Date() ? 'Active' : 'Expired'}
                            </span>
                            <button
                              className='p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors'
                              title='Copy invitation link'
                            >
                              <Eye className='w-4 h-4' />
                            </button>
                            <button
                              className='p-1 hover:bg-muted rounded text-destructive hover:text-destructive/80 transition-colors'
                              title='Revoke invitation'
                            >
                              <XCircle className='w-4 h-4' />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-12'>
                      <Mail className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                      <p className='text-muted-foreground'>No pending invitations</p>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Send your first invitation to get started
                      </p>
                    </div>
                  )}
                </div>

                {/* Invitation Statistics */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='bg-card rounded-xl border p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-muted-foreground'>Total Sent</p>
                        <p className='text-2xl font-bold'>{pendingInvitations.length + users.length - 1}</p>
                      </div>
                      <div className='w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center'>
                        <Mail className='w-5 h-5 text-blue-500' />
                      </div>
                    </div>
                  </div>
                  
                  <div className='bg-card rounded-xl border p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-muted-foreground'>Pending</p>
                        <p className='text-2xl font-bold'>{pendingInvitations.length}</p>
                      </div>
                      <div className='w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center'>
                        <Clock className='w-5 h-5 text-orange-500' />
                      </div>
                    </div>
                  </div>
                  
                  <div className='bg-card rounded-xl border p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-muted-foreground'>Accepted</p>
                        <p className='text-2xl font-bold'>{users.length - 1}</p>
                      </div>
                      <div className='w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center'>
                        <CheckCircle className='w-5 h-5 text-green-500' />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && stats && (
              <div className='space-y-6'>
                {/* Organization Settings */}
                <div className='bg-card rounded-xl border p-6'>
                  <h3 className='text-lg font-semibold mb-4 flex items-center'>
                    <Building className='w-5 h-5 mr-2 text-primary' />
                    Organization Settings
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium mb-2'>Organization Name</label>
                        <input
                          type='text'
                          value={stats.tenant.name}
                          className='w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary'
                          readOnly
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium mb-2'>Organization Slug</label>
                        <input
                          type='text'
                          value={stats.tenant.slug}
                          className='w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary'
                          readOnly
                        />
                      </div>
                    </div>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium mb-2'>Current Plan</label>
                        <div className='flex items-center space-x-3'>
                          <span className={`px-3 py-2 rounded-lg font-medium ${
                            stats.tenant.plan === 'PRO' 
                              ? 'bg-green-500/10 text-green-500' 
                              : 'bg-gray-500/10 text-gray-500'
                          }`}>
                            {stats.tenant.plan}
                          </span>
                          <button className='px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors'>
                            {stats.tenant.plan === 'FREE' ? 'Upgrade to Pro' : 'Manage Plan'}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium mb-2'>Organization ID</label>
                        <input
                          type='text'
                          value={stats.tenant.id}
                          className='w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground'
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
    </div>
  );
};

export default AdminDashboard;
