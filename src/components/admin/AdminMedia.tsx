import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Search, Upload, Trash2, Copy, Check, Grid, List as ListIcon, X, FileImage, Film, File, AlertCircle } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../../firebase';

interface MediaItem {
    id: string;
    name: string;
    url: string;
    type: string; // image/jpeg, video/mp4, etc.
    size: number;
    altText: string;
    storagePath: string;
    uploadedBy: string;
    createdAt: any;
}


type ViewMode = 'grid' | 'list';

export default function AdminMedia() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [uploading, setUploading] = useState(false);
    const [editItem, setEditItem] = useState<MediaItem | null>(null);
    const [editAlt, setEditAlt] = useState('');
    const [copied, setCopied] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'mediaLibrary'), snap => {
            setMedia(snap.docs.map(d => ({ id: d.id, ...d.data() } as MediaItem)));
        }, () => {});
        return () => unsub();
    }, []);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const path = `media/${Date.now()}_${file.name}`;
            try {
                const storageRef = ref(storage, path);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                await addDoc(collection(db, 'mediaLibrary'), {
                    name: file.name, url, type: file.type, size: file.size, altText: '', storagePath: path,
                    uploadedBy: auth.currentUser?.displayName || 'Admin', createdAt: serverTimestamp(),
                });
            } catch { /* ignore */ }
        }
        setUploading(false);
    };

    const deleteItem = async (item: MediaItem) => {
        if (!window.confirm(`Delete "${item.name}"?`)) return;
        try {
            if (item.storagePath) await deleteObject(ref(storage, item.storagePath));
            await deleteDoc(doc(db, 'mediaLibrary', item.id));
        } catch { /* ignore */ }
    };

    const bulkDelete = async () => {
        if (!window.confirm(`Delete ${selected.size} items?`)) return;
        for (const id of selected) {
            const item = media.find(m => m.id === id);
            if (item) {
                try {
                    if (item.storagePath) await deleteObject(ref(storage, item.storagePath));
                    await deleteDoc(doc(db, 'mediaLibrary', item.id));
                } catch { /* ignore */ }
            }
        }
        setSelected(new Set());
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopied(url);
        setTimeout(() => setCopied(null), 2000);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    const filtered = media.filter(m => {
        if (search) {
            const q = search.toLowerCase();
            return m.name.toLowerCase().includes(q) || m.altText.toLowerCase().includes(q);
        }
        return true;
    });

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="font-display text-3xl text-text-primary uppercase tracking-widest">Media Library</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-sm ${viewMode === 'grid' ? 'bg-starforge-gold text-void-black' : 'text-text-muted border border-border'}`}>
                        <Grid className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-sm ${viewMode === 'list' ? 'bg-starforge-gold text-void-black' : 'text-text-muted border border-border'}`}>
                        <ListIcon className="w-4 h-4" />
                    </button>
                    {selected.size > 0 && (
                        <button onClick={bulkDelete} className="flex items-center gap-1.5 px-3 py-2 bg-forge-red/10 text-forge-red font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-forge-red/20">
                            <Trash2 className="w-3.5 h-3.5" /> Delete ({selected.size})
                        </button>
                    )}
                    <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => handleUpload(e.target.files)} />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                        className="flex items-center gap-1.5 px-3 py-2 bg-starforge-gold text-void-black font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-yellow-500 disabled:opacity-50">
                        <Upload className="w-3.5 h-3.5" /> {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface border border-border rounded-sm p-3">
                    <p className="font-ui text-[10px] text-text-muted uppercase">Total Files</p>
                    <p className="font-display text-xl text-text-primary">{media.length}</p>
                </div>
                <div className="bg-surface border border-border rounded-sm p-3">
                    <p className="font-ui text-[10px] text-text-muted uppercase">Images</p>
                    <p className="font-display text-xl text-text-primary">{media.filter(m => m.type.startsWith('image')).length}</p>
                </div>
                <div className="bg-surface border border-border rounded-sm p-3">
                    <p className="font-ui text-[10px] text-text-muted uppercase">Total Size</p>
                    <p className="font-display text-xl text-text-primary">{formatSize(media.reduce((s, m) => s + m.size, 0))}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="text" placeholder="Search by filename or alt text..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full bg-surface border border-border rounded-sm pl-10 pr-4 py-2.5 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold" />
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filtered.map(item => (
                        <div key={item.id} className={`bg-surface border rounded-sm overflow-hidden group cursor-pointer transition-colors ${selected.has(item.id) ? 'border-starforge-gold' : 'border-border hover:border-starforge-gold/30'}`}>
                            <div className="aspect-square bg-void-black relative overflow-hidden" onClick={() => toggleSelect(item.id)}>
                                {item.type.startsWith('image') ? (
                                    <img src={item.url} alt={item.altText} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><Film className="w-8 h-8 text-text-muted/30" /></div>
                                )}
                                {selected.has(item.id) && <div className="absolute inset-0 bg-starforge-gold/20 flex items-center justify-center"><Check className="w-8 h-8 text-starforge-gold" /></div>}
                                {!item.altText && <div className="absolute top-1 right-1" title="Missing alt text"><AlertCircle className="w-3.5 h-3.5 text-amber-400" /></div>}
                            </div>
                            <div className="p-2">
                                <p className="font-ui text-[10px] text-text-primary truncate">{item.name}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="font-mono text-[8px] text-text-muted">{formatSize(item.size)}</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => copyUrl(item.url)} className="text-text-muted hover:text-starforge-gold" title="Copy URL">
                                            {copied === item.url ? <Check className="w-3 h-3 text-aurora-teal" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                        <button onClick={() => { setEditItem(item); setEditAlt(item.altText); }} className="text-text-muted hover:text-starforge-gold" title="Edit"><Image className="w-3 h-3" /></button>
                                        <button onClick={() => deleteItem(item)} className="text-text-muted hover:text-forge-red" title="Delete"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-surface border border-border rounded-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead><tr className="bg-deep-space border-b border-border">
                            <th className="p-3 w-8"></th>
                            <th className="p-3 font-ui text-[10px] text-text-muted uppercase">Preview</th>
                            <th className="p-3 font-ui text-[10px] text-text-muted uppercase">Name</th>
                            <th className="p-3 font-ui text-[10px] text-text-muted uppercase">Alt Text</th>
                            <th className="p-3 font-ui text-[10px] text-text-muted uppercase">Size</th>
                            <th className="p-3 font-ui text-[10px] text-text-muted uppercase">Actions</th>
                        </tr></thead>
                        <tbody>{filtered.map(item => (
                            <tr key={item.id} className="border-b border-border last:border-0 hover:bg-void-black/30">
                                <td className="p-3"><input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="accent-starforge-gold" /></td>
                                <td className="p-3"><div className="w-10 h-10 bg-void-black rounded-sm overflow-hidden">{item.type.startsWith('image') ? <img src={item.url} alt="" className="w-full h-full object-cover" /> : <File className="w-5 h-5 text-text-muted m-auto mt-2.5" />}</div></td>
                                <td className="p-3 font-ui text-xs text-text-primary">{item.name}</td>
                                <td className="p-3 font-ui text-xs text-text-muted">{item.altText || <span className="text-amber-400 text-[10px]">Missing</span>}</td>
                                <td className="p-3 font-mono text-[10px] text-text-muted">{formatSize(item.size)}</td>
                                <td className="p-3 flex gap-2">
                                    <button onClick={() => copyUrl(item.url)} className="text-text-muted hover:text-starforge-gold"><Copy className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => deleteItem(item)} className="text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
                                </td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {editItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditItem(null)}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-void-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-surface border border-border rounded-sm p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-heading text-lg text-text-primary">Edit Media</h2>
                                <button onClick={() => setEditItem(null)}><X className="w-5 h-5 text-text-muted" /></button>
                            </div>
                            <div className="aspect-video bg-void-black rounded-sm overflow-hidden mb-4">
                                <img src={editItem.url} alt={editItem.altText} className="w-full h-full object-contain" />
                            </div>
                            <p className="font-ui text-xs text-text-primary mb-3">{editItem.name}</p>
                            <label className="font-ui text-[10px] text-text-muted uppercase tracking-wider block mb-1">Alt Text</label>
                            <input type="text" value={editAlt} onChange={e => setEditAlt(e.target.value)}
                                placeholder="Describe this image for accessibility..." className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold" />
                            <button onClick={() => setEditItem(null)} className="w-full mt-4 py-2 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-yellow-500">Save</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
