import React, { useState, useEffect } from 'react';
import { Mail, Clock, Globe, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import api from './api';

const InquiryManagement = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const res = await api.get('/inquiries');
            setInquiries(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) return <div className="p-10 text-center font-bold uppercase tracking-widest text-gray-400">Loading Inquiries from Google Cloud...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 border border-gray-200">
                <div>
                    <h3 className="text-xl font-extrabold uppercase tracking-tight">Business Inquiries</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Google Cloud Firestore Storage ({inquiries.length} totals)</p>
                </div>
                <button
                    onClick={fetchInquiries}
                    className="text-xs font-bold uppercase tracking-widest bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
                >
                    Refresh
                </button>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-400">
                            <th className="px-6 py-4">Sender</th>
                            <th className="px-6 py-4">Country</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {inquiries.map((inquiry) => (
                            <React.Fragment key={inquiry.id}>
                                <tr
                                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedId === inquiry.id ? 'bg-gray-50 border-l-4 border-cdg-red' : ''}`}
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
                                            <Clock size={12} /> {inquiry.timestamp ? new Date(inquiry.timestamp._seconds * 1000).toLocaleString() : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-400">
                                        {expandedId === inquiry.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </td>
                                </tr>
                                {expandedId === inquiry.id && (
                                    <tr className="bg-gray-50">
                                        <td colSpan="4" className="px-10 py-8">
                                            <div className="bg-white p-6 border border-gray-100 shadow-sm relative">
                                                <MessageSquare size={24} className="absolute -top-3 -left-3 text-cdg-red bg-white p-1 rounded-full border border-gray-100" />
                                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Inquiry Content</h4>
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
                                <td colSpan="4" className="px-6 py-20 text-center text-gray-300 italic uppercase tracking-widest text-sm">No inquiries in Google Cloud.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InquiryManagement;
