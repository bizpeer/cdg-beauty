import React, { useState, useEffect } from 'react';
import { Package, Edit2, Save, X, Image as ImageIcon } from 'lucide-react';
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

    if (loading) return <div className="p-10 text-center font-bold">LOADING PRODUCTS...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 border border-gray-200">
                <h3 className="text-xl font-extrabold uppercase tracking-tight">Product Management</h3>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Manage your skin & color collection ({products.length} items)</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-white border border-gray-200 p-6 flex items-start gap-6">
                        <div className="w-24 h-24 bg-gray-100 flex-shrink-0 border border-gray-200">
                            <img src={product.img} alt={product.name} className="w-full h-full object-contain" />
                        </div>

                        {editingId === product.id ? (
                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Product Name</label>
                                        <input
                                            className="w-full border border-gray-200 p-2 text-sm focus:outline-none focus:border-black"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Tagline</label>
                                        <input
                                            className="w-full border border-gray-200 p-2 text-sm focus:outline-none focus:border-black"
                                            value={editForm.tagline}
                                            onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Image URL (Assets Path)</label>
                                    <input
                                        className="w-full border border-gray-200 p-2 text-sm focus:outline-none focus:border-black"
                                        value={editForm.img}
                                        onChange={(e) => setEditForm({ ...editForm, img: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSave} className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <Save size={14} /> Save
                                    </button>
                                    <button onClick={cancelEditing} className="border border-gray-200 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black">
                                        <X size={14} /> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h4 className="text-lg font-bold uppercase">{product.name}</h4>
                                    <span className="text-[10px] font-bold uppercase px-2 py-1 bg-gray-100">{product.category}</span>
                                </div>
                                <p className="text-sm text-gray-500 italic mb-2">{product.tagline}</p>
                                <p className="text-xs text-gray-400 mb-4 font-mono">{product.img}</p>
                                <button
                                    onClick={() => startEditing(product)}
                                    className="text-[10px] font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-all flex items-center gap-2"
                                >
                                    <Edit2 size={12} /> Edit Details
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductManagement;
