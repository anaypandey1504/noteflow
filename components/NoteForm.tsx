'use client';

import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';

interface NoteFormProps {
  onCreate: (title: string, content: string) => void;
}

export default function NoteForm({ onCreate }: NoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      await onCreate(title.trim(), content.trim());
      setTitle('');
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold gradient-text mb-6 flex items-center">
        <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
          <Plus className="w-4 h-4 text-white" />
        </span>
        Create New Note
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="input-field"
            placeholder="What's this note about?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
            Content
          </label>
          <textarea
            id="content"
            rows={8}
            className="input-field resize-none"
            placeholder="Write your thoughts here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>Create Note</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
