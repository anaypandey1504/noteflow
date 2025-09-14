'use client';

import { Trash2, Calendar, Edit3 } from 'lucide-react';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NotesListProps {
  notes: Note[];
  loading: boolean;
  onDelete: (id: number) => void;
}

export default function NotesList({ notes, loading, onDelete }: NotesListProps) {
  if (loading) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold gradient-text mb-6 flex items-center">
          <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
            📝
          </span>
          Your Notes
        </h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold gradient-text mb-6 flex items-center">
          <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
            📝
          </span>
          Your Notes
        </h2>
        <div className="text-center py-12">
          <div className="text-8xl mb-6 animate-float">📝</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No notes yet</h3>
          <p className="text-gray-500">Create your first note to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold gradient-text mb-6 flex items-center">
        <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
          📝
        </span>
        Your Notes ({notes.length})
      </h2>
      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-gradient-to-r from-white to-blue-50 border border-blue-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-gray-900 text-lg">{note.title}</h3>
              <button
                onClick={() => onDelete(note.id)}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">{note.content}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Created: {new Date(note.created_at).toLocaleDateString()}</span>
              </div>
              {note.updated_at !== note.created_at && (
                <div className="flex items-center space-x-1">
                  <Edit3 className="w-3 h-3" />
                  <span>Updated: {new Date(note.updated_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
