import React, { useState, useRef, useEffect } from 'react';
import { TextType, AnalysisResult, ChatMessage } from '../types';
import { analyzeText, chatWithTutor } from '../services/geminiService';
import { BookOpen, Send, Loader2, FileText, PenTool, Layout, ChevronDown, ChevronUp, BrainCircuit, RotateCcw, Download, Printer } from 'lucide-react';

interface AnalyzerProps {
  onSaveResult: (result: AnalysisResult) => void;
  user: any;
  initialResult?: AnalysisResult | null;
}

const cleanText = (text: string) => {
  if (!text) return "";
  // Remove ** bold markers and other common markdown artifacts if necessary
  return text.replace(/\*\*/g, '').replace(/__/, ''); 
};

const Analyzer: React.FC<AnalyzerProps> = ({ onSaveResult, user, initialResult }) => {
  const [inputText, setInputText] = useState(initialResult?.originalText || '');
  const [textType, setTextType] = useState<TextType>(initialResult?.textType || 'PROSE');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(initialResult || null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'qa'>('analysis');
  const [mobileTab, setMobileTab] = useState<'text' | 'result'>('text');
  
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
        setMobileTab('result'); // Switch to result view on mobile when loaded
        // Load chat history if it exists, otherwise greeting
        if (initialResult.chatHistory && initialResult.chatHistory.length > 0) {
            setChatMessages(initialResult.chatHistory);
        } else {
             setChatMessages([{
                role: 'model',
                text: `欢迎回来！我们正在回顾《${cleanText(initialResult.title)}》。有什么想复习的吗？`,
                timestamp: Date.now()
            }]);
        }
        setActiveTab('analysis'); // Default to analysis view
    } else {
        resetAnalyzer();
    }
  }, [initialResult]);

  // Update saved result when chat changes
  useEffect(() => {
    if (result && chatMessages.length > 0) {
        // Chat persistence logic handled by parent via onSaveResult in handleChatSend
    }
  }, [chatMessages, result]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setResult(null);
    setChatMessages([]); 

    try {
      const data = await analyzeText(inputText, textType);
      const greetingMsg: ChatMessage = {
        role: 'model',
        text: `你好！我是你的语文助教壮壮。我已经分析了这篇${textType === 'POETRY' ? '诗歌' : textType === 'NOVEL' ? '小说' : '散文'}。你可以问我关于文中具体字词的含义、写作手法或主旨的问题。`,
        timestamp: Date.now()
      };
      
      const resultWithChat = {
          ...data,
          chatHistory: [greetingMsg]
      };

      setResult(resultWithChat);
      setChatMessages([greetingMsg]);
      onSaveResult(resultWithChat);
      setMobileTab('result'); // Auto switch to result on mobile
      
    } catch (error) {
      console.error(error);
      alert("分析失败，请重试。请确保您的 API Key 有效。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || !result) return;
    
    const newMessage: ChatMessage = { role: 'user', text: chatInput, timestamp: Date.now() };
    const updatedMessages = [...chatMessages, newMessage];
    
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const apiHistory = updatedMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const responseText = await chatWithTutor(apiHistory, newMessage.text, result.originalText);
      
      const botResponse: ChatMessage = {
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, botResponse];
      setChatMessages(finalMessages);
      
      // Update result with new chat history and save to parent
      const updatedResult = { ...result, chatHistory: finalMessages };
      setResult(updatedResult);
      onSaveResult(updatedResult);

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

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const resetAnalyzer = () => {
      setResult(null);
      setInputText('');
      setChatMessages([]);
      setTextType('PROSE');
      setMobileTab('text');
  }

  return (
    <>
    <div className="flex flex-col h-full bg-slate-50 relative print:hidden">
      {/* Header Area */}
      <div className="p-4 lg:p-6 bg-white border-b border-slate-200 shadow-sm flex-none flex justify-between items-center z-20">
        <div>
            <h2 className="text-xl lg:text-2xl font-serif-sc font-bold text-slate-800 flex items-center gap-2">
            <PenTool className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600" />
            <span className="truncate max-w-[200px] lg:max-w-md">
                {result ? cleanText(result.title) : "新文章鉴赏"}
            </span>
            </h2>
            <p className="text-slate-500 text-xs lg:text-sm mt-1 hidden sm:block">
            {result ? "分析完成" : "输入文章内容，系统将自动生成考点解析与模拟题。"}
            </p>
        </div>
        
        <div className="flex gap-2">
            {result && (
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs lg:text-sm font-medium whitespace-nowrap shadow-sm"
                    title="将在打印对话框中保存为PDF"
                >
                    <Printer className="w-4 h-4" /> <span className="hidden sm:inline">打印/导出PDF</span>
                </button>
            )}
            {result && (
                <button 
                    onClick={resetAnalyzer}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-xs lg:text-sm font-medium whitespace-nowrap"
                >
                    <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">新建分析</span>
                </button>
            )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Mobile Tabs Switcher */}
        {result && (
            <div className="lg:hidden flex border-b border-slate-200 bg-white shrink-0 z-10">
                <button 
                onClick={() => setMobileTab('text')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${mobileTab === 'text' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500'}`}
                >
                原文内容
                </button>
                <button 
                onClick={() => setMobileTab('result')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${mobileTab === 'result' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500'}`}
                >
                鉴赏解析
                </button>
            </div>
        )}

        {/* Left Panel: Input / Original Text */}
        <div className={`
            flex flex-col p-6 overflow-y-auto transition-all duration-300
            ${!result ? 'w-full max-w-4xl mx-auto h-full' : ''}
            ${result ? 'lg:w-1/3 lg:border-r border-slate-200' : ''}
            ${result && mobileTab === 'result' ? 'hidden lg:flex' : 'flex-1'} 
        `}>
           {!result && (
             <div className="mb-6 flex gap-2 lg:gap-4 justify-center">
               {(['PROSE', 'POETRY', 'NOVEL'] as TextType[]).map(t => (
                 <button
                   key={t}
                   onClick={() => setTextType(t)}
                   className={`px-4 py-2 lg:px-6 lg:py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                     textType === t 
                       ? 'bg-indigo-600 text-white ring-2 ring-indigo-200 ring-offset-2' 
                       : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                   }`}
                 >
                   {t === 'PROSE' ? '散文' : t === 'POETRY' ? '诗歌' : '小说'}
                 </button>
               ))}
             </div>
           )}

           <label className="text-sm font-semibold text-slate-700 mb-2 block flex justify-between">
             <span>{result ? "原文" : "在此输入文章/诗词:"}</span>
           </label>
           
           <textarea
             className={`flex-1 w-full p-6 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none resize-none font-serif-sc text-lg leading-loose text-slate-700 shadow-inner transition-all ${result ? 'bg-slate-50' : 'min-h-[300px]'}`}
             placeholder="请粘贴您需要分析的文章、诗词或小说片段..."
             value={inputText}
             onChange={(e) => setInputText(e.target.value)}
             readOnly={!!result}
           />

           {!result && (
             <button
               onClick={handleAnalyze}
               disabled={isLoading || !inputText.trim()}
               className="mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
             >
               {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <BrainCircuit className="w-6 h-6" />}
               开始智能鉴赏
             </button>
           )}
        </div>

        {/* Right Panel: Analysis Result */}
        {result && (
          <div className={`
             flex flex-col overflow-hidden bg-slate-50/50 
             lg:flex-[2]
             ${mobileTab === 'text' ? 'hidden lg:flex' : 'flex-1'}
          `}>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-6 shrink-0">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`py-3 lg:py-4 px-4 lg:px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'analysis' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                全维解析
              </button>
              <button
                onClick={() => setActiveTab('qa')}
                className={`py-3 lg:py-4 px-4 lg:px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'qa' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                名师答疑
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
              {activeTab === 'analysis' ? (
                <div className="space-y-6 max-w-4xl mx-auto pb-20">
                  
                  {/* Summary & Structure */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-500" /> 文章大意
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-sm">{cleanText(result.summary)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Layout className="w-5 h-5 text-blue-500" /> 结构脉络
                      </h3>
                      <ul className="space-y-3">
                         {result.structure.map((step, idx) => (
                           <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                             <span className="flex-none bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">{idx + 1}</span>
                             {cleanText(step)}
                           </li>
                         ))}
                      </ul>
                    </div>
                  </div>

                  {/* Key Techniques */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <PenTool className="w-5 h-5 text-purple-500" /> 鉴赏技巧与手法
                    </h3>
                    <div className="grid gap-4">
                      {result.techniques.map((tech, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                           <div className="flex-none sm:w-32 font-bold text-purple-700">{cleanText(tech.name)}</div>
                           <div className="flex-1 space-y-2">
                              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">例句 (Example)</div>
                              <div className="text-slate-700 italic font-serif-sc">“{cleanText(tech.example)}”</div>
                              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">作用 (Effect)</div>
                              <div className="text-slate-600 text-sm">{cleanText(tech.effect)}</div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Themes */}
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-pink-500" /> 核心主旨
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {result.themes.map((theme, idx) => (
                            <span key={idx} className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm font-medium border border-pink-100">
                                {cleanText(theme)}
                            </span>
                        ))}
                    </div>
                   </div>

                  {/* Generated Questions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mt-4">
                      <FileText className="w-5 h-5 text-orange-500" /> 模拟考题与标准答案
                    </h3>
                    {result.generatedQuestions.map((q, idx) => (
                      <QuestionCard key={idx} question={q} index={idx} />
                    ))}
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                   {/* Chat History */}
                   <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-3 max-w-[90%] lg:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                              {msg.role === 'user' ? <span className="text-white text-xs">我</span> : <span className="text-white text-xs">壮</span>}
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                              msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                            }`}>
                              {cleanText(msg.text)}
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
                       placeholder="向壮壮提问..."
                       className="flex-1 px-4 lg:px-6 py-2 lg:py-3 bg-slate-100 rounded-full border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                     />
                     <button 
                       onClick={handleChatSend}
                       disabled={isChatLoading || !chatInput.trim()}
                       className="p-2 lg:p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md"
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
    
    {/* Hidden Print Layout */}
    {result && (
        <div className="hidden print:block bg-white p-12 max-w-[210mm] mx-auto text-black">
            <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <PenTool className="w-8 h-8 text-slate-900" />
                    <h1 className="text-3xl font-serif-sc font-bold text-black">{cleanText(result.title)}</h1>
                </div>
                <p className="text-slate-500 text-sm tracking-widest uppercase">LitMaster AI 智能鉴赏报告</p>
            </div>

            {/* Section: Text */}
            <div className="mb-10">
                    <h2 className="text-lg font-bold border-l-4 border-slate-900 pl-3 mb-4 text-black uppercase tracking-wider">原文内容</h2>
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <p className="whitespace-pre-wrap font-serif-sc text-justify leading-loose text-slate-900 text-sm">
                        {cleanText(result.originalText)}
                        </p>
                    </div>
            </div>

            {/* Section: Analysis */}
            <div className="mb-10 break-inside-avoid">
                    <h2 className="text-lg font-bold border-l-4 border-slate-900 pl-3 mb-4 text-black uppercase tracking-wider">鉴赏解析</h2>
                    
                    <div className="grid grid-cols-2 gap-8 mb-6">
                        <div className="col-span-1">
                            <h3 className="font-bold mb-2 text-black border-b border-slate-200 pb-1">文章大意</h3>
                            <p className="text-slate-700 text-sm leading-relaxed">{cleanText(result.summary)}</p>
                        </div>
                        <div className="col-span-1">
                            <h3 className="font-bold mb-2 text-black border-b border-slate-200 pb-1">核心主旨</h3>
                            <div className="flex gap-2 flex-wrap">
                                {result.themes.map((t, i) => (
                                    <span key={i} className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-900 font-medium">{cleanText(t)}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-bold mb-2 text-black border-b border-slate-200 pb-1">结构脉络</h3>
                        <ul className="space-y-1 text-slate-700 text-sm">
                            {result.structure.map((s, i) => (
                                <li key={i} className="flex gap-2">
                                    <span className="font-bold text-slate-400">{i+1}.</span>
                                    {cleanText(s)}
                                </li>
                            ))}
                        </ul>
                    </div>
            </div>

            {/* Section: Techniques */}
                <div className="mb-10 break-inside-avoid">
                    <h2 className="text-lg font-bold border-l-4 border-slate-900 pl-3 mb-4 text-black uppercase tracking-wider">表达技巧</h2>
                    <div className="grid grid-cols-1 gap-4">
                    {result.techniques.map((tech, i) => (
                        <div key={i} className="border border-slate-200 p-4 rounded bg-white shadow-sm break-inside-avoid">
                            <div className="font-bold text-black mb-1">{cleanText(tech.name)}</div>
                            <div className="grid grid-cols-12 gap-2 text-sm">
                                <div className="col-span-2 font-semibold text-slate-500">例句：</div>
                                <div className="col-span-10 text-slate-800 italic font-serif-sc">{cleanText(tech.example)}</div>
                                <div className="col-span-2 font-semibold text-slate-500">作用：</div>
                                <div className="col-span-10 text-slate-800">{cleanText(tech.effect)}</div>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>

            {/* Section: Q&A */}
            <div className="break-inside-avoid">
                    <h2 className="text-lg font-bold border-l-4 border-slate-900 pl-3 mb-4 text-black uppercase tracking-wider">模拟试题与标准答案</h2>
                    <div className="space-y-8">
                    {result.generatedQuestions.map((q, i) => (
                        <div key={i} className="break-inside-avoid">
                            <div className="font-bold mb-3 text-black text-base flex items-start gap-2">
                                <span className="bg-black text-white px-2 py-0.5 rounded text-xs mt-0.5">Q{i + 1}</span>
                                <span className="flex-1">{cleanText(q.question)}</span>
                            </div>
                            <div className="pl-4 border-l-2 border-slate-300 ml-3 space-y-3">
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">参考答案</div>
                                    <div className="text-slate-900 text-sm font-medium">{cleanText(q.standardAnswer)}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">解析</div>
                                    <div className="text-slate-600 text-sm italic">{cleanText(q.analysis)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
            </div>
            
            <div className="mt-16 pt-6 border-t border-slate-200 text-center flex justify-between items-center text-xs text-slate-400">
                <span>LitMaster AI - 你的语文冲刺提分助手</span>
                <span>生成时间: {new Date(result.timestamp).toLocaleString()}</span>
            </div>
        </div>
    )}
    </>
  );
};

const QuestionCard: React.FC<{ question: any, index: number }> = ({ question, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <span className="flex-none w-10 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold text-xs">
          第 {index + 1} 题
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cleanText(question.type)}</span>
          </div>
          <p className="font-medium text-slate-800">{cleanText(question.question)}</p>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </div>
      
      {isOpen && (
        <div className="bg-orange-50/30 border-t border-slate-100 p-6 pl-4 lg:pl-16 animate-in slide-in-from-top-2 duration-200 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-emerald-600 mb-2 uppercase flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
               参考答案
            </h4>
            <div className="text-slate-700 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm text-sm leading-relaxed font-serif-sc">
              {cleanText(question.standardAnswer)}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-600 mb-2 uppercase flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-blue-500"></span>
               解析
            </h4>
            <div className="text-slate-600 text-sm bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              {cleanText(question.analysis)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analyzer;