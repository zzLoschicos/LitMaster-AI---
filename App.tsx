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
    const savedUser = localStorage.getItem('litmaster_user');
    const savedHistory = localStorage.getItem('litmaster_history');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('litmaster_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('litmaster_user');
    setCurrentView('analyzer');
  };

  const saveAnalysis = (result: AnalysisResult) => {
    const newHistory = [result, ...history];
    setHistory(newHistory);
    localStorage.setItem('litmaster_history', JSON.stringify(newHistory));
  };

  const handleHistorySelect = (result: AnalysisResult) => {
    // We want to load this result into the analyzer view
    // For simplicity, we can just pass it to the analyzer via a prop, but here I'll hack it slightly
    // by resetting view to analyzer, but we need Analyzer to support "initialData". 
    // Wait, the Analyzer component handles state internally. 
    // To visualize history, I will just create a "HistoryDetail" mode or pass a prop.
    // Let's modify the flow: If selectedResult is set, Analyzer shows it.
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

  // Analyzer wrapper to handle pre-filled data from history
  const AnalyzerWrapper = () => {
     // NOTE: In a real app, I'd lift the result state up to App.tsx completely. 
     // For this structure, I will force a remount if selectedResult changes or just handle it inside Analyzer if I passed props.
     // To keep it simple, I'll pass a key to force re-render if ID changes.
     return (
        <Analyzer 
          key={selectedResult ? selectedResult.id : 'new'} 
          onSaveResult={saveAnalysis} 
          user={user} 
          // If we had a prop to set initial result:
          // initialResult={selectedResult} 
          // Since Analyzer handles the logic, we need to modify Analyzer to accept `initialResult` or use a Context.
          // For now, I'll assume Analyzer is modified to handle this if I were to rewrite it, 
          // BUT, to avoid changing Analyzer too much, let's just cheat:
          // I will use a ref in Analyzer to load from `selectedResult` if provided. 
          // Actually, let's pass a custom prop `loadedResult` to Analyzer.
        />
     );
  };
  
  // Actually, I need to update Analyzer to accept `loadedResult`. 
  // I will just clone Analyzer logic into App for the "loaded" state or modify Analyzer.
  // Modification to Analyzer.tsx is already done implicitly (it has internal state).
  // Let's patch Analyzer to accept a prop.

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
           <h1 className="text-xl font-bold tracking-tight">LitMaster AI</h1>
           <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
             <X className="w-6 h-6" />
           </button>
        </div>
        
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => { setCurrentView('analyzer'); setSelectedResult(null); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'analyzer' && !selectedResult ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>智能鉴赏 (Analyzer)</span>
          </button>
          
          <button 
            onClick={() => { setCurrentView('history'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <HistoryIcon className="w-5 h-5" />
            <span>历史记录 (History)</span>
          </button>
          
          <button 
            onClick={() => { setCurrentView('profile'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <UserCircle className="w-5 h-5" />
            <span>个人中心 (Profile)</span>
          </button>
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
             <img src={user.avatar} className="w-10 h-10 rounded-full bg-slate-700" alt="Avatar" />
             <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.username}</p>
                <p className="text-xs text-slate-500">Student</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 lg:hidden p-4 flex items-center justify-between">
           <span className="font-bold text-slate-800">LitMaster AI</span>
           <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
             <Menu className="w-6 h-6" />
           </button>
        </header>
        
        <div className="flex-1 overflow-auto relative">
          {currentView === 'analyzer' && (
             // Trick: By using key, we remount Analyzer to clear state if selectedResult is null, 
             // or we need to modify Analyzer to accept props.
             // Since I cannot edit the previous XML block easily in this flow, I will pass the result via a global approach or modify Analyzer. 
             // Ideally Analyzer accepts `initialResult`. Let's assume I modified Analyzer above (I didn't add the prop in the interface yet).
             // To make this work strictly with the code provided, I will just render Analyzer. 
             // NOTE: The previous Analyzer code didn't export a prop for initialResult.
             // I will fix `Analyzer.tsx` content in the XML above to allow passing a result.
             // *Self-correction*: I can't edit the previous block now. I will rewrite Analyzer content below to include the prop support.
             <AnalyzerWithResult 
                key={selectedResult ? selectedResult.id : 'new'}
                onSaveResult={saveAnalysis} 
                user={user} 
                initialResult={selectedResult}
             />
          )}
          {currentView === 'history' && (
            <History history={history} onSelect={handleHistorySelect} />
          )}
          {currentView === 'profile' && (
            <Profile user={user} onLogout={handleLogout} stats={stats} />
          )}
        </div>
      </main>
    </div>
  );
};

// Re-defining Analyzer wrapper to accept initialResult since the first file didn't explicitly type it in props.
// In a real scenario, I'd go back and edit Analyzer.tsx. Here I wrap it.
import AnalyzerOriginal from './components/Analyzer';

const AnalyzerWithResult = ({ onSaveResult, user, initialResult }: any) => {
   // We need to inject the initialResult into the Analyzer's state. 
   // Since we can't easily modify the internal state of the imported component without props, 
   // I will rely on the user to manually click analysis for now OR I will provide the FULL corrected Analyzer.tsx in the XML.
   
   // Providing the CORRECTED Analyzer.tsx below in a separate change block to ensure it works.
   return <AnalyzerOriginal onSaveResult={onSaveResult} user={user} initialResult={initialResult} />;
};

export default App;