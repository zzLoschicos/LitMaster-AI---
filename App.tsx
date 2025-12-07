import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Analyzer from './components/Analyzer';
import History from './components/History';
import Profile from './components/Profile';
import { User, AnalysisResult } from './types';
import { LayoutDashboard, History as HistoryIcon, UserCircle, Menu, X } from 'lucide-react';

type View = 'analyzer' | 'history' | 'profile';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('analyzer');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Load data from local storage
    const savedUser = localStorage.getItem('litmaster_current_user');
    const savedHistory = localStorage.getItem('litmaster_history');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('litmaster_current_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('litmaster_current_user');
    setCurrentView('analyzer');
    setSelectedResult(null);
  };

  const saveAnalysis = (result: AnalysisResult) => {
    // Check if result already exists to update it (e.g. for chat history) or add new
    let newHistory;
    const existingIndex = history.findIndex(h => h.id === result.id);
    
    if (existingIndex >= 0) {
        newHistory = [...history];
        newHistory[existingIndex] = result;
    } else {
        newHistory = [result, ...history];
    }
    
    setHistory(newHistory);
    localStorage.setItem('litmaster_history', JSON.stringify(newHistory));
  };

  const handleHistorySelect = (result: AnalysisResult) => {
    setSelectedResult(result);
    setCurrentView('analyzer');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Calculate stats for profile
  const stats = {
    total: history.length,
    prose: history.filter(h => h.textType === 'PROSE').length,
    poetry: history.filter(h => h.textType === 'POETRY').length,
    novel: history.filter(h => h.textType === 'NOVEL').length,
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl lg:shadow-none print:hidden`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
           <h1 className="text-xl font-bold tracking-tight text-indigo-400">LitMaster AI</h1>
           <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
             <X className="w-6 h-6" />
           </button>
        </div>
        
        <nav className="p-4 space-y-2 mt-4">
          <button 
            onClick={() => { setCurrentView('analyzer'); setSelectedResult(null); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'analyzer' && !selectedResult ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">智能鉴赏</span>
          </button>
          
          <button 
            onClick={() => { setCurrentView('history'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <HistoryIcon className="w-5 h-5" />
            <span className="font-medium">历史记录</span>
          </button>
          
          <button 
            onClick={() => { setCurrentView('profile'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <UserCircle className="w-5 h-5" />
            <span className="font-medium">个人中心</span>
          </button>
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
             <img src={user.avatar} className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-slate-700" alt="Avatar" />
             <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user.username}</p>
                <p className="text-xs text-indigo-400">在线学习中...</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 lg:hidden p-4 flex items-center justify-between shadow-sm sticky top-0 z-10 print:hidden">
           <span className="font-bold text-slate-800 text-lg">LitMaster AI</span>
           <button onClick={() => setSidebarOpen(true)} className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg">
             <Menu className="w-6 h-6" />
           </button>
        </header>
        
        <div className="flex-1 overflow-hidden relative">
          {currentView === 'analyzer' && (
             // Key forces remount when switching between "New Analysis" (null) and a history item
             <Analyzer 
                key={selectedResult ? selectedResult.id : 'new-analysis'}
                onSaveResult={saveAnalysis} 
                user={user} 
                initialResult={selectedResult}
             />
          )}
          {currentView === 'history' && (
            <div className="h-full overflow-y-auto">
                <History history={history} onSelect={handleHistorySelect} />
            </div>
          )}
          {currentView === 'profile' && (
             <div className="h-full overflow-y-auto">
                <Profile user={user} onLogout={handleLogout} stats={stats} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;