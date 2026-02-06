import React, { useState, useEffect } from 'react';
import { Layout, Plus, Edit2, Trash2, Save, X, ImageIcon, Palette, Type } from 'lucide-react';
import api from './api';

const CollectionShowcase = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data, error } = await api
                .from('collection_showcase')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;
            setItems(data || []);
        } catch (err) {
            console.error('Error fetching showcase items:', err);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (item) => {
        setEditingId(item.id);
        setEditForm({ ...item });
        setIsCreating(false);
    };

    const startCreating = () => {
        setEditingId('new');
        setEditForm({
            title: '',
            subtitle: '',
            image_url: '',
            bg_color: '#F3F3F3',
            order_index: items.length + 1
        });
        setIsCreating(true);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
        setIsCreating(false);
    };

    const handleSave = async () => {
        try {
            if (isCreating) {
                const { error } = await api
                    .from('collection_showcase')
                    .insert([editForm]);
                if (error) throw error;
                alert('Item added successfully!');
            } else {
                const { error } = await api
                    .from('collection_showcase')
                    .update({
                        title: editForm.title,
                        subtitle: editForm.subtitle,
                        image_url: editForm.image_url,
                        bg_color: editForm.bg_color,
                        order_index: editForm.order_index
                    })
                    .eq('id', editingId);
                if (error) throw error;
                alert('Item updated successfully!');
            }

            setEditingId(null);
            setIsCreating(false);
            fetchItems();
        } catch (err) {
            console.error('Error saving item:', err);
            alert('Error saving item.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const { error } = await api
                .from('collection_showcase')
                .delete()
                .eq('id', id);

            if (error) throw error;
            alert('Item deleted successfully!');
            fetchItems();
        } catch (err) {
            console.error('Error deleting item:', err);
            alert('Error deleting item.');
        }
    };

    if (loading && items.length === 0) return <div className="p-20 text-center font-bold text-gray-400">LOADING SHOWCASE...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 border border-gray-200 shadow-sm flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-extrabold uppercase tracking-tighter">Collection Showcase</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-medium">Manage the top showcase slider ({items.length} items)</p>
                </div>
                <button
                    onClick={startCreating}
                    className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-cdg-red transition-all flex items-center gap-2"
                >
                    <Plus size={16} /> Add New Slide
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {editingId === 'new' && (
                    <div className="bg-white border-2 border-dashed border-black p-8 space-y-6">
                        <h4 className="font-black uppercase tracking-widest text-sm">New Showcase Slide</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest">Title</label>
                                <input
                                    className="w-full border-b border-gray-200 py-2 text-lg font-bold focus:outline-none focus:border-black"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    placeholder="Slide Title"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest">Subtitle</label>
                                <input
                                    className="w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-black"
                                    value={editForm.subtitle}
                                    onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                                    placeholder="Slide Subtitle"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest">Image URL (Data URI recommended)</label>
                                <input
                                    className="w-full border-b border-gray-200 py-2 text-xs font-mono focus:outline-none focus:border-black"
                                    value={editForm.image_url}
                                    onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                                    placeholder="Paste Base64 or URL"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest">Background Color</label>
                                <input
                                    type="color"
                                    className="w-full h-10 border-none bg-transparent cursor-pointer"
                                    value={editForm.bg_color}
                                    onChange={(e) => setEditForm({ ...editForm, bg_color: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2">
                                <Save size={14} /> Create Slide
                            </button>
                            <button onClick={cancelEditing} className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {items.map((item) => (
                    <div key={item.id} className={`bg-white border border-gray-200 p-8 shadow-sm transition-all ${editingId === item.id ? 'ring-2 ring-black' : ''}`}>
                        {editingId === item.id ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest">Title</label>
                                        <input
                                            className="w-full border-b border-gray-200 py-2 text-lg font-bold focus:outline-none focus:border-black"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest">Subtitle</label>
                                        <input
                                            className="w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-black"
                                            value={editForm.subtitle}
                                            onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest">Image URL</label>
                                        <input
                                            className="w-full border-b border-gray-200 py-2 text-xs font-mono focus:outline-none focus:border-black"
                                            value={editForm.image_url}
                                            onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest">Background Color</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="color"
                                                className="w-12 h-10 border-none bg-transparent cursor-pointer"
                                                value={editForm.bg_color}
                                                onChange={(e) => setEditForm({ ...editForm, bg_color: e.target.value })}
                                            />
                                            <span className="text-xs font-mono">{editForm.bg_color}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button onClick={handleSave} className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2">
                                        <Save size={14} /> Save Changes
                                    </button>
                                    <button onClick={cancelEditing} className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black">
                                        Discard
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div
                                    className="w-full md:w-64 h-48 flex items-center justify-center p-4 border border-gray-100"
                                    style={{ backgroundColor: item.bg_color }}
                                >
                                    <img src={item.image_url} alt={item.title} className="max-w-full max-h-full object-contain" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-cdg-red">Position #{item.order_index}</span>
                                            <h4 className="text-2xl font-black uppercase tracking-tighter">{item.title}</h4>
                                            <p className="text-gray-500 font-medium italic">{item.subtitle}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEditing(item)} className="p-3 border border-gray-100 hover:border-black transition-colors">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-3 border border-gray-100 hover:text-cdg-red hover:border-cdg-red transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {items.length === 0 && !isCreating && (
                    <div className="p-20 text-center border-2 border-dashed border-gray-200 text-gray-300 font-bold uppercase tracking-widest">
                        No showcase slides found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectionShowcase;
