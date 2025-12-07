import React from 'react';
import { User, AnalysisResult } from '../types';
import { User as UserIcon, LogOut, Award, BarChart } from 'lucide-react';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  stats: { total: number, prose: number, poetry: number, novel: number };
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, stats }) => {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 h-32 relative">
           <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
             <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white bg-white" />
           </div>
        </div>
        
        <div className="pt-16 pb-8 text-center px-4">
          <h2 className="text-2xl font-bold text-slate-800">{user.username}</h2>
          <p className="text-indigo-500 font-medium">Student • 提分冲刺班</p>
        </div>

        <div className="grid grid-cols-3 border-t border-slate-100 divide-x divide-slate-100">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Total Analysis</div>
          </div>
          <div className="p-4 text-center">
             <div className="text-2xl font-bold text-emerald-600">{stats.poetry}</div>
             <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Poetry</div>
          </div>
          <div className="p-4 text-center">
             <div className="text-2xl font-bold text-blue-600">{stats.prose + stats.novel}</div>
             <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Prose/Novel</div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100">
           <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
             <Award className="w-5 h-5 text-orange-500" /> Achievements
           </h3>
           <div className="flex gap-2 flex-wrap">
             <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Newbie Scholar</span>
             {stats.total > 5 && <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">Diligent Reader</span>}
             {stats.poetry > 3 && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Poet Master</span>}
           </div>
        </div>
        
        <div className="p-4 bg-slate-50 text-center">
          <button 
            onClick={onLogout}
            className="text-red-500 font-medium flex items-center justify-center gap-2 hover:text-red-600 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;