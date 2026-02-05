import React from 'react';
import { Camera, AlertCircle } from 'lucide-react';

const AssetManagement = () => {
    return (
        <div className="p-20 text-center space-y-6 bg-white border border-gray-100 shadow-sm">
            <Camera size={48} className="mx-auto text-gray-200" />
            <div>
                <h3 className="text-xl font-bold uppercase mb-2">Asset Management (Under Migration)</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto italic">
                    The direct image replacement tool is being updated to support secure GitHub API integration via Supabase.
                    Please update images directly in the repository for now.
                </p>
            </div>
        </div>
    );
};

export default AssetManagement;
