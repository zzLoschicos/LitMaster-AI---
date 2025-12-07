<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { TextType, AnalysisResult, ChatMessage } from '../types';
import { analyzeText, chatWithTutor } from '../services/geminiService';
import { BookOpen, Send, Loader2, FileText, PenTool, Layout, ChevronDown, ChevronUp, BrainCircuit, RotateCcw, Download, Printer } from 'lucide-vue-next';

const props = defineProps<{
  user: any;
  initialResult?: AnalysisResult | null;
}>();

const emit = defineEmits<{
  (e: 'saveResult', result: AnalysisResult): void;
}>();

const inputText = ref('');
const textType = ref<TextType>('PROSE');
const isLoading = ref(false);
const result = ref<AnalysisResult | null>(null);
const activeTab = ref<'analysis' | 'qa'>('analysis');
const mobileTab = ref<'text' | 'result'>('text');

// Chat state
const chatMessages = ref<ChatMessage[]>([]);
const chatInput = ref('');
const isChatLoading = ref(false);
const chatEndRef = ref<HTMLDivElement | null>(null);

const cleanText = (text: string) => {
  if (!text) return "";
  return text.replace(/\*\*/g, '').replace(/__/, ''); 
};

// Initialize or Reset
const initialize = () => {
    if (props.initialResult) {
        result.value = props.initialResult;
        inputText.value = props.initialResult.originalText;
        textType.value = props.initialResult.textType;
        mobileTab.value = 'result';
        
        if (props.initialResult.chatHistory && props.initialResult.chatHistory.length > 0) {
            chatMessages.value = props.initialResult.chatHistory;
        } else {
             chatMessages.value = [{
                role: 'model',
                text: `欢迎回来！我们正在回顾《${cleanText(props.initialResult.title)}》。有什么想复习的吗？`,
                timestamp: Date.now()
            }];
        }
        activeTab.value = 'analysis';
    } else {
        resetAnalyzer();
    }
};

watch(() => props.initialResult, initialize, { immediate: true });

const resetAnalyzer = () => {
    result.value = null;
    inputText.value = '';
    chatMessages.value = [];
    textType.value = 'PROSE';
    mobileTab.value = 'text';
};

const handleAnalyze = async () => {
    if (!inputText.value.trim()) return;
    setIsLoading(true);
    result.value = null;
    chatMessages.value = [];

    try {
      const data = await analyzeText(inputText.value, textType.value);
      const greetingMsg: ChatMessage = {
        role: 'model',
        text: `你好！我是你的语文助教壮壮。我已经分析了这篇${textType.value === 'POETRY' ? '诗歌' : textType.value === 'NOVEL' ? '小说' : '散文'}。你可以问我关于文中具体字词的含义、写作手法或主旨的问题。`,
        timestamp: Date.now()
      };
      
      const resultWithChat = {
          ...data,
          chatHistory: [greetingMsg]
      };

      result.value = resultWithChat;
      chatMessages.value = [greetingMsg];
      emit('saveResult', resultWithChat);
      mobileTab.value = 'result';
      
    } catch (error) {
      console.error(error);
      alert("分析失败，请重试。请确保您的 API Key 有效。");
    } finally {
      setIsLoading(false);
    }
};

const handleChatSend = async () => {
    if (!chatInput.value.trim() || !result.value) return;
    
    const newMessage: ChatMessage = { role: 'user', text: chatInput.value, timestamp: Date.now() };
    const updatedMessages = [...chatMessages.value, newMessage];
    
    chatMessages.value = updatedMessages;
    chatInput.value = '';
    isChatLoading.value = true;

    // Scroll to bottom
    await nextTick();
    chatEndRef.value?.scrollIntoView({ behavior: "smooth" });

    try {
      const apiHistory = updatedMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const responseText = await chatWithTutor(apiHistory, newMessage.text, result.value.originalText);
      
      const botResponse: ChatMessage = {
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, botResponse];
      chatMessages.value = finalMessages;
      
      // Update result and save
      const updatedResult = { ...result.value, chatHistory: finalMessages };
      result.value = updatedResult;
      emit('saveResult', updatedResult);

      await nextTick();
      chatEndRef.value?.scrollIntoView({ behavior: "smooth" });

    } catch (e) {
      console.error(e);
      chatMessages.value.push({
        role: 'model',
        text: "网络错误，请稍后再试。",
        timestamp: Date.now()
      });
    } finally {
      isChatLoading.value = false;
    }
};

const handlePrint = () => {
    window.print();
};

const setTextType = (type: TextType) => {
    textType.value = type;
};

// Sub-component for Question Card
const QuestionCard = {
    props: ['question', 'index'],
    setup(props: any) {
        const isOpen = ref(false);
        const toggle = () => isOpen.value = !isOpen.value;
        const clean = (t: string) => t ? t.replace(/\*\*/g, '').replace(/__/, '') : "";
        return { isOpen, toggle, clean, ChevronDown, ChevronUp };
    },
    template: `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md">
      <div 
        @click="toggle"
        class="p-5 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <span class="flex-none w-10 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold text-xs">
          第 {{ index + 1 }} 题
        </span>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
             <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">{{ clean(question.type) }}</span>
          </div>
          <p class="font-medium text-slate-800">{{ clean(question.question) }}</p>
        </div>
        <component :is="isOpen ? ChevronUp : ChevronDown" class="w-5 h-5 text-slate-400" />
      </div>
      
      <div v-if="isOpen" class="bg-orange-50/30 border-t border-slate-100 p-6 pl-4 lg:pl-16 animate-in slide-in-from-top-2 duration-200 space-y-4">
        <div>
          <h4 class="text-xs font-bold text-emerald-600 mb-2 uppercase flex items-center gap-2">
             <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
             参考答案
          </h4>
          <div class="text-slate-700 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm text-sm leading-relaxed font-serif-sc">
            {{ clean(question.standardAnswer) }}
          </div>
        </div>
        <div>
          <h4 class="text-xs font-bold text-blue-600 mb-2 uppercase flex items-center gap-2">
             <span class="w-2 h-2 rounded-full bg-blue-500"></span>
             解析
          </h4>
          <div class="text-slate-600 text-sm bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            {{ clean(question.analysis) }}
          </div>
        </div>
      </div>
    </div>
    `
}

</script>

