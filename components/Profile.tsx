import React from 'react';
import { User } from '../types';
import { LogOut, Award, User as UserIcon } from 'lucide-react';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  stats: { total: number, prose: number, poetry: number, novel: number };
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, stats }) => {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32 relative">
           <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
             <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md" />
           </div>
        </div>
        
        <div className="pt-16 pb-8 text-center px-4">
          <h2 className="text-3xl font-bold text-slate-800">{user.username}</h2>
          <p className="text-indigo-500 font-medium mt-1 flex items-center justify-center gap-1">
             <UserIcon className="w-4 h-4" /> {user.role === 'teacher' ? '老师' : '学生'} • 提分冲刺班
          </p>
        </div>

        <div className="grid grid-cols-3 border-t border-slate-100 divide-x divide-slate-100 bg-slate-50/50">
          <div className="p-6 text-center group cursor-pointer hover:bg-indigo-50 transition-colors">
            <div className="text-3xl font-bold text-slate-800 group-hover:text-indigo-600">{stats.total}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1 font-bold">累计鉴赏</div>
          </div>
          <div className="p-6 text-center group cursor-pointer hover:bg-emerald-50 transition-colors">
             <div className="text-3xl font-bold text-emerald-600">{stats.poetry}</div>
             <div className="text-xs text-slate-500 uppercase tracking-wider mt-1 font-bold">诗歌</div>
          </div>
          <div className="p-6 text-center group cursor-pointer hover:bg-blue-50 transition-colors">
             <div className="text-3xl font-bold text-blue-600">{stats.prose + stats.novel}</div>
             <div className="text-xs text-slate-500 uppercase tracking-wider mt-1 font-bold">散文/小说</div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100">
           <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-lg">
             <Award className="w-6 h-6 text-orange-500" /> 学习成就
           </h3>
           <div className="flex gap-3 flex-wrap">
             <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold border border-yellow-200">🌱 初级学者</span>
             {stats.total > 5 && <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold border border-indigo-200">📚 勤奋读者</span>}
             {stats.poetry > 3 && <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200">🌸 诗词达人</span>}
             {stats.novel > 3 && <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold border border-purple-200">📖 小说专家</span>}
           </div>
        </div>
        
        <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="w-full py-3 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" /> 退出登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;