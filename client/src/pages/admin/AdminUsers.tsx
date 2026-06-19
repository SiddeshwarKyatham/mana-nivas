import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { api } from '../../lib/api';
import '../AdminDashboard.css';

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
      const data = await api.get('/users');
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
    return (
      <div className="admin-dashboard-container admin-subpage">
        <LoadingSpinner size="large" message="Loading users..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-container admin-subpage">
        <div className="admin-table-wrapper">
          <p className="admin-inline-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container admin-subpage">
      <div className="admin-table-wrapper">
        <div className="admin-kpis">
          <div className="admin-kpi">Total: {users.length}</div>
        </div>
        <div className="admin-table-scroll">
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
      </div>
    </div>
  );
};

export default AdminUsers;