<template>
  <div class="flex flex-col h-full bg-slate-50 relative print:hidden">
      <!-- Header Area -->
      <div class="p-4 lg:p-6 bg-white border-b border-slate-200 shadow-sm flex-none flex justify-between items-center z-20">
        <div>
            <h2 class="text-xl lg:text-2xl font-serif-sc font-bold text-slate-800 flex items-center gap-2">
            <PenTool class="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600" />
            <span class="truncate max-w-[200px] lg:max-w-md">
                {{ result ? cleanText(result.title) : "新文章鉴赏" }}
            </span>
            </h2>
            <p class="text-slate-500 text-xs lg:text-sm mt-1 hidden sm:block">
            {{ result ? "分析完成" : "输入文章内容，系统将自动生成考点解析与模拟题。" }}
            </p>
        </div>
        
        <div class="flex gap-2">
            <button 
                v-if="result"
                @click="handlePrint"
                class="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs lg:text-sm font-medium whitespace-nowrap shadow-sm"
                title="将在打印对话框中保存为PDF"
            >
                <Printer class="w-4 h-4" /> <span class="hidden sm:inline">打印/导出PDF</span>
            </button>
            <button 
                v-if="result"
                @click="resetAnalyzer"
                class="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-xs lg:text-sm font-medium whitespace-nowrap"
            >
                <RotateCcw class="w-4 h-4" /> <span class="hidden sm:inline">新建分析</span>
            </button>
        </div>
      </div>

      <div class="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <!-- Mobile Tabs Switcher -->
        <div v-if="result" class="lg:hidden flex border-b border-slate-200 bg-white shrink-0 z-10">
            <button 
            @click="mobileTab = 'text'"
            :class="`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${mobileTab === 'text' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500'}`"
            >
            原文内容
            </button>
            <button 
            @click="mobileTab = 'result'"
            :class="`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${mobileTab === 'result' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500'}`"
            >
            鉴赏解析
            </button>
        </div>

        <!-- Left Panel: Input / Original Text -->
        <div :class="`
            flex flex-col p-6 overflow-y-auto transition-all duration-300
            ${!result ? 'w-full max-w-4xl mx-auto h-full' : ''}
            ${result ? 'lg:w-1/3 lg:border-r border-slate-200' : ''}
            ${result && mobileTab === 'result' ? 'hidden lg:flex' : 'flex-1'} 
        `">
           <div v-if="!result" class="mb-6 flex gap-2 lg:gap-4 justify-center">
             <button
               v-for="t in ['PROSE', 'POETRY', 'NOVEL']"
               :key="t"
               @click="setTextType(t as TextType)"
               :class="`px-4 py-2 lg:px-6 lg:py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                 textType === t 
                   ? 'bg-indigo-600 text-white ring-2 ring-indigo-200 ring-offset-2' 
                   : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
               }`"
             >
               {{ t === 'PROSE' ? '散文' : t === 'POETRY' ? '诗歌' : '小说' }}
             </button>
           </div>

           <label class="text-sm font-semibold text-slate-700 mb-2 block flex justify-between">
             <span>{{ result ? "原文" : "在此输入文章/诗词:" }}</span>
           </label>
           
           <textarea
             class="flex-1 w-full p-6 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none resize-none font-serif-sc text-lg leading-loose text-slate-700 shadow-inner transition-all"
             :class="{ 'bg-slate-50': result, 'min-h-[300px]': !result }"
             placeholder="请粘贴您需要分析的文章、诗词或小说片段..."
             v-model="inputText"
             :readonly="!!result"
           ></textarea>

           <button
             v-if="!result"
             @click="handleAnalyze"
             :disabled="isLoading || !inputText.trim()"
             class="mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
           >
             <Loader2 v-if="isLoading" class="animate-spin w-6 h-6" />
             <BrainCircuit v-else class="w-6 h-6" />
             开始智能鉴赏
           </button>
        </div>

        <!-- Right Panel: Analysis Result -->
        <div v-if="result" :class="`
             flex flex-col overflow-hidden bg-slate-50/50 
             lg:flex-[2]
             ${mobileTab === 'text' ? 'hidden lg:flex' : 'flex-1'}
        `">
            <!-- Tabs -->
            <div class="flex border-b border-slate-200 bg-white px-6 shrink-0">
              <button
                @click="activeTab = 'analysis'"
                :class="`py-3 lg:py-4 px-4 lg:px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'analysis' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`"
              >
                全维解析
              </button>
              <button
                @click="activeTab = 'qa'"
                :class="`py-3 lg:py-4 px-4 lg:px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'qa' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`"
              >
                名师答疑
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
              <div v-if="activeTab === 'analysis'" class="space-y-6 max-w-4xl mx-auto pb-20">
                  
                  <!-- Summary & Structure -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <BookOpen class="w-5 h-5 text-emerald-500" /> 文章大意
                      </h3>
                      <p class="text-slate-600 leading-relaxed text-sm">{{ cleanText(result.summary) }}</p>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Layout class="w-5 h-5 text-blue-500" /> 结构脉络
                      </h3>
                      <ul class="space-y-3">
                           <li v-for="(step, idx) in result.structure" :key="idx" class="flex items-start gap-3 text-sm text-slate-600">
                             <span class="flex-none bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">{{ idx + 1 }}</span>
                             {{ cleanText(step) }}
                           </li>
                      </ul>
                    </div>
                  </div>

                  <!-- Key Techniques -->
                  <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <PenTool class="w-5 h-5 text-purple-500" /> 鉴赏技巧与手法
                    </h3>
                    <div class="grid gap-4">
                        <div v-for="(tech, idx) in result.techniques" :key="idx" class="flex flex-col sm:flex-row gap-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                           <div class="flex-none sm:w-32 font-bold text-purple-700">{{ cleanText(tech.name) }}</div>
                           <div class="flex-1 space-y-2">
                              <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">例句 (Example)</div>
                              <div class="text-slate-700 italic font-serif-sc">“{{ cleanText(tech.example) }}”</div>
                              <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">作用 (Effect)</div>
                              <div class="text-slate-600 text-sm">{{ cleanText(tech.effect) }}</div>
                           </div>
                        </div>
                    </div>
                  </div>

                  <!-- Themes -->
                   <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <BrainCircuit class="w-5 h-5 text-pink-500" /> 核心主旨
                    </h3>
                    <div class="flex flex-wrap gap-2">
                            <span v-for="(theme, idx) in result.themes" :key="idx" class="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm font-medium border border-pink-100">
                                {{ cleanText(theme) }}
                            </span>
                    </div>
                   </div>

                  <!-- Generated Questions -->
                  <div class="space-y-4">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2 mt-4">
                      <FileText class="w-5 h-5 text-orange-500" /> 模拟考题与标准答案
                    </h3>
                      <QuestionCard v-for="(q, idx) in result.generatedQuestions" :key="idx" :question="q" :index="idx" />
                  </div>

              </div>

              <div v-else class="h-full flex flex-col max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                   <!-- Chat History -->
                   <div class="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
                        <div v-for="(msg, idx) in chatMessages" :key="idx" :class="`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`">
                          <div :class="`flex gap-3 max-w-[90%] lg:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`">
                            <div :class="`flex-none w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'}`">
                              <span v-if="msg.role === 'user'" class="text-white text-xs">我</span>
                              <span v-else class="text-white text-xs">壮</span>
                            </div>
                            <div :class="`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                              msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                            }`">
                              {{ cleanText(msg.text) }}
                            </div>
                          </div>
                        </div>

                      <div v-if="isChatLoading" class="flex justify-start">
                          <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-200">
                             <Loader2 class="w-5 h-5 text-emerald-600 animate-spin" />
                          </div>
                      </div>
                      <div ref="chatEndRef"></div>
                   </div>
                   
                   <!-- Chat Input -->
                   <div class="p-4 bg-white border-t border-slate-100 flex gap-2">
                     <input 
                       type="text" 
                       v-model="chatInput"
                       @keydown.enter="handleChatSend"
                       placeholder="向壮壮提问..."
                       class="flex-1 px-4 lg:px-6 py-2 lg:py-3 bg-slate-100 rounded-full border-none focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                     />
                     <button 
                       @click="handleChatSend"
                       :disabled="isChatLoading || !chatInput.trim()"
                       class="p-2 lg:p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md"
                     >
                       <Send class="w-5 h-5" />
                     </button>
                   </div>
              </div>
            </div>
        </div>
      </div>

    <!-- Hidden Print Layout -->
    <div v-if="result" class="hidden print:block bg-white p-12 max-w-[210mm] mx-auto text-black">
        <div class="text-center border-b-2 border-slate-900 pb-6 mb-8">
            <div class="flex items-center justify-center gap-3 mb-2">
                <PenTool class="w-8 h-8 text-slate-900" />
                <h1 class="text-3xl font-serif-sc font-bold text-black">{{ cleanText(result.title) }}</h1>
            </div>
            <p className="text-slate-500 text-sm tracking-widest uppercase">LitMaster AI 智能鉴赏报告</p>
        </div>

        <!-- Section: Text -->
        <div class="mb-10">
                <h2 class="text-lg font-bold border-l-4 border-slate-900 pl-3 mb-4 text-black uppercase tracking-wider">原文内容</h2>
                <div class="bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <p class="whitespace-pre-wrap font-serif-sc text-justify leading-loose text-slate-900 text-sm">
                    {{ cleanText(result.originalText) }}
                    </p>
                </div>
        </div>

        <!-- Section: Analysis -->
        <div class="mb-10 break-inside-avoid">
                <h2 class="text-lg font-bold border-l-4 border-slate-900 pl-3 mb-4 text-black uppercase tracking-wider">鉴赏解析</h2>
                
                <div class="grid grid-cols-2 gap-8 mb-6">
                    <div class="col-span-1">
                        <h3 class="font-bold mb-2 text-black border-b border-slate-200 pb-1">文章大意</h3>
                        <p class="text-slate-700 text-sm leading-relaxed">{{ cleanText(result.summary) }}</p>
                    </div>
                    <div class="col-span-1">
                        <h3 class="font-bold mb-2 text-black border-b border-slate-200 pb-1">核心主旨</h3>
                        <div class="flex gap-2 flex-wrap">
                                <span v-for="(t, i) in result.themes" :key="i" class="px-2 py-1 bg-slate-100 rounded text-xs text-slate-900 font-medium">{{ cleanText(t) }}</span>
                        </div>
                    </div>
                </div>

                <div class="mb-6">
                    <h3 class="font-bold mb-2 text-black border-b border-slate-200 pb-1">结构脉络</h3>
                    <ul class="space-y-1 text-slate-700 text-sm">
                            <li v-for="(s, i) in result.structure" :key="i" class="flex gap-2">
                                <span class="font-bold text-slate-400">{{ i+1 }}.</span>
                                {{ cleanText(s) }}
                            </li>
                    </ul>
                </div>
        </div>

        <!-- Section: Techniques -->
            <div class="mb-10 break-inside-avoid">
                <h2 class="text-lg font-bold border-l-4 border-slate-900 pl-3 mb-4 text-black uppercase tracking-wider">表达技巧</h2>
                <div class="grid grid-cols-1 gap-4">
                    <div v-for="(tech, i) in result.techniques" :key="i" class="border border-slate-200 p-4 rounded bg-white shadow-sm break-inside-avoid">
                        <div class="font-bold text-black mb-1">{{ cleanText(tech.name) }}</div>
                        <div class="grid grid-cols-12 gap-2 text-sm">
                            <div class="col-span-2 font-semibold text-slate-500">例句：</div>
                            <div class="col-span-10 text-slate-800 italic font-serif-sc">{{ cleanText(tech.example) }}</div>
                            <div class="col-span-2 font-semibold text-slate-500">作用：</div>
                            <div class="col-span-10 text-slate-800">{{ cleanText(tech.effect) }}</div>
                        </div>
                    </div>
                </div>
            </div>

        <!-- Section: Q&A -->
        <div class="break-inside-avoid">
                <h2 class="text-lg font-bold border-l-4 border-slate-900 pl-3 mb-4 text-black uppercase tracking-wider">模拟试题与标准答案</h2>
                <div class="space-y-8">
                    <div v-for="(q, i) in result.generatedQuestions" :key="i" class="break-inside-avoid">
                        <div class="font-bold mb-3 text-black text-base flex items-start gap-2">
                            <span class="bg-black text-white px-2 py-0.5 rounded text-xs mt-0.5">Q{{ i + 1 }}</span>
                            <span class="flex-1">{{ cleanText(q.question) }}</span>
                        </div>
                        <div class="pl-4 border-l-2 border-slate-300 ml-3 space-y-3">
                            <div>
                                <div class="text-xs font-bold text-slate-500 uppercase mb-1">参考答案</div>
                                <div class="text-slate-900 text-sm font-medium">{{ cleanText(q.standardAnswer) }}</div>
                            </div>
                            <div>
                                <div class="text-xs font-bold text-slate-500 uppercase mb-1">解析</div>
                                <div class="text-slate-600 text-sm italic">{{ cleanText(q.analysis) }}</div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
        
        <div class="mt-16 pt-6 border-t border-slate-200 text-center flex justify-between items-center text-xs text-slate-400">
            <span>LitMaster AI - 你的语文冲刺提分助手</span>
            <span>生成时间: {{ new Date(result.timestamp).toLocaleString() }}</span>
        </div>
    </div>
  </div>
</template>
