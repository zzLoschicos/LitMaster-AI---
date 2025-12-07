import React, { useState, useRef, useEffect } from 'react';
import { TextType, AnalysisResult, ChatMessage } from '../types';
import { analyzeText, chatWithTutor } from '../services/geminiService';
import { BookOpen, Send, Loader2, FileText, PenTool, Layout, ChevronDown, ChevronUp, BrainCircuit, XCircle } from 'lucide-react';

interface AnalyzerProps {
  onSaveResult: (result: AnalysisResult) => void;
  user: any;
  initialResult?: AnalysisResult | null;
}

const Analyzer: React.FC<AnalyzerProps> = ({ onSaveResult, user, initialResult }) => {
  const [inputText, setInputText] = useState(initialResult?.originalText || '');
  const [textType, setTextType] = useState<TextType>(initialResult?.textType || 'PROSE');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(initialResult || null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'qa'>('analysis');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load initial result if provided
  useEffect(() => {
    if (initialResult) {
        setResult(initialResult);
        setInputText(initialResult.originalText);
        setTextType(initialResult.textType);
        setChatMessages([{
            role: 'model',
            text: `欢迎回来！我们正在回顾《${initialResult.title}》。有什么想复习的吗？`,
            timestamp: Date.now()
        }]);
    }
  }, [initialResult]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setResult(null);
    setChatMessages([]); 

    try {
      const data = await analyzeText(inputText, textType);
      setResult(data);
      onSaveResult(data);
      // Initial greeting from tutor
      setChatMessages([{
        role: 'model',
        text: `你好！我是你的语文助教壮壮。我已经分析了这篇${textType === 'POETRY' ? '诗歌' : textType === 'NOVEL' ? '小说' : '散文'}。你可以问我关于文中具体字词的含义、写作手法或主旨的问题。`,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again. Ensure your API Key is valid.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || !result) return;
    
    const newMessage: ChatMessage = { role: 'user', text: chatInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const apiHistory = chatMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const responseText = await chatWithTutor(apiHistory, newMessage.text, result.originalText);
      
      setChatMessages(prev => [...prev, {
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      }]);
    } catch (e) {
      console.error(e);
      setChatMessages(prev => [...prev, {
        role: 'model',
        text: "网络错误，请稍后再试。",
        timestamp: Date.now()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const resetAnalyzer = () => {
      setResult(null);
      setInputText('');
      setChatMessages([]);
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header Area */}
      <div className="p-6 bg-white border-b border-slate-200 shadow-sm flex-none">
        <h2 className="text-2xl font-serif-sc font-bold text-slate-800 flex items-center gap-2">
          <PenTool className="w-6 h-6 text-indigo-600" />
          {result ? result.title : "新文章鉴赏"}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {result ? "分析完成" : "输入文章内容，系统将自动生成考点解析与模拟题。"}
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Input / Original Text */}
        <div className={`flex flex-col p-6 overflow-y-auto transition-all duration-300 ${result ? 'lg:w-1/3 border-r border-slate-200' : 'w-full'}`}>
           {!result && (
             <div className="mb-4 flex gap-4">
               {(['PROSE', 'POETRY', 'NOVEL'] as TextType[]).map(t => (
                 <button
                   key={t}
                   onClick={() => setTextType(t)}
                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                     textType === t 
                       ? 'bg-indigo-600 text-white shadow-md' 
                       : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                   }`}
                 >
                   {t === 'PROSE' ? '散文 (Prose)' : t === 'POETRY' ? '诗歌 (Poetry)' : '小说 (Novel)'}
                 </button>
               ))}
             </div>
           )}

           <label className="text-sm font-semibold text-slate-700 mb-2 block flex justify-between">
             <span>{result ? "原文内容" : "在此输入文章/诗词:"}</span>
             {result && <button onClick={resetAnalyzer} className="text-xs text-indigo-600 hover:underline">New Analysis</button>}
           </label>
           
           <textarea
             className={`flex-1 w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-serif-sc text-lg leading-loose text-slate-700 shadow-inner ${result ? 'bg-slate-50' : ''}`}
             placeholder="请粘贴您需要分析的文章、诗词或小说片段..."
             value={inputText}
             onChange={(e) => setInputText(e.target.value)}
             readOnly={!!result}
           />

           {!result && (
             <button
               onClick={handleAnalyze}
               disabled={isLoading || !inputText.trim()}
               className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
               开始智能鉴赏 (Start Analysis)
             </button>
           )}
        </div>

        {/* Right Panel: Analysis Result */}
        {result && (
          <div className="flex-[2] flex flex-col overflow-hidden bg-slate-50/50">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-6">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'analysis' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                全维解析 (Analysis)
              </button>
              <button
                onClick={() => setActiveTab('qa')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'qa' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                名师答疑 (Tutor Chat)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
              {activeTab === 'analysis' ? (
                <div className="space-y-6 max-w-4xl mx-auto">
                  
                  {/* Summary & Structure */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                      <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-500" /> 文章大意
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-sm">{result.summary}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                      <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Layout className="w-5 h-5 text-blue-500" /> 结构脉络
                      </h3>
                      <ul className="space-y-2">
                         {result.structure.map((step, idx) => (
                           <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                             <span className="flex-none bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">{idx + 1}</span>
                             {step}
                           </li>
                         ))}
                      </ul>
                    </div>
                  </div>

                  {/* Key Techniques */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <PenTool className="w-5 h-5 text-purple-500" /> 鉴赏技巧与手法
                    </h3>
                    <div className="grid gap-4">
                      {result.techniques.map((tech, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                           <div className="flex-none sm:w-32 font-bold text-purple-700">{tech.name}</div>
                           <div className="flex-1 space-y-2">
                              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Example</div>
                              <div className="text-slate-700 italic font-serif-sc">“{tech.example}”</div>
                              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">Effect</div>
                              <div className="text-slate-600 text-sm">{tech.effect}</div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Themes */}
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-pink-500" /> 核心主旨
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {result.themes.map((theme, idx) => (
                            <span key={idx} className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm font-medium border border-pink-100">
                                {theme}
                            </span>
                        ))}
                    </div>
                   </div>

                  {/* Generated Questions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-500" /> 模拟考题与标准答案
                    </h3>
                    {result.generatedQuestions.map((q, idx) => (
                      <QuestionCard key={idx} question={q} index={idx} />
                    ))}
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   {/* Chat History */}
                   <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                              {msg.role === 'user' ? <span className="text-white text-xs">Me</span> : <span className="text-white text-xs">壮</span>}
                            </div>
                            <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                              msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-200">
                             <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                   </div>
                   
                   {/* Chat Input */}
                   <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
                     <input 
                       type="text" 
                       value={chatInput}
                       onChange={(e) => setChatInput(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                       placeholder="Ask Zhuang Zhuang a question..."
                       className="flex-1 px-4 py-2 bg-slate-100 rounded-full border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                     />
                     <button 
                       onClick={handleChatSend}
                       disabled={isChatLoading || !chatInput.trim()}
                       className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                     >
                       <Send className="w-5 h-5" />
                     </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const QuestionCard: React.FC<{ question: any, index: number }> = ({ question, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <span className="flex-none w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold text-sm">
          Q{index + 1}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{question.type}</span>
          </div>
          <p className="font-medium text-slate-800">{question.question}</p>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </div>
      
      {isOpen && (
        <div className="bg-orange-50/30 border-t border-slate-100 p-5 pl-16 animate-in slide-in-from-top-2 duration-200">
          <div className="mb-4">
            <h4 className="text-xs font-bold text-emerald-600 mb-2 uppercase flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
               Standard Answer (参考答案)
            </h4>
            <p className="text-slate-700 bg-white p-3 rounded-lg border border-emerald-100 shadow-sm text-sm leading-relaxed font-serif-sc">
              {question.standardAnswer}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-600 mb-2 uppercase flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-blue-500"></span>
               Parsing & Logic (解析)
            </h4>
            <p className="text-slate-600 text-sm">
              {question.analysis}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analyzer;