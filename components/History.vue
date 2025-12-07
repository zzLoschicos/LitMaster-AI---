<script setup lang="ts">
import { AnalysisResult } from '../types';
import { Clock, BookOpen, ChevronRight } from 'lucide-vue-next';

defineProps<{
  history: AnalysisResult[];
}>();

const emit = defineEmits<{
  (e: 'select', result: AnalysisResult): void;
}>();
</script>

<template>
  <div class="p-8 max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
      <Clock class="w-8 h-8 text-indigo-600" /> 历史记录
    </h2>
    
    <div v-if="history.length === 0" class="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
       <BookOpen class="w-16 h-16 text-slate-300 mx-auto mb-4" />
       <p class="text-slate-500 text-lg">暂无记录。开始分析一篇新文章吧！</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="item in history"
        :key="item.id"
        @click="emit('select', item)"
        class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-300 cursor-pointer transition-all group flex flex-col h-full"
      >
        <div class="flex justify-between items-start mb-4">
           <div :class="`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              item.textType === 'PROSE' ? 'bg-blue-100 text-blue-700' :
              item.textType === 'POETRY' ? 'bg-emerald-100 text-emerald-700' :
              'bg-purple-100 text-purple-700'
           }`">
              {{ item.textType === 'PROSE' ? '散文' : item.textType === 'POETRY' ? '诗歌' : '小说' }}
           </div>
           <span class="text-slate-400 text-xs">
              {{ new Date(item.timestamp).toLocaleDateString() }}
           </span>
        </div>
        
        <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {{ item.title }}
        </h3>
        <p class="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">
          {{ item.summary }}
        </p>
        
        <div class="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <span class="text-xs text-slate-400 font-medium">{{ item.generatedQuestions.length }} 道题</span>
          <div class="flex items-center text-indigo-600 font-bold text-sm gap-1 group-hover:gap-2 transition-all">
              复习 <ChevronRight class="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
