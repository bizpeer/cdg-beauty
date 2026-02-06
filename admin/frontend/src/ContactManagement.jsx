import React, { useState, useEffect } from 'react';
import { Save, Loader2, MapPin, Phone, Mail } from 'lucide-react';
import api from './api';

const ContactManagement = () => {
    const [contact, setContact] = useState({
        address: '',
        phone: '',
        email: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [id, setId] = useState(null);

    useEffect(() => {
        fetchContact();
    }, []);

    const fetchContact = async () => {
        setLoading(true);
        try {
            const { data, error } = await api
                .from('contact_info')
                .select('*')
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            if (data) {
                setContact({
                    address: data.address,
                    phone: data.phone,
                    email: data.email
                });
                setId(data.id);
            }
        } catch (err) {
            console.error('Error fetching contact info:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let res;
            if (id) {
                res = await api
                    .from('contact_info')
                    .update({
                        address: contact.address,
                        phone: contact.phone,
                        email: contact.email,
                        updated_at: new Date()
                    })
                    .eq('id', id);
            } else {
                res = await api
                    .from('contact_info')
                    .insert([
                        {
                            address: contact.address,
                            phone: contact.phone,
                            email: contact.email
                        }
                    ]);
            }

            if (res.error) throw res.error;
            alert('Contact information updated successfully!');
            fetchContact();
        } catch (err) {
            console.error('Error saving contact info:', err);
            alert('Error saving contact information.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-gray-400 uppercase tracking-widest">Loading contact info...</div>;

    return (
        <div className="space-y-10">
            <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Contact Information</h3>
                <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">Manage the information displayed on the Inquiry page</p>
            </div>

            <form onSubmit={handleSave} className="bg-white border-2 border-black p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <MapPin size={12} /> Office Address
                        </label>
                        <textarea
                            className="w-full border-b-2 border-black py-3 font-bold text-lg focus:outline-none bg-transparent resize-none h-24"
                            value={contact.address}
                            onChange={(e) => setContact({ ...contact, address: e.target.value })}
                            placeholder="주소를 입력하세요"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <Phone size={12} /> Contact Number
                            </label>
                            <input
                                className="w-full border-b-2 border-black py-3 font-bold text-lg focus:outline-none bg-transparent"
                                value={contact.phone}
                                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                placeholder="연락처를 입력하세요"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <Mail size={12} /> Support Email
                            </label>
                            <input
                                type="email"
                                className="w-full border-b-2 border-black py-3 font-bold text-lg focus:outline-none bg-transparent"
                                value={contact.email}
                                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                placeholder="이메일을 입력하세요"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-black text-white px-10 py-5 text-sm font-black uppercase tracking-widest hover:bg-cdg-red transition-all flex items-center gap-3 disabled:bg-gray-400"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactManagement;
