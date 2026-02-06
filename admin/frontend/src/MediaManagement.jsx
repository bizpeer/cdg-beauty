import React, { useState, useEffect } from 'react';
import { Play, FileText, Archive, Plus, Trash2, Save, X, ExternalLink, ImageIcon, Upload, Loader2 } from 'lucide-react';
import api from './api';

// AssetForm 분리: 한 글자 타이핑 시 입력 튕김 버그 해결 및 파일 업로드 기능 추가
const AssetForm = ({ onSave, onCancel, title, initialData = {} }) => {
    const [formData, setFormData] = useState({
        title: '',
        sub_title: '',
        type: 'video',
        file_path: '',
        thumbnail_path: '',
        order_index: 0,
        ...initialData
    });
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `thumbnails/${fileName}`;

            // 'media' 버킷에 업로드 (버킷이 이미 생성되어 있어야 함)
            const { error: uploadError } = await api.storage
                .from('media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = api.storage
                .from('media')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, thumbnail_path: publicUrl }));
        } catch (err) {
            console.error('Error uploading file:', err);
            alert('Error uploading file. Make sure "media" bucket exists in Supabase Storage.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = () => {
        const finalData = {
            ...formData,
            title: formData.title || 'New Asset',
            // 썸네일 경로가 없으면 기본 이미지 적용
            thumbnail_path: formData.thumbnail_path || './assets/images/default_thumbnail.png'
        };
        onSave(finalData);
    };

    return (
        <div className="bg-white border-2 border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-6 mb-8">
            <h4 className="text-xl font-black uppercase tracking-tight">{title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Asset Title</label>
                    <input
                        className="w-full border-b-2 border-black py-2 font-bold focus:outline-none"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="제목을 입력하세요"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Type</label>
                    <select
                        className="w-full border-b-2 border-black py-2 font-bold focus:outline-none"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                        value={formData.sub_title}
                        onChange={(e) => setFormData({ ...formData, sub_title: e.target.value })}
                        placeholder="설명을 입력하세요"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Order Index</label>
                    <input
                        type="number"
                        className="w-full border-b-2 border-black py-2 focus:outline-none"
                        value={formData.order_index}
                        onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                    />
                </div>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">File Path (URL / YouTube)</label>
                    <input
                        className="w-full border border-gray-200 p-3 text-sm font-mono focus:border-black focus:outline-none"
                        value={formData.file_path}
                        onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                        placeholder="https://... 또는 ./assets/videos/..."
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Thumbnail Image (Click to Upload)</label>
                    <div className="flex items-center gap-4">
                        <div className="relative w-32 h-20 bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-black transition-colors group">
                            {uploading ? (
                                <Loader2 className="animate-spin text-gray-400" size={20} />
                            ) : formData.thumbnail_path ? (
                                <img src={formData.thumbnail_path} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Upload size={20} className="text-gray-300 group-hover:text-black" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                        </div>
                        <div className="flex-1 text-[10px] text-gray-400 leading-relaxed">
                            <p>권장 사이즈: 1280x720 (16:9)</p>
                            <p>이미지가 없으면 기본 이미지가 사용됩니다.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-4 pt-4">
                <button
                    onClick={handleSave}
                    disabled={uploading}
                    className="bg-black text-white px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-400 flex items-center gap-2 transition-all"
                >
                    <Save size={14} /> Save Asset
                </button>
                <button onClick={onCancel} className="text-gray-400 hover:text-black text-xs font-black uppercase tracking-widest transition-all">
                    Cancel
                </button>
            </div>
        </div>
    );
};

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
                        onClick={() => setIsAdding(true)}
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
                                        onClick={() => setEditingId(asset.id)}
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
