import React, { useState, useEffect } from 'react';
import { Package, Edit2, Save, X, ImageIcon, AlignLeft, Layout } from 'lucide-react';
import api from './api';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await api
                .from('products')
                .select('*')
                .order('category', { ascending: false });

            if (error) throw error;
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (product) => {
        setEditingId(product.id);
        setEditForm({ ...product });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSave = async () => {
        try {
            const { error } = await api
                .from('products')
                .update({
                    name: editForm.name,
                    tagline: editForm.tagline,
                    texture: editForm.texture, // Using texture as description
                    img: editForm.img
                })
                .eq('id', editingId);

            if (error) throw error;

            alert('Product updated successfully!');
            setEditingId(null);
            fetchProducts();
        } catch (err) {
            console.error('Error updating product:', err);
            alert('Error updating product.');
        }
    };

    if (loading && products.length === 0) return <div className="p-20 text-center font-bold text-gray-400">LOADING PRODUCTS...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 border border-gray-200 shadow-sm flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-extrabold uppercase tracking-tighter">Collection Management</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-medium">Update product details and media ({products.length} items)</p>
                </div>
                <Layout size={32} className="text-gray-100" />
            </div>

            <div className="grid grid-cols-1 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white border border-gray-200 p-8 flex flex-col md:flex-row items-start gap-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-full md:w-48 aspect-square bg-gray-50 flex-shrink-0 border border-gray-100 p-4">
                            <img src={product.img} alt={product.name} className="w-full h-full object-contain" />
                        </div>

                        {editingId === product.id ? (
                            <div className="flex-1 space-y-6 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-black uppercase tracking-widest">Product Name</label>
                                        <input
                                            className="w-full border-b-2 border-gray-200 py-2 text-lg font-bold focus:outline-none focus:border-black transition-colors"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-black uppercase tracking-widest">Tagline</label>
                                        <input
                                            className="w-full border-b-2 border-gray-200 py-2 text-sm focus:outline-none focus:border-black transition-colors"
                                            value={editForm.tagline}
                                            onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black uppercase tracking-widest">Description / Details</label>
                                    <textarea
                                        className="w-full border border-gray-200 p-4 text-sm min-h-[100px] focus:outline-none focus:border-black"
                                        value={editForm.texture || ''}
                                        onChange={(e) => setEditForm({ ...editForm, texture: e.target.value })}
                                        placeholder="Add product description here..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black uppercase tracking-widest">Image Source Path</label>
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 border border-gray-200 p-3 text-xs font-mono focus:outline-none focus:border-black"
                                            value={editForm.img}
                                            onChange={(e) => setEditForm({ ...editForm, img: e.target.value })}
                                        />
                                        <span className="bg-gray-100 p-3 text-gray-400"><ImageIcon size={14} /></span>
                                    </div>
                                    <p className="text-[9px] text-gray-400 mt-1 italic">Example: ./assets/images/products/item.webp</p>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button onClick={handleSave} className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2">
                                        <Save size={14} /> Update Product
                                    </button>
                                    <button onClick={cancelEditing} className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                                        Discard Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cdg-red mb-1 block">{product.category} Collection</span>
                                        <h4 className="text-2xl font-extrabold uppercase tracking-tight">{product.name}</h4>
                                        <p className="text-gray-500 font-medium italic mt-1">{product.tagline}</p>
                                    </div>
                                    <button
                                        onClick={() => startEditing(product)}
                                        className="p-3 border border-gray-100 hover:border-black transition-colors"
                                        title="Edit Product"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                </div>

                                <div className="bg-gray-50 p-6 border-l-2 border-gray-200 mb-6">
                                    <div className="flex items-start gap-4">
                                        <AlignLeft size={16} className="text-gray-300 mt-1" />
                                        <p className="text-sm text-gray-600 leading-relaxed italic">
                                            {product.texture || "No detailed description added yet."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 px-3 py-1 flex items-center gap-2">
                                        <ImageIcon size={12} />
                                        <span>{product.img}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductManagement;

export default ProductManagement;
