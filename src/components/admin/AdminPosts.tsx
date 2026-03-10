import { useState, useEffect } from 'react';
import { Newspaper, Plus, Edit2, Trash2, Eye, Calendar, User, Tag } from 'lucide-react';
import AdminModal, { FormSection, FormField } from './AdminModal';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  authorId: string;
  status: 'draft' | 'published';
  createdAt?: any;
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Partial<Post>>({
    title: '',
    excerpt: '',
    content: '',
    status: 'draft'
  });

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'posts'), (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(postsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });
    return () => unsubscribe();
  }, [user]);

  const handleOpenModal = (post?: Post) => {
    if (post) {
      setEditingPost(post);
      setFormData(post);
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        status: 'draft'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingPost) {
        const postRef = doc(db, 'posts', editingPost.id);
        await setDoc(postRef, {
          ...formData,
          authorId: user.uid,
          createdAt: editingPost.createdAt || serverTimestamp()
        }, { merge: true });
      } else {
        const newPostRef = doc(collection(db, 'posts'));
        await setDoc(newPostRef, {
          ...formData,
          authorId: user.uid,
          createdAt: serverTimestamp()
        });
      }
      handleCloseModal();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'posts');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteDoc(doc(db, 'posts', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `posts/${id}`);
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-starforge-gold/10 flex items-center justify-center border border-starforge-gold/20">
            <Newspaper className="w-6 h-6 text-starforge-gold" />
          </div>
          <div>
            <h2 className="font-heading text-2xl text-text-primary">Posts CMS</h2>
            <p className="font-ui text-text-secondary text-sm">Manage blog entries, news, and platform updates.</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-starforge-gold text-void-black rounded-full font-ui font-medium hover:bg-starforge-gold/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Post
        </button>
      </div>

      {/* Posts List */}
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="group bg-surface border border-border/50 rounded-2xl p-6 hover:border-starforge-gold/30 transition-all"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Content Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-ui uppercase tracking-wider ${
                    post.status === 'published' ? 'bg-aurora-teal/20 text-aurora-teal' : 'bg-starforge-gold/20 text-starforge-gold'
                  }`}>
                    {post.status}
                  </span>
                </div>
                <h3 className="font-heading text-xl text-text-primary mb-2 truncate">{post.title}</h3>
                <p className="text-text-secondary text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs font-ui text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {post.authorId}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col items-center justify-end gap-2 border-t lg:border-t-0 lg:border-l border-border/50 pt-4 lg:pt-0 lg:pl-6">
                <button
                  onClick={() => handleOpenModal(post)}
                  className="p-2 text-text-muted hover:text-starforge-gold hover:bg-starforge-gold/10 rounded-lg transition-all"
                  title="Edit Post"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 text-text-muted hover:text-forge-red hover:bg-forge-red/10 rounded-lg transition-all"
                  title="Delete Post"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            No posts found. Create one to get started.
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPost ? 'Edit Post' : 'Create New Post'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Content Information">
            <FormField label="Post Title">
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all"
                placeholder="Enter a compelling title..."
              />
            </FormField>
            <FormField label="Excerpt">
              <textarea
                required
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all h-24 resize-none"
                placeholder="A brief summary for the list view..."
              />
            </FormField>
            <FormField label="Full Content (Markdown)">
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary font-mono text-sm focus:border-starforge-gold/50 outline-none transition-all h-64 resize-none"
                placeholder="# Start writing your story..."
              />
            </FormField>
          </FormSection>

          <FormSection title="Metadata & Settings">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Status">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                  className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </FormField>
            </div>
          </FormSection>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest hover:bg-starforge-gold/90 transition-all"
            >
              {editingPost ? 'Update Post' : 'Publish Post'}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-8 py-4 bg-surface-elevated text-text-primary rounded-xl font-ui font-bold uppercase tracking-widest border border-border/50 hover:bg-surface transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

