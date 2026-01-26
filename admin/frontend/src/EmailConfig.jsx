import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Bell } from 'lucide-react';
import api from './api';

const EmailConfig = () => {
    const [admins, setAdmins] = useState([]);
    const [currentReceiver, setCurrentReceiver] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await api.get('/admins');
            setAdmins(res.data);
            const active = res.data.find(a => a.receivesInquiries);
            setCurrentReceiver(active);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateReceiver = async (email) => {
        try {
            await api.post('/config/inquiry-receiver', { email });
            alert('Inquiry receiver updated.');
            fetchConfig();
        } catch (err) {
            alert('Error updating receiver.');
        }
    };

    if (loading) return <div className="p-10 text-center font-bold uppercase tracking-widest text-gray-400">LOADING CONFIG...</div>;

    return (
        <div className="space-y-10">
            <section className="bg-white p-10 border border-gray-200">
                <h3 className="flex items-center gap-3 text-xl font-extrabold uppercase mb-2 tracking-tight">
                    <Bell size={24} className="text-cdg-red" />
                    Assign Inquiry Receiver
                </h3>
                <p className="text-gray-500 text-sm mb-10 max-w-xl">
                    Select which admin will receive the "Business Inquiry" notifications. All site submissions will be routed to the selected email address.
                </p>

                <div className="grid grid-cols-1 gap-4">
                    {admins.map((admin) => (
                        <div
                            key={admin._id}
                            onClick={() => handleUpdateReceiver(admin.email)}
                            className={`p-6 border flex items-center justify-between cursor-pointer transition-all ${admin.receivesInquiries
                                    ? 'border-black bg-black text-white'
                                    : 'border-gray-200 hover:border-gray-400 bg-white'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <Mail size={20} className={admin.receivesInquiries ? 'text-white' : 'text-gray-400'} />
                                <div>
                                    <p className="font-bold tracking-tight">{admin.email}</p>
                                    <p className={`text-[10px] uppercase tracking-widest ${admin.receivesInquiries ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Sub-Admin Role
                                    </p>
                                </div>
                            </div>
                            {admin.receivesInquiries && <CheckCircle size={20} className="text-cdg-red fill-white" />}
                        </div>
                    ))}
                    {admins.length === 0 && (
                        <div className="p-10 text-center border-2 border-dashed border-gray-100 text-gray-300 italic">
                            Please create sub-admins first.
                        </div>
                    )}
                </div>
            </section>

            <div className="bg-cdg-red bg-opacity-5 p-8 border border-cdg-red border-opacity-20 flex items-start gap-4">
                <Shield size={24} className="text-cdg-red mt-1" />
                <div>
                    <h4 className="font-bold text-black uppercase text-sm mb-1">System Security Note</h4>
                    <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                        Email routing is managed via the backend server. The main admin (top@kwavem.com) is the fallback receiver if no sub-admin is assigned or if the assigned sub-admin is deleted. Ensure the backend SMTP credentials in the .env file are valid.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Internal Shield icon for this component
const Shield = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

export default EmailConfig;
