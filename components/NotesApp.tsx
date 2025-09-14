'use client';

import { useState, useEffect } from 'react';
import NotesList from './NotesList';
import NoteForm from './NoteForm';
import UpgradeModal from './UpgradeModal';
import UserManagement from './UserManagement';
import { Crown, Users, LogOut, Sparkles } from 'lucide-react';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'member';
  tenant_slug: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NotesAppProps {
  user: User;
  onLogout: () => void;
}

export default function NotesApp({ user, onLogout }: NotesAppProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState('free');

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      } else {
        const errorData = await response.json();
        if (response.status === 403 && errorData.error.includes('Free plan limited')) {
          setShowUpgradeModal(true);
        } else {
          setError(errorData.error);
        }
      }
    } catch (err) {
      setError('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async (title: string, content: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes([newNote, ...notes]);
      } else {
        const errorData = await response.json();
        if (response.status === 403 && errorData.error.includes('Free plan limited')) {
          setShowUpgradeModal(true);
        } else {
          setError(errorData.error);
        }
      }
    } catch (err) {
      setError('Failed to create note');
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (err) {
      setError('Failed to delete note');
    }
  };

  const handleUpgrade = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tenants/${user.tenant_slug}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSubscriptionPlan('pro');
        setShowUpgradeModal(false);
        // Refresh notes to remove any limit restrictions
        fetchNotes();
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (err) {
      setError('Failed to upgrade subscription');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📝</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Notes Dashboard</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="capitalize">{user.tenant_slug}</span>
                  <span>•</span>
                  <span className="capitalize">{user.role}</span>
                  <span>•</span>
                  <span className={`font-semibold ${subscriptionPlan === 'pro' ? 'text-green-600' : 'text-orange-600'}`}>
                    {subscriptionPlan === 'pro' ? (
                      <span className="flex items-center">
                        <Crown className="w-4 h-4 mr-1" />
                        Pro
                      </span>
                    ) : (
                      'Free'
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {subscriptionPlan === 'free' && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="btn-success flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Upgrade to Pro</span>
                </button>
              )}
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user.email}</div>
                  <div className="text-xs text-gray-500">
                    {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                    {subscriptionPlan === 'free' && ' / 3 limit'}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <NotesList
              notes={notes}
              loading={loading}
              onDelete={handleDeleteNote}
            />
          </div>
          
          <div className="space-y-6">
            <NoteForm onCreate={handleCreateNote} />
            <UserManagement userRole={user.role} />
          </div>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgrade}
          userRole={user.role}
        />
      </main>
    </div>
  );
}
