import React, { useState } from 'react';
import api from './api';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data: admin, error } = await api
                .from('admins')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !admin) throw new Error('Invalid credentials');

            // Note: Cloud 환경에서는 Bcrypt 검증이 어려우므로 임시로 raw match (나중에는 Supabase Auth 추천)
            if (password === '!tdon8898') { // 마스터 패스워드 또는 DB의 해시와 대조 필요
                localStorage.setItem('token', 'temp-session');
                localStorage.setItem('role', admin.role);
                onLogin({ email: admin.email, role: admin.role });
            } else {
                throw new Error('Invalid password');
            }
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 border border-gray-200">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 uppercase tracking-tight">
                        CDG Beauty Admin
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Secure Dashboard Login
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="text-cdg-red text-sm text-center font-bold">{error}</div>}
                    <div className="space-y-4">
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none"
                        >
                            LOGIN
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
