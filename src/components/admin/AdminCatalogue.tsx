import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

interface Constellation {
  id: string;
  name: string;
  color: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  codemark: string;
  synopsis: string;
  editionType: string;
  format: string;
  price: number;
  constellationId?: string;
  themes?: string[];
  connections?: string[];
}

export default function AdminCatalogue() {
  const [books, setBooks] = useState<Book[]>([]);
  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBook, setCurrentBook] = useState<Partial<Book>>({});
  const [themesInput, setThemesInput] = useState('');
  const [connectionsInput, setConnectionsInput] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'books'), (snapshot) => {
      const booksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[];
      setBooks(booksData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'books');
      setLoading(false);
    });

    const unsubConst = onSnapshot(collection(db, 'constellations'), (snapshot) => {
      setConstellations(snapshot.docs.map(d => ({ id: d.id, name: d.data().name, color: d.data().color })));
    });

    return () => { unsubscribe(); unsubConst(); };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bookData = {
        title: currentBook.title,
        author: currentBook.author,
        cover: currentBook.cover,
        codemark: currentBook.codemark,
        synopsis: currentBook.synopsis,
        editionType: currentBook.editionType,
        format: currentBook.format,
        price: Number(currentBook.price),
        constellationId: currentBook.constellationId || '',
        themes: themesInput.split(',').map(t => t.trim()).filter(Boolean),
        connections: connectionsInput.split(',').map(c => c.trim()).filter(Boolean),
      };

      if (currentBook.id) {
        await updateDoc(doc(db, 'books', currentBook.id), bookData);
      } else {
        await addDoc(collection(db, 'books'), {
          ...bookData,
          createdAt: serverTimestamp()
        });
      }
      setIsEditing(false);
      setCurrentBook({});
    } catch (error) {
      handleFirestoreError(error, currentBook.id ? OperationType.UPDATE : OperationType.CREATE, currentBook.id ? `books/${currentBook.id}` : 'books');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteDoc(doc(db, 'books', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `books/${id}`);
      }
    }
  };

  if (loading) {
    return <div className="text-text-primary">Loading catalog...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl text-text-primary">Catalog Management</h2>
        <button
          onClick={() => {
            setCurrentBook({
              title: '', author: '', cover: '', codemark: '', synopsis: '', editionType: 'Standard', format: 'Paperback', price: 0, constellationId: '', themes: [], connections: []
            });
            setThemesInput('');
            setConnectionsInput('');
            setIsEditing(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-aurora-teal text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-teal-400 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Book
        </button>
      </div>

      {isEditing ? (
        <div className="bg-surface border border-border p-6 rounded-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-heading text-xl text-text-primary">{currentBook.id ? 'Edit Book' : 'New Book'}</h3>
            <button onClick={() => setIsEditing(false)} className="text-text-muted hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-ui text-sm text-text-secondary mb-1">Title</label>
                <input type="text" required value={currentBook.title || ''}
                  onChange={e => setCurrentBook({ ...currentBook, title: e.target.value })}
                  className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-aurora-teal outline-none" />
              </div>
              <div>
                <label className="block font-ui text-sm text-text-secondary mb-1">Author</label>
                <input type="text" required value={currentBook.author || ''}
                  onChange={e => setCurrentBook({ ...currentBook, author: e.target.value })}
                  className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-aurora-teal outline-none" />
              </div>
              <div>
                <label className="block font-ui text-sm text-text-secondary mb-1">Cover URL</label>
                <input type="url" required value={currentBook.cover || ''}
                  onChange={e => setCurrentBook({ ...currentBook, cover: e.target.value })}
                  className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-aurora-teal outline-none" />
              </div>
              <div>
                <label className="block font-ui text-sm text-text-secondary mb-1">Codemark (Genre)</label>
                <input type="text" required value={currentBook.codemark || ''}
                  onChange={e => setCurrentBook({ ...currentBook, codemark: e.target.value })}
                  className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-aurora-teal outline-none" />
              </div>
              <div>
                <label className="block font-ui text-sm text-text-secondary mb-1">Edition Type</label>
                <input type="text" required value={currentBook.editionType || ''}
                  onChange={e => setCurrentBook({ ...currentBook, editionType: e.target.value })}
                  className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-aurora-teal outline-none" />
              </div>
              <div>
                <label className="block font-ui text-sm text-text-secondary mb-1">Format</label>
                <input type="text" required value={currentBook.format || ''}
                  onChange={e => setCurrentBook({ ...currentBook, format: e.target.value })}
                  className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-aurora-teal outline-none" />
              </div>
              <div>
                <label className="block font-ui text-sm text-text-secondary mb-1">Price</label>
                <input type="number" step="0.01" required value={currentBook.price || ''}
                  onChange={e => setCurrentBook({ ...currentBook, price: Number(e.target.value) })}
                  className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-aurora-teal outline-none" />
              </div>
              <div>
                <label className="block font-ui text-sm text-text-secondary mb-1">Constellation</label>
                <select value={currentBook.constellationId || ''}
                  onChange={e => setCurrentBook({ ...currentBook, constellationId: e.target.value })}
                  className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-aurora-teal outline-none">
                  <option value="">None</option>
                  {constellations.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-ui text-sm text-text-secondary mb-1">Synopsis</label>
              <textarea required rows={3} value={currentBook.synopsis || ''}
                onChange={e => setCurrentBook({ ...currentBook, synopsis: e.target.value })}
                className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-aurora-teal outline-none resize-none"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-ui text-sm text-text-secondary mb-1">Themes (comma-separated)</label>
                <input type="text" placeholder="e.g. diaspora, identity, magic" value={themesInput}
                  onChange={e => setThemesInput(e.target.value)}
                  className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-aurora-teal outline-none" />
              </div>
              <div>
                <label className="block font-ui text-sm text-text-secondary mb-1">Connections (book IDs, comma-separated)</label>
                <input type="text" placeholder="e.g. abc123, def456" value={connectionsInput}
                  onChange={e => setConnectionsInput(e.target.value)}
                  className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-aurora-teal outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary font-ui text-sm uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-aurora-teal text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-teal-400 transition-colors"
              >
                <Save className="w-4 h-4" /> Save Book
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-void-black border-b border-border">
                  <th className="p-4 font-ui text-xs text-text-secondary uppercase tracking-wider">Cover</th>
                  <th className="p-4 font-ui text-xs text-text-secondary uppercase tracking-wider">Title & Author</th>
                  <th className="p-4 font-ui text-xs text-text-secondary uppercase tracking-wider">Codemark</th>
                  <th className="p-4 font-ui text-xs text-text-secondary uppercase tracking-wider">Price</th>
                  <th className="p-4 font-ui text-xs text-text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book.id} className="border-b border-border hover:bg-void-black/50 transition-colors">
                    <td className="p-4">
                      <img src={book.cover} alt={book.title} className="w-12 h-16 object-cover rounded-sm" referrerPolicy="no-referrer" />
                    </td>
                    <td className="p-4">
                      <p className="font-heading text-text-primary">{book.title}</p>
                      <p className="font-ui text-xs text-text-secondary">{book.author}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-ui text-xs text-starforge-gold bg-starforge-gold/10 px-2 py-1 rounded-sm">
                        {book.codemark}
                      </span>
                    </td>
                    <td className="p-4 font-ui text-sm text-text-primary">
                      ${book.price.toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => {
                            setCurrentBook(book);
                            setThemesInput((book.themes || []).join(', '));
                            setConnectionsInput((book.connections || []).join(', '));
                            setIsEditing(true);
                          }}
                          className="text-text-muted hover:text-aurora-teal transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="text-text-muted hover:text-forge-red transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center font-ui text-text-muted">
                      No books found in the catalog. Add one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
