import React, { useState, useEffect } from 'react';
import { Upload, RefreshCw, Eye, CheckCircle, AlertTriangle, FileImage, ExternalLink } from 'lucide-react';
import api from './api';

const AssetManagement = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [targetAsset, setTargetAsset] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/assets');
            setAssets(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });

    const handleFileChange = (e, asset) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setTargetAsset(asset);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleReplace = async () => {
        if (!selectedFile || !targetAsset) return;
        setUploading(true);
        try {
            const content = await toBase64(selectedFile);
            await api.post('/api/assets/replace', {
                path: targetAsset.path,
                content,
                sha: targetAsset.sha,
                message: `Replace ${targetAsset.name} via Admin Dashboard`
            });
            alert('Asset replaced successfully! Pushing to GitHub... Wait for a few minutes for the live site to update.');
            setSelectedFile(null);
            setTargetAsset(null);
            setPreviewUrl(null);
            fetchAssets();
        } catch (err) {
            alert('Error replacing asset.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-10 text-center font-bold">LOADING ASSETS...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 font-medium italic">
                    Files found in <span className="font-mono bg-gray-100 px-1">public/assets/images</span>
                </p>
                <button
                    onClick={fetchAssets}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                    Refresh List
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {assets.map((asset) => (
                    <div key={asset.sha} className="bg-white border border-gray-200 group overflow-hidden">
                        {/* Asset Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileImage size={16} className="text-gray-400 flex-shrink-0" />
                                <span className="text-xs font-bold truncate uppercase tracking-tighter">{asset.name}</span>
                            </div>
                            <a href={asset.download_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-black">
                                <ExternalLink size={14} />
                            </a>
                        </div>

                        {/* Thumbnail Area */}
                        <div className="aspect-square bg-gray-900 flex items-center justify-center relative overflow-hidden">
                            <img
                                src={asset.download_url}
                                alt={asset.name}
                                className="w-full h-full object-contain opactiy-90 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <label className="bg-white text-black px-6 py-2 text-xs font-bold cursor-pointer hover:bg-cdg-red hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
                                    <Upload size={14} />
                                    Replace
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*,video/*"
                                        onChange={(e) => handleFileChange(e, asset)}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="p-4 text-[10px] text-gray-400 font-mono space-y-1">
                            <p>PATH: {asset.path}</p>
                            <p>SIZE: {(asset.size / 1024).toFixed(2)} KB</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Replacement Preview Modal / Overlay */}
            {selectedFile && (
                <div className="fixed inset-0 z-[2000] bg-black bg-opacity-90 flex items-center justify-center p-10 backdrop-blur-sm">
                    <div className="bg-white max-w-4xl w-full p-10 flex flex-col items-center">
                        <h3 className="text-2xl font-extrabold uppercase mb-2 tracking-tight">Confirm Replacement</h3>
                        <p className="text-gray-500 mb-10 text-sm">Replacing <span className="font-bold text-black border-b-2 border-cdg-red">{targetAsset.name}</span> with your new file.</p>

                        <div className="grid grid-cols-2 gap-10 w-full mb-10">
                            <div className="text-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Current Asset</p>
                                <div className="aspect-square bg-gray-100 border border-gray-200">
                                    <img src={targetAsset.download_url} className="w-full h-full object-contain" alt="Current" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-cdg-red mb-4 font-bold italic">New Asset Preview</p>
                                <div className="aspect-square bg-gray-50 border-2 border-dashed border-cdg-red">
                                    <img src={previewUrl} className="w-full h-full object-contain" alt="New" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 w-full justify-center">
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="px-10 py-4 font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest text-sm"
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReplace}
                                className="bg-black text-white px-10 py-4 font-bold hover:bg-cdg-red transition-all transform hover:scale-105 uppercase tracking-widest text-sm flex items-center gap-3 disabled:opacity-50"
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        UPLOADING TO GITHUB...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={18} />
                                        CONFIRM & PUSH
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mt-8 flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 text-xs border border-amber-100">
                            <AlertTriangle size={14} />
                            <p>Warning: This action will overwrite the file in the main repository branch.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetManagement;
