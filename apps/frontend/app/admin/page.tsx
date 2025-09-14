'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, BarChart3, Shield, Mail, Trash2, Crown, 
  RefreshCw, Award, Building, ArrowUp
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        ApiClient.getTenantUsers(),
        ApiClient.getTenantStats()
      ]);

      if (usersRes.success) setUsers((usersRes.data as any).users);
      if (statsRes.success) setStats((statsRes.data as any).stats);
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
    { id: 'invitations', label: 'Invitations', icon: Mail }
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
              <div className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  <div className='bg-card rounded-xl border p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-muted-foreground'>Total Users</p>
                        <p className='text-3xl font-bold'>{stats.userCount}</p>
                      </div>
                      <div className='w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center'>
                        <Users className='w-6 h-6 text-blue-500' />
                      </div>
                    </div>
                  </div>
                  
                  <div className='bg-card rounded-xl border p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-muted-foreground'>Total Notes</p>
                        <p className='text-3xl font-bold'>{stats.noteCount}</p>
                      </div>
                      <div className='w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center'>
                        <BarChart3 className='w-6 h-6 text-green-500' />
                      </div>
                    </div>
                  </div>
                  
                  <div className='bg-card rounded-xl border p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-muted-foreground'>Pending Invites</p>
                        <p className='text-3xl font-bold'>{stats.invitationCount}</p>
                      </div>
                      <div className='w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center'>
                        <Mail className='w-6 h-6 text-orange-500' />
                      </div>
                    </div>
                  </div>
                  
                  <div className='bg-card rounded-xl border p-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm font-medium text-muted-foreground'>Current Plan</p>
                        <p className='text-2xl font-bold capitalize'>{stats.tenant.plan}</p>
                      </div>
                      <div className='w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center'>
                        <Crown className='w-6 h-6 text-purple-500' />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className='space-y-6'>
                <div className='bg-card rounded-xl border p-6'>
                  <h3 className='text-lg font-semibold mb-4'>User Management</h3>
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead>
                        <tr className='border-b border-border'>
                          <th className='text-left py-3 px-4 font-medium text-muted-foreground'>User</th>
                          <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Role</th>
                          <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Plan</th>
                          <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Notes</th>
                          <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className='border-b border-border/50'>
                            <td className='py-3 px-4'>
                              <div className='flex items-center space-x-3'>
                                <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                                  <Users className='w-4 h-4 text-primary' />
                                </div>
                                <span className='font-medium'>{user.email}</span>
                              </div>
                            </td>
                            <td className='py-3 px-4'>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'ADMIN' 
                                  ? 'bg-red-500/10 text-red-500' 
                                  : 'bg-blue-500/10 text-blue-500'
                              }`}>
                                {user.role}
                              </span>
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
                            <td className='py-3 px-4'>{user._count.notes}</td>
                            <td className='py-3 px-4'>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className='p-1 hover:bg-muted rounded text-destructive'
                              >
                                <Trash2 className='w-4 h-4' />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Invitations Tab */}
            {activeTab === 'invitations' && (
              <div className='space-y-6'>
                <div className='bg-card rounded-xl border p-6'>
                  <h3 className='text-lg font-semibold mb-4'>Send Invitation</h3>
                  <form onSubmit={handleSendInvite} className='flex space-x-4'>
                    <input
                      type='email'
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder='Enter email address'
                      className='flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary'
                      required
                    />
                    <button
                      type='submit'
                      className='px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2'
                    >
                      <UserPlus className='w-4 h-4' />
                      <span>Send Invite</span>
                    </button>
                  </form>
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
