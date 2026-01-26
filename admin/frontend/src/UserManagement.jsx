import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Mail, Shield } from 'lucide-react';
import api from './api';

const UserManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/admins');
            setAdmins(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admins', { email, password });
            setEmail('');
            setPassword('');
            setMessage('Admin created successfully.');
            fetchAdmins();
        } catch (err) {
            setMessage('Error creating admin.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this admin?')) {
            try {
                await api.delete(`/admins/${id}`);
                fetchAdmins();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="space-y-10">
            {/* Create Section */}
            <section className="bg-white p-8 border border-gray-200">
                <h3 className="flex items-center gap-2 text-lg font-bold uppercase mb-6">
                    <UserPlus size={20} />
                    Add Sub-Admin
                </h3>
                <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="email"
                        placeholder="Sub-Admin Email"
                        className="border px-4 py-2 focus:ring-1 focus:ring-black outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border px-4 py-2 focus:ring-1 focus:ring-black outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-black text-white px-6 py-2 font-bold hover:bg-gray-800 transition-colors uppercase">
                        Create
                    </button>
                </form>
                {message && <p className="mt-4 text-sm font-medium text-gray-500 italic">{message}</p>}
            </section>

            {/* List Section */}
            <section>
                <h3 className="flex items-center gap-2 text-lg font-bold uppercase mb-6">
                    <Shield size={20} />
                    Existing Admins
                </h3>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="bg-white border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-400">
                                    <th className="px-6 py-4">ID / Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Inquiry Receiver</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {admins.map((admin) => (
                                    <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium flex items-center gap-2">
                                            <Mail size={14} className="text-gray-300" />
                                            {admin.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase tracking-widest border border-gray-200">
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {admin.receivesInquiries ? (
                                                <span className="text-[10px] font-bold text-cdg-red uppercase tracking-widest">Active Receiver</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(admin._id)}
                                                className="text-gray-400 hover:text-cdg-red transition-colors p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {admins.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">No sub-admins found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default UserManagement;
