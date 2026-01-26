import React, { useState } from 'react';
import { Users, Image, Settings, LogOut, ChevronRight } from 'lucide-react';
import UserManagement from './UserManagement';
import AssetManagement from './AssetManagement';
import EmailConfig from './EmailConfig';

const Dashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('assets');

    const menuItems = [
        { id: 'assets', label: 'Media Management', icon: <Image size={20} /> },
        { id: 'users', label: 'Admin Management', icon: <Users size={20} />, roles: ['main'] },
        { id: 'email', label: 'Email Config', icon: <Settings size={20} />, roles: ['main'] },
    ];

    const filteredMenu = menuItems.filter(item => !item.roles || item.roles.includes(user.role));

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <div className="w-72 bg-black text-white flex flex-col">
                <div className="p-8 border-b border-gray-800">
                    <h1 className="text-xl font-extrabold tracking-tighter uppercase">CDG Beauty</h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Admin Dashboard</p>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    {filteredMenu.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-all ${activeTab === item.id
                                    ? 'bg-white text-black'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {item.icon}
                                <span>{item.label}</span>
                            </div>
                            {activeTab === item.id && <ChevronRight size={16} />}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-4 px-4 overflow-hidden">
                        <div className="w-8 h-8 bg-cdg-red flex-shrink-0 flex items-center justify-center font-bold">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div className="text-xs truncate">
                            <p className="font-bold text-gray-200">{user.email}</p>
                            <p className="text-gray-500 uppercase">{user.role} Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 hover:text-cdg-red transition-colors"
                    >
                        <LogOut size={20} />
                        <span>LOGOUT</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-gray-200 h-20 flex items-center px-10">
                    <h2 className="text-2xl font-extrabold uppercase tracking-tight">
                        {menuItems.find(i => i.id === activeTab)?.label}
                    </h2>
                </header>

                <main className="flex-1 overflow-y-auto p-10">
                    <div className="max-w-6xl mx-auto">
                        {activeTab === 'users' && <UserManagement />}
                        {activeTab === 'assets' && <AssetManagement />}
                        {activeTab === 'email' && <EmailConfig />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
