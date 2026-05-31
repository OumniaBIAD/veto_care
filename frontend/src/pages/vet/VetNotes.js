import React, { useState, useEffect } from 'react';

// VetNotes - a lightweight notebook for the veterinarian session
// Notes are stored in localStorage under the key "vet_notes" and cleared on logout.

export default function VetNotes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  // Load notes from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('vet_notes');
    if (stored) {
      try {
        setNotes(JSON.parse(stored));
      } catch {
        // If parsing fails, clear corrupted data
        localStorage.removeItem('vet_notes');
        setNotes([]);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('vet_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!newNote.trim()) return;
    const noteObj = {
      id: Date.now(),
      text: newNote.trim(),
      createdAt: new Date().toISOString()
    };
    setNotes([noteObj, ...notes]);
    setNewNote('');
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="vet-notes container-lg" style={{ maxWidth: '800px', margin: 'auto', padding: 'var(--space-6)' }}>
      <h2 className="mb-4" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-primary)' }}>🗒️ Carnet de notes</h2>
      <div className="flex gap-2 mb-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Écrire une nouvelle note..."
          rows={3}
          className="flex-1 p-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          style={{ resize: 'vertical', width: '100%' }}
        />
        <button
          onClick={addNote}
          className="btn btn-primary btn-sm mt-auto"
          style={{ height: 'fit-content', alignSelf: 'flex-end' }}
        >
          Ajouter
        </button>
      </div>
      {notes.length === 0 ? (
        <p className="text-gray-400">Aucune note pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="p-3 rounded bg-gray-900 border border-gray-700 relative">
              <button
                onClick={() => deleteNote(note.id)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                aria-label="Supprimer la note"
                title="Supprimer"
              >
                ✕
              </button>
              <p className="whitespace-pre-wrap text-white" style={{ wordBreak: 'break-word' }}>{note.text}</p>
              <small className="block text-gray-500 mt-2" style={{ fontSize: '0.75rem' }}>
                {new Date(note.createdAt).toLocaleString('fr-FR')}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
