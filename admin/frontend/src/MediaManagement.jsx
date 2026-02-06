import React, { useState, useEffect } from 'react';
import { Play, FileText, Archive, Plus, Trash2, Save, X, ExternalLink, ImageIcon } from 'lucide-react';
import api from './api';
import AssetForm from './components/AssetForm';

const MediaManagement = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
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

    const handleSave = async (data) => {
        try {
            const { error } = await api
                .from('media_assets')
                .update({
                    title: data.title,
                    sub_title: data.sub_title,
                    type: data.type,
                    file_path: data.file_path,
                    thumbnail_path: data.thumbnail_path,
                    order_index: parseInt(data.order_index) || 0
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

    const handleAdd = async (data) => {
        try {
            const { error } = await api
                .from('media_assets')
                .insert([
                    {
                        title: data.title,
                        sub_title: data.sub_title,
                        type: data.type,
                        file_path: data.file_path,
                        thumbnail_path: data.thumbnail_path,
                        order_index: parseInt(data.order_index) || assets.length + 1
                    }
                ]);

            if (error) throw error;
            alert('Asset added successfully!');
            setIsAdding(false);
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

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">Media Lab Assets</h3>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">Manage videos, PDFs, and archive documents ({assets.length} items)</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => {
                            setIsAdding(true);
                        }}
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
                    initialData={{ order_index: assets.length + 1 }}
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
                                initialData={asset}
                            />
                        ) : (
                            <div className="bg-white border border-gray-200 p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-black transition-all">
                                <div className="w-32 h-20 bg-gray-100 flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-gray-100">
                                    {asset.thumbnail_path ? (
                                        <img src={asset.thumbnail_path.startsWith('./') ? `../${asset.thumbnail_path.substring(2)}` : asset.thumbnail_path} alt={asset.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center opacity-20">
                                            {asset.type === 'video' && <Play size={24} />}
                                            {asset.type === 'pdf' && <FileText size={24} />}
                                            {asset.type === 'archive' && <Archive size={24} />}
                                        </div>
                                    )}
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
                                        onClick={() => {
                                            setEditingId(asset.id);
                                        }}
                                        className="p-3 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all"
                                    >
                                        <ImageIcon size={18} />
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
