import React, { useState, useEffect } from 'react';
import { Save, Upload, Loader2, Play, FileText, Archive } from 'lucide-react';
import api from '../api';

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
        // Validation: Required fields
        if (!formData.title || !formData.file_path) {
            alert('Title and File Path are required.');
            return;
        }

        const finalData = {
            ...formData,
            title: formData.title || 'New Asset',
            // Default image if no thumbnail provided: use image004.png as requested
            thumbnail_path: formData.thumbnail_path || './assets/images/image004.png'
        };
        onSave(finalData);
    };

    // Helper for rendering preview images in admin context
    const renderPreview = (path) => {
        if (!path) return null;
        if (path.startsWith('./')) {
            // Admin is in /admin/ subfolder, so ../ is needed to reach root assets
            return `../${path.substring(2)}`;
        }
        return path;
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
                        placeholder="제목을 입력하세요 (필수)"
                        autoFocus
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
                        placeholder="https://... 또는 ./assets/videos/... (필수)"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Thumbnail Image (Click to Upload)</label>
                    <div className="flex items-center gap-4">
                        <div className="relative w-32 h-20 bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-black transition-colors group">
                            {uploading ? (
                                <Loader2 className="animate-spin text-gray-400" size={20} />
                            ) : formData.thumbnail_path ? (
                                <img src={renderPreview(formData.thumbnail_path)} alt="Preview" className="w-full h-full object-cover" />
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
                            <p>클릭하여 이미지를 업로드하세요.</p>
                            <p>이미지가 없으면 <b>image004.png</b> 가 기본으로 설정됩니다.</p>
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

export default AssetForm;
