'use client';

import { useState } from 'react';
import { Users, UserPlus, Mail, Shield } from 'lucide-react';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'member';
}

interface UserManagementProps {
  userRole: string;
}

export default function UserManagement({ userRole }: UserManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Only admins can see this component
  if (userRole !== 'admin') {
    return null;
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`User ${email} invited successfully! Temporary password: ${data.user.tempPassword}`);
        setEmail('');
        setRole('member');
      } else {
        setError(data.error || 'Failed to invite user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold gradient-text mb-6 flex items-center">
        <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
          <Users className="w-4 h-4 text-white" />
        </span>
        User Management
      </h2>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary w-full flex items-center justify-center space-x-2 mb-6"
      >
        <UserPlus className="w-4 h-4" />
        <span>Invite New User</span>
      </button>

      {isOpen && (
        <form onSubmit={handleInviteUser} className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div>
            <label htmlFor="invite-email" className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <input
              id="invite-email"
              type="email"
              className="input-field"
              placeholder="Enter user's email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="invite-role" className="block text-sm font-semibold text-gray-700 mb-2">
              <Shield className="w-4 h-4 inline mr-1" />
              Role
            </label>
            <select
              id="invite-role"
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
            >
              <option value="member">Member - Can manage notes</option>
              <option value="admin">Admin - Can invite users and upgrade</option>
            </select>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Inviting...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Send Invite</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
