import React, { useState, useEffect } from 'react';
import { Mail, Clock, Globe, MessageSquare, ChevronDown, ChevronUp, Trash2, RefreshCcw } from 'lucide-react';
import api from './api';

const InquiryManagement = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const { data, error } = await api
                .from('inquiries')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInquiries(data);
        } catch (err) {
            console.error('Error fetching inquiries:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this inquiry?')) return;

        setActionLoading(id);
        try {
            const { error } = await api
                .from('inquiries')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setInquiries(inquiries.filter(item => item.id !== id));
            alert('Inquiry deleted successfully.');
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete inquiry.');
        } finally {
            setActionLoading(null);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading && inquiries.length === 0) return (
        <div className="p-20 text-center space-y-4">
            <RefreshCcw className="animate-spin mx-auto text-gray-300" size={40} />
            <p className="font-bold uppercase tracking-widest text-gray-400">Loading Inquiries...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 border border-gray-200 shadow-sm">
                <div>
                    <h3 className="text-xl font-extrabold uppercase tracking-tight">Business Inquiries</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Global Partner Requests ({inquiries.length} totals)</p>
                </div>
                <button
                    onClick={fetchInquiries}
                    className="text-xs font-bold uppercase tracking-widest bg-black text-white px-6 py-3 hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                    <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-400">
                            <th className="px-6 py-4">Sender</th>
                            <th className="px-6 py-4">Country</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {inquiries.map((inquiry) => (
                            <React.Fragment key={inquiry.id}>
                                <tr
                                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedId === inquiry.id ? 'bg-gray-50 border-l-4 border-black' : ''}`}
                                    onClick={() => toggleExpand(inquiry.id)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-black uppercase">{inquiry.name}</span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                <Mail size={12} /> {inquiry.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold flex items-center gap-1 uppercase tracking-tight">
                                            <Globe size={12} className="text-gray-300" /> {inquiry.country}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1 uppercase">
                                            <Clock size={12} /> {inquiry.created_at ? new Date(inquiry.created_at).toLocaleString() : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3 items-center">
                                            <button
                                                onClick={(e) => handleDelete(inquiry.id, e)}
                                                className="p-2 text-gray-300 hover:text-red-600 transition-colors disabled:opacity-30"
                                                disabled={actionLoading === inquiry.id}
                                                title="Delete Inquiry"
                                            >
                                                {actionLoading === inquiry.id ? <RefreshCcw size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                            </button>
                                            <span className="text-gray-300">
                                                {expandedId === inquiry.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                                {expandedId === inquiry.id && (
                                    <tr className="bg-gray-50">
                                        <td colSpan="4" className="px-10 py-8">
                                            <div className="bg-white p-8 border border-gray-100 shadow-sm relative">
                                                <MessageSquare size={24} className="absolute -top-3 -left-3 text-black bg-white p-1 rounded-full border border-gray-100" />
                                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6 border-b pb-2">Inquiry Content</h4>
                                                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                    {inquiry.message || "No message content provided."}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        {inquiries.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-20 text-center text-gray-300 italic uppercase tracking-widest text-sm">No regular inquiries found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InquiryManagement;
