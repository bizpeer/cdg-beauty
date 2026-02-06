import React, { useState, useEffect } from 'react';
import { Save, Upload, Loader2, Play, FileText, Archive, FileUp, Link2 } from 'lucide-react';
import api from '../api';

const DEFAULT_THUMBNAIL_URL = "https://agnztfqynbdvqdpxzajh.supabase.co/storage/v1/object/public/media/system/default_thumbnail.png";

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
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);

    // Common upload function
    const uploadToSupabase = async (file, folder) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await api.storage
            .from('media')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = api.storage
            .from('media')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleThumbnailChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingThumbnail(true);
        try {
            const url = await uploadToSupabase(file, 'thumbnails');
            setFormData(prev => ({ ...prev, thumbnail_path: url }));
        } catch (err) {
            console.error('Error uploading thumbnail:', err);
            alert('Error uploading thumbnail.');
        } finally {
            setUploadingThumbnail(false);
        }
    };

    const handleMainFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingFile(true);
        try {
            const url = await uploadToSupabase(file, 'documents');
            setFormData(prev => ({ ...prev, file_path: url }));
        } catch (err) {
            console.error('Error uploading file:', err);
            alert('Error uploading file.');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleSave = () => {
        if (!formData.title || !formData.file_path) {
            alert('Title and File Path (or Upload) are required.');
            return;
        }

        const finalData = {
            ...formData,
            title: formData.title || 'New Asset',
            thumbnail_path: formData.thumbnail_path || DEFAULT_THUMBNAIL_URL
        };
        onSave(finalData);
    };

    const renderPreview = (path) => {
        if (!path) return null;
        if (path.startsWith('./')) {
            return `../${path.substring(2)}`;
        }
        return path;
    };

    return (
        <div className="bg-white border-2 border-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-6 mb-8">
            <h4 className="text-xl font-black uppercase tracking-tight">{title}</h4>

            {/* Basic Info */}
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
                        className="w-full border-b-2 border-black py-2 font-bold focus:outline-none cursor-pointer"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="video">Video (YouTube/Link)</option>
                        <option value="pdf">PDF Document (Upload)</option>
                        <option value="archive">Archive Resource (Upload)</option>
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

            {/* Dynamic File/Link Section */}
            <div className="space-y-4 p-6 bg-gray-50 border border-gray-100">
                {formData.type === 'video' ? (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                            <Link2 size={12} /> Video Link (YouTube/Vimeo)
                        </label>
                        <input
                            className="w-full border border-gray-200 p-3 text-sm font-mono focus:border-black focus:outline-none bg-white"
                            value={formData.file_path}
                            onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                        <p className="text-[9px] text-gray-400">유튜브나 비메오 등 재생 가능한 영상 링크를 입력하세요.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                            <FileUp size={12} /> {formData.type.toUpperCase()} File Upload
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <input
                                    className="w-full border border-gray-200 p-3 text-sm font-mono bg-white pr-20 truncate"
                                    value={formData.file_path}
                                    readOnly
                                    placeholder="파일을 선택하여 업로드하세요"
                                />
                                <div className="absolute right-2 top-1.5">
                                    <label className="bg-black text-white px-4 py-1.5 text-[10px] font-bold uppercase cursor-pointer hover:bg-gray-800 transition-colors flex items-center gap-2">
                                        {uploadingFile ? <Loader2 className="animate-spin" size={12} /> : <Upload size={12} />}
                                        Browse
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleMainFileChange}
                                            disabled={uploadingFile}
                                            accept={formData.type === 'pdf' ? '.pdf' : '*/*'}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Thumbnail Uploading */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Thumbnail Image (Required for all types)</label>
                <div className="flex items-center gap-4">
                    <div className="relative w-40 h-24 bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-black transition-colors group">
                        {uploadingThumbnail ? (
                            <Loader2 className="animate-spin text-gray-400" size={20} />
                        ) : formData.thumbnail_path ? (
                            <img src={renderPreview(formData.thumbnail_path)} alt="Preview" className="w-full h-full object-cover border border-gray-200" />
                        ) : (
                            <div className="text-center p-2">
                                <Upload size={20} className="text-gray-300 group-hover:text-black mx-auto mb-1" />
                                <p className="text-[8px] text-gray-400 uppercase font-bold">Upload Thumb</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleThumbnailChange}
                            disabled={uploadingThumbnail}
                        />
                    </div>
                    <div className="flex-1 text-[10px] text-gray-400 leading-relaxed">
                        <p className="font-bold text-gray-600">권장 사이즈: 1280x720 (16:9)</p>
                        <p>이미지가 없으면 시스템 기본 이미지가 자동으로 설정됩니다.</p>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
                <button
                    onClick={handleSave}
                    disabled={uploadingThumbnail || uploadingFile}
                    className="bg-black text-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-cdg-red disabled:bg-gray-400 flex items-center gap-2 transition-all shadow-lg"
                >
                    <Save size={14} /> Save Asset
                </button>
                <button onClick={onCancel} className="text-gray-400 hover:text-black text-xs font-black uppercase tracking-widest transition-all px-4">
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AssetForm;
