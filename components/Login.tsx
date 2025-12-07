import React, { useState } from 'react';
import { User } from '../types';
import { GraduationCap, ArrowRight, UserPlus, LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请填写所有字段');
      return;
    }

    if (isRegister) {
      if (password.length < 5) {
        setError('密码太简单（至少5位）');
        return;
      }
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }

      // Simulating registration by saving to localStorage
      const users = JSON.parse(localStorage.getItem('litmaster_users') || '[]');
      if (users.find((u: User) => u.username === username)) {
        setError('用户名已存在');
        return;
      }

      const newUser: User = {
        username,
        password, // In a real app, hash this!
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${username}`,
        role: 'student'
      };
      
      users.push(newUser);
      localStorage.setItem('litmaster_users', JSON.stringify(users));
      onLogin(newUser);

    } else {
      // Login logic
      const users = JSON.parse(localStorage.getItem('litmaster_users') || '[]');
      const foundUser = users.find((u: User) => u.username === username && u.password === password);
      
      if (foundUser) {
        onLogin(foundUser);
      } else {
        setError('用户名或密码错误');
      }
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md text-center transition-all">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg rotate-3 hover:rotate-6 transition-transform">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-2">LitMaster AI</h1>
        <p className="text-slate-500 mb-8">语文冲刺提分训练营</p>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button 
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isRegister ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            登录
          </button>
          <button 
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isRegister ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            注册
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg"
            required
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg"
            required
          />
          
          {isRegister && (
             <input
              type="password"
              placeholder="确认密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg animate-in fade-in slide-in-from-top-2"
              required
            />
          )}

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isRegister ? <UserPlus className="w-5 h-5"/> : <LogIn className="w-5 h-5"/>}
            {isRegister ? '注册账号' : '开始学习'}
          </button>
        </form>
        
        <p className="mt-8 text-xs text-slate-400">
          技术支持：Google Gemini 2.5 Flash
        </p>
      </div>
    </div>
  );
};

export default Login;