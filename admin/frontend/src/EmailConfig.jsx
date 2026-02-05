import React from 'react';
import { Mail, Shield, AlertCircle } from 'lucide-react';

const EmailConfig = () => {
    return (
        <div className="p-20 text-center space-y-6 bg-white border border-gray-100 shadow-sm">
            <AlertCircle size={48} className="mx-auto text-gray-200" />
            <div>
                <h3 className="text-xl font-bold uppercase mb-2">Email Configuration (Under Maintenance)</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto italic">
                    The email configuration module is currently being migrated to Supabase Edge Functions.
                    Please use the default receiver (top@kwavem.com) for now.
                </p>
            </div>

            <div className="bg-gray-50 p-6 border-l-2 border-black inline-block text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Default Notification Flow</p>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold">1</div>
                    <span className="text-sm font-medium">Site Inquiry Submitted</span>
                </div>
                <div className="h-4 w-px bg-gray-200 ml-4 my-1"></div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cdg-red text-white flex items-center justify-center font-bold">2</div>
                    <span className="text-sm font-medium">Forwarded to top@kwavem.com (Fallback)</span>
                </div>
            </div>
        </div>
    );
};

export default EmailConfig;
