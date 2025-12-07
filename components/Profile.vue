<script setup lang="ts">
import { User } from '../types';
import { LogOut, Award, User as UserIcon } from 'lucide-vue-next';

defineProps<{
  user: User;
  stats: { total: number, prose: number, poetry: number, novel: number };
}>();

const emit = defineEmits<{
  (e: 'logout'): void;
}>();
</script>

<template>
  <div class="p-8 max-w-2xl mx-auto">
    <div class="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 h-32 relative">
         <div class="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
           <img :src="user.avatar" alt="Avatar" class="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md" />
         </div>
      </div>
      
      <div class="pt-16 pb-8 text-center px-4">
        <h2 class="text-3xl font-bold text-slate-800">{{ user.username }}</h2>
        <p class="text-indigo-500 font-medium mt-1 flex items-center justify-center gap-1">
           <UserIcon class="w-4 h-4" /> {{ user.role === 'teacher' ? '老师' : '学生' }} • 提分冲刺班
        </p>
      </div>

      <div class="grid grid-cols-3 border-t border-slate-100 divide-x divide-slate-100 bg-slate-50/50">
        <div class="p-6 text-center group cursor-pointer hover:bg-indigo-50 transition-colors">
          <div class="text-3xl font-bold text-slate-800 group-hover:text-indigo-600">{{ stats.total }}</div>
          <div class="text-xs text-slate-500 uppercase tracking-wider mt-1 font-bold">累计鉴赏</div>
        </div>
        <div class="p-6 text-center group cursor-pointer hover:bg-emerald-50 transition-colors">
           <div class="text-3xl font-bold text-emerald-600">{{ stats.poetry }}</div>
           <div class="text-xs text-slate-500 uppercase tracking-wider mt-1 font-bold">诗歌</div>
        </div>
        <div class="p-6 text-center group cursor-pointer hover:bg-blue-50 transition-colors">
           <div class="text-3xl font-bold text-blue-600">{{ stats.prose + stats.novel }}</div>
           <div class="text-xs text-slate-500 uppercase tracking-wider mt-1 font-bold">散文/小说</div>
        </div>
      </div>

      <div class="p-8 border-t border-slate-100">
         <h3 class="font-bold text-slate-700 mb-4 flex items-center gap-2 text-lg">
           <Award class="w-6 h-6 text-orange-500" /> 学习成就
         </h3>
         <div class="flex gap-3 flex-wrap">
           <span class="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold border border-yellow-200">🌱 初级学者</span>
           <span v-if="stats.total > 5" class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold border border-indigo-200">📚 勤奋读者</span>
           <span v-if="stats.poetry > 3" class="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200">🌸 诗词达人</span>
           <span v-if="stats.novel > 3" class="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold border border-purple-200">📖 小说专家</span>
         </div>
      </div>
      
      <div class="p-6 bg-slate-50 text-center border-t border-slate-100">
        <button 
          @click="emit('logout')"
          class="w-full py-3 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut class="w-5 h-5" /> 退出登录
        </button>
      </div>
    </div>
  </div>
</template>
