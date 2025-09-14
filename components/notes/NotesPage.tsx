import { useState, useEffect } from "react";

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NotesPageProps {
  userPlan: "free" | "pro";
  authToken: string | null;
}

export const NotesPage = ({ userPlan, authToken }: NotesPageProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load notes from API
  useEffect(() => {
    const fetchNotes = async () => {
      if (!authToken) return;
      
      try {
        const response = await fetch('/api/notes', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (response.ok) {
          const notesData = await response.json();
          setNotes(notesData);
        } else {
          alert("Failed to load notes");
        }
      } catch (error) {
        alert("Network error loading notes");
      }
    };

    fetchNotes();
  }, [authToken]);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNote = async () => {
    if (!authToken || !newNoteTitle.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newNoteTitle, content: newNoteContent }),
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes(prev => [newNote, ...prev]);
        setIsCreateModalOpen(false);
        setNewNoteTitle("");
        setNewNoteContent("");
        alert("Note created successfully");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to create note");
      }
    } catch (error) {
      alert("Network error creating note");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!authToken) return;
    
    if (!confirm("Are you sure you want to delete this note?")) return;
    
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
        alert("Note deleted successfully");
      } else {
        alert("Failed to delete note");
      }
    } catch (error) {
      alert("Network error deleting note");
    }
  };

  // Free plan limitations
  const noteLimit = userPlan === "free" ? 3 : Infinity;
  const canCreateNote = notes.length < noteLimit;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>My Notes</h1>
          <p style={{ color: "#666", margin: "5px 0 0 0" }}>Organize your thoughts and ideas</p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {userPlan === "free" && (
            <span style={{ 
              padding: "4px 8px", 
              backgroundColor: "#f8f9fa", 
              border: "1px solid #dee2e6", 
              borderRadius: "4px", 
              fontSize: "12px" 
            }}>
              {notes.length}/{noteLimit} notes used
            </span>
          )}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!canCreateNote}
            style={{
              padding: "8px 16px",
              backgroundColor: canCreateNote ? "#007bff" : "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: canCreateNote ? "pointer" : "not-allowed"
            }}
          >
            + New Note
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px"
          }}
        />
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                border: "1px solid #eee"
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", fontWeight: "600" }}>{note.title}</h3>
              <p style={{ margin: "0 0 15px 0", color: "#666", lineHeight: "1.5" }}>{note.content}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <small style={{ color: "#999" }}>
                  {new Date(note.created_at).toLocaleDateString()}
                </small>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : searchQuery ? (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "8px" }}>
          <h3>No notes found</h3>
          <p style={{ color: "#666" }}>Try adjusting your search terms</p>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "8px" }}>
          <h3>No notes yet</h3>
          <p style={{ color: "#666", marginBottom: "20px" }}>Create your first note to get started</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!canCreateNote}
            style={{
              padding: "10px 20px",
              backgroundColor: canCreateNote ? "#007bff" : "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: canCreateNote ? "pointer" : "not-allowed"
            }}
          >
            Create Note
          </button>
        </div>
      )}

      {/* Plan Limitation Warning */}
      {!canCreateNote && userPlan === "free" && (
        <div style={{ 
          marginTop: "20px", 
          padding: "15px", 
          backgroundColor: "#fff3cd", 
          border: "1px solid #ffeaa7", 
          borderRadius: "8px" 
        }}>
          <h4 style={{ margin: "0 0 5px 0", color: "#856404" }}>Note limit reached</h4>
          <p style={{ margin: 0, color: "#856404", fontSize: "14px" }}>
            Upgrade to Pro for unlimited notes and premium features
          </p>
        </div>
      )}

      {/* Create Note Modal */}
      {isCreateModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            width: "90%",
            maxWidth: "500px"
          }}>
            <h2 style={{ margin: "0 0 20px 0" }}>Create New Note</h2>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Title</label>
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
                placeholder="Enter note title"
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Content</label>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  resize: "vertical"
                }}
                placeholder="Enter note content"
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewNoteTitle("");
                  setNewNoteContent("");
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNote}
                disabled={isLoading || !newNoteTitle.trim()}
                style={{
                  padding: "8px 16px",
                  backgroundColor: (!isLoading && newNoteTitle.trim()) ? "#007bff" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: (!isLoading && newNoteTitle.trim()) ? "pointer" : "not-allowed"
                }}
              >
                {isLoading ? "Creating..." : "Create Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

