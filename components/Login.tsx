import React, { useState } from 'react';
import { User } from '../types';
import { GraduationCap } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin({
        username: name,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`,
        role: 'student'
      });
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg rotate-3 hover:rotate-6 transition-transform">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-2">LitMaster AI</h1>
        <p className="text-slate-500 mb-8">语文冲刺提分训练营</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-center text-lg"
            required
          />
          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1"
          >
            开始学习 (Start Learning)
          </button>
        </form>
        
        <p className="mt-8 text-xs text-slate-400">
          Powered by Google Gemini 2.5 Flash
        </p>
      </div>
    </div>
  );
};

export default Login;