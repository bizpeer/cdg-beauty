import React from 'react';
import { ShieldAlert } from 'lucide-react';

const UserManagement = () => {
    return (
        <div className="p-20 text-center space-y-4 bg-white border border-gray-100 shadow-sm">
            <ShieldAlert size={48} className="mx-auto text-gray-200" />
            <h3 className="text-xl font-bold uppercase tracking-tight">Admin Management (Locked)</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto italic">
                Direct admin creation is temporarily disabled while we transition to full RBAC.
                Please contact the system administrator to manage sub-accounts via Supabase Dashboard.
            </p>
        </div>
    );
};

export default UserManagement;
