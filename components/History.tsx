import React from 'react';
import { AnalysisResult } from '../types';
import { Clock, BookOpen, ChevronRight } from 'lucide-react';

interface HistoryProps {
  history: AnalysisResult[];
  onSelect: (result: AnalysisResult) => void;
}

const History: React.FC<HistoryProps> = ({ history, onSelect }) => {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
        <Clock className="w-8 h-8 text-indigo-600" /> 学习记录 (History)
      </h2>
      
      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
           <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-500 text-lg">暂无记录。开始分析一篇新文章吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-300 cursor-pointer transition-all group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                 <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    item.textType === 'PROSE' ? 'bg-blue-100 text-blue-700' :
                    item.textType === 'POETRY' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-purple-100 text-purple-700'
                 }`}>
                    {item.textType}
                 </div>
                 <span className="text-slate-400 text-xs">
                    {new Date(item.timestamp).toLocaleDateString()}
                 </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {item.title}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">
                {item.summary}
              </p>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <span className="text-xs text-slate-400 font-medium">{item.generatedQuestions.length} Questions</span>
                <div className="flex items-center text-indigo-600 font-bold text-sm gap-1 group-hover:gap-2 transition-all">
                    复习 (Review) <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
