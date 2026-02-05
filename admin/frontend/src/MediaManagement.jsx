import React, { useState, useEffect } from 'react';
import { Play, FileText, Archive, Plus, Trash2, Save, X, ExternalLink, ImageIcon } from 'lucide-react';
import api from './api';

const MediaManagement = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const { data, error } = await api
                .from('media_assets')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;
            setAssets(data);
        } catch (err) {
            console.error('Error fetching assets:', err);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (asset) => {
        setEditingId(asset.id);
        setEditForm({ ...asset });
    };

    const handleSave = async () => {
        try {
            const { error } = await api
                .from('media_assets')
                .update({
                    title: editForm.title,
                    sub_title: editForm.sub_title,
                    type: editForm.type,
                    file_path: editForm.file_path,
                    thumbnail_path: editForm.thumbnail_path,
                    order_index: parseInt(editForm.order_index) || 0
                })
                .eq('id', editingId);

            if (error) throw error;
            alert('Asset updated successfully!');
            setEditingId(null);
            fetchAssets();
        } catch (err) {
            console.error('Error updating asset:', err);
            alert('Error updating asset.');
        }
    };

    const handleAdd = async () => {
        try {
            const { error } = await api
                .from('media_assets')
                .insert([
                    {
                        title: editForm.title || 'New Asset',
                        sub_title: editForm.sub_title,
                        type: editForm.type || 'video',
                        file_path: editForm.file_path || '',
                        thumbnail_path: editForm.thumbnail_path,
                        order_index: parseInt(editForm.order_index) || 0
                    }
                ]);

            if (error) throw error;
            alert('Asset added successfully!');
            setIsAdding(false);
            setEditForm({});
            fetchAssets();
        } catch (err) {
            console.error('Error adding asset:', err);
            alert('Error adding asset.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this asset?')) return;
        try {
            const { error } = await api.from('media_assets').delete().eq('id', id);
            if (error) throw error;
            fetchAssets();
        } catch (err) {
            console.error('Error deleting asset:', err);
            alert('Error deleting asset.');
        }
    };

    if (loading && assets.length === 0) return <div className="p-20 text-center font-bold text-gray-400">LOADING MEDIA ASSETS...</div>;

    const AssetForm = ({ onSave, onCancel, title }) => (
        <div className="bg-white border-2 border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-6 mb-8">
            <h4 className="text-xl font-black uppercase tracking-tight">{title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Asset Title</label>
                    <input
                        className="w-full border-b-2 border-black py-2 font-bold focus:outline-none"
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Type</label>
                    <select
                        className="w-full border-b-2 border-black py-2 font-bold focus:outline-none"
                        value={editForm.type || 'video'}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    >
                        <option value="video">Video</option>
                        <option value="pdf">PDF Document</option>
                        <option value="archive">Archive Resource</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Subtitle / Description</label>
                    <input
                        className="w-full border-b-2 border-black py-2 focus:outline-none"
                        value={editForm.sub_title || ''}
                        onChange={(e) => setEditForm({ ...editForm, sub_title: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Order Index</label>
                    <input
                        type="number"
                        className="w-full border-b-2 border-black py-2 focus:outline-none"
                        value={editForm.order_index || 0}
                        onChange={(e) => setEditForm({ ...editForm, order_index: e.target.value })}
                    />
                </div>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">File Path (URL)</label>
                    <input
                        className="w-full border border-gray-200 p-3 text-sm font-mono focus:border-black focus:outline-none"
                        value={editForm.file_path || ''}
                        onChange={(e) => setEditForm({ ...editForm, file_path: e.target.value })}
                        placeholder="./assets/videos/..."
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Thumbnail Path (Optional for PDF/Archive)</label>
                    <input
                        className="w-full border border-gray-200 p-3 text-sm font-mono focus:border-black focus:outline-none"
                        value={editForm.thumbnail_path || ''}
                        onChange={(e) => setEditForm({ ...editForm, thumbnail_path: e.target.value })}
                        placeholder="./assets/images/..."
                    />
                </div>
            </div>
            <div className="flex gap-4 pt-4">
                <button onClick={onSave} className="bg-black text-white px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-gray-800 flex items-center gap-2 transition-all">
                    <Save size={14} /> Save Asset
                </button>
                <button onClick={onCancel} className="text-gray-400 hover:text-black text-xs font-black uppercase tracking-widest transition-all">
                    Cancel
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Media Lab Assets</h3>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">Manage videos, PDFs, and archive documents ({assets.length} items)</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => { setIsAdding(true); setEditForm({ type: 'video', order_index: assets.length + 1 }); }}
                        className="bg-black text-white px-6 py-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-cdg-red transition-all shadow-lg"
                    >
                        <Plus size={16} /> Add New Asset
                    </button>
                )}
            </div>

            {isAdding && (
                <AssetForm
                    title="Add New Media Asset"
                    onSave={handleAdd}
                    onCancel={() => setIsAdding(false)}
                />
            )}

            <div className="grid grid-cols-1 gap-4">
                {assets.map((asset) => (
                    <div key={asset.id}>
                        {editingId === asset.id ? (
                            <AssetForm
                                title="Edit Asset"
                                onSave={handleSave}
                                onCancel={() => setEditingId(null)}
                            />
                        ) : (
                            <div className="bg-white border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-black transition-all">
                                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    {asset.type === 'video' && <Play size={24} className="text-gray-400" />}
                                    {asset.type === 'pdf' && <FileText size={24} className="text-gray-400" />}
                                    {asset.type === 'archive' && <Archive size={24} className="text-gray-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 tracking-widest ${asset.type === 'video' ? 'bg-blue-100 text-blue-600' :
                                                asset.type === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            {asset.type}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold">#{asset.order_index}</span>
                                    </div>
                                    <h4 className="font-extrabold text-lg uppercase truncate">{asset.title}</h4>
                                    <p className="text-xs text-gray-400 truncate">{asset.file_path}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => startEditing(asset)}
                                        className="p-3 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all"
                                    >
                                        <Save size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(asset.id)}
                                        className="p-3 text-gray-300 hover:text-cdg-red hover:bg-red-50 rounded-full transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <a
                                        href={asset.file_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all"
                                    >
                                        <ExternalLink size={18} />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MediaManagement;
