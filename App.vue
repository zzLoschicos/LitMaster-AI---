<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Login from './components/Login.vue';
import Analyzer from './components/Analyzer.vue';
import History from './components/History.vue';
import Profile from './components/Profile.vue';
import { User, AnalysisResult } from './types';
import { LayoutDashboard, History as HistoryIcon, UserCircle, Menu, X } from 'lucide-vue-next';

type View = 'analyzer' | 'history' | 'profile';

const user = ref<User | null>(null);
const currentView = ref<View>('analyzer');
const history = ref<AnalysisResult[]>([]);
const selectedResult = ref<AnalysisResult | null>(null);
const isSidebarOpen = ref(false);

onMounted(() => {
  const savedUser = localStorage.getItem('litmaster_current_user');
  const savedHistory = localStorage.getItem('litmaster_history');
  if (savedUser) user.value = JSON.parse(savedUser);
  if (savedHistory) history.value = JSON.parse(savedHistory);
});

const handleLogin = (newUser: User) => {
  user.value = newUser;
  localStorage.setItem('litmaster_current_user', JSON.stringify(newUser));
};

const handleLogout = () => {
  user.value = null;
  localStorage.removeItem('litmaster_current_user');
  currentView.value = 'analyzer';
  selectedResult.value = null;
};

const saveAnalysis = (result: AnalysisResult) => {
  let newHistory;
  const existingIndex = history.value.findIndex(h => h.id === result.id);
  
  if (existingIndex >= 0) {
      newHistory = [...history.value];
      newHistory[existingIndex] = result;
  } else {
      newHistory = [result, ...history.value];
  }
  
  history.value = newHistory;
  localStorage.setItem('litmaster_history', JSON.stringify(newHistory));
};

const handleHistorySelect = (result: AnalysisResult) => {
  selectedResult.value = result;
  currentView.value = 'analyzer';
};

const stats = computed(() => ({
  total: history.value.length,
  prose: history.value.filter(h => h.textType === 'PROSE').length,
  poetry: history.value.filter(h => h.textType === 'POETRY').length,
  novel: history.value.filter(h => h.textType === 'NOVEL').length,
}));

const setView = (view: View) => {
  currentView.value = view;
  if (view !== 'analyzer') {
    selectedResult.value = null;
  } else {
    // Keep selected result if we are just switching back to analyzer from sidebar
    // Unless explicitly resetting (which is done via '新建分析' in Analyzer)
  }
  isSidebarOpen.value = false;
};

const resetAnalyzer = () => {
    selectedResult.value = null;
    setView('analyzer');
}
</script>

<template>
  <div v-if="!user" class="h-full">
    <Login @login="handleLogin" />
  </div>

  <div v-else class="flex h-screen bg-slate-50 overflow-hidden font-sans">
    <!-- Sidebar Navigation -->
    <aside :class="`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl lg:shadow-none print:hidden`">
      <div class="flex items-center justify-between p-6 border-b border-slate-800">
         <h1 class="text-xl font-bold tracking-tight text-indigo-400">LitMaster AI</h1>
         <button @click="isSidebarOpen = false" class="lg:hidden text-slate-400 hover:text-white">
           <X class="w-6 h-6" />
         </button>
      </div>
      
      <nav class="p-4 space-y-2 mt-4">
        <button 
          @click="resetAnalyzer"
          :class="`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'analyzer' && !selectedResult ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`"
        >
          <LayoutDashboard class="w-5 h-5" />
          <span class="font-medium">智能鉴赏</span>
        </button>
        
        <button 
          @click="setView('history')"
          :class="`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`"
        >
          <HistoryIcon class="w-5 h-5" />
          <span class="font-medium">历史记录</span>
        </button>
        
        <button 
          @click="setView('profile')"
          :class="`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`"
        >
          <UserCircle class="w-5 h-5" />
          <span class="font-medium">个人中心</span>
        </button>
      </nav>

      <div class="absolute bottom-0 w-full p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div class="flex items-center gap-3">
           <img :src="user.avatar" class="w-10 h-10 rounded-full bg-indigo-100 border-2 border-slate-700" alt="Avatar" />
           <div class="overflow-hidden">
              <p class="text-sm font-bold text-white truncate">{{ user.username }}</p>
              <p class="text-xs text-indigo-400">在线学习中...</p>
           </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0">
      <header class="bg-white border-b border-slate-200 lg:hidden p-4 flex items-center justify-between shadow-sm sticky top-0 z-10 print:hidden">
         <span class="font-bold text-slate-800 text-lg">LitMaster AI</span>
         <button @click="isSidebarOpen = true" class="text-slate-600 p-2 hover:bg-slate-100 rounded-lg">
           <Menu class="w-6 h-6" />
         </button>
      </header>
      
      <div class="flex-1 overflow-hidden relative">
        <Analyzer 
          v-if="currentView === 'analyzer'"
          :key="selectedResult ? selectedResult.id : 'new-analysis'"
          :user="user"
          :initialResult="selectedResult"
          @saveResult="saveAnalysis"
        />
        
        <div v-if="currentView === 'history'" class="h-full overflow-y-auto">
            <History :history="history" @select="handleHistorySelect" />
        </div>
        
        <div v-if="currentView === 'profile'" class="h-full overflow-y-auto">
            <Profile :user="user" :stats="stats" @logout="handleLogout" />
        </div>
      </div>
    </main>
  </div>
</template>
