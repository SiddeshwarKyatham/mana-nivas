import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { supabase } from '../../supabaseClient';

interface AdminUser {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  created_at: string | null;
}

const AdminUsers: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw new Error(fetchError.message || 'Failed to fetch users');
      setUsers((data as AdminUser[]) || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user || user.role !== 'admin') return;
    fetchUsers();
  }, [authLoading, isAuthenticated, user]);

  if (authLoading || loading) {
    return <LoadingSpinner size="large" message="Loading users..." />;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="admin-table-wrapper">
      <h1>Users</h1>
      <div style={{ marginBottom: '1rem' }}>Total: {users.length}</div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.full_name || 'Unknown'}</td>
              <td>{u.phone || '-'}</td>
              <td>{u.role}</td>
              <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
