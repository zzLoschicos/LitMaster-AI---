<script setup lang="ts">
import { ref } from 'vue';
import { User } from '../types';
import { GraduationCap, ArrowRight, UserPlus, LogIn } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'login', user: User): void;
}>();

const isRegister = ref(false);
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');

const handleSubmit = () => {
  error.value = '';

  if (!username.value.trim() || !password.value.trim()) {
    error.value = '请填写所有字段';
    return;
  }

  if (isRegister.value) {
    if (password.value.length < 5) {
      error.value = '密码太简单（至少5位）';
      return;
    }
    if (password.value !== confirmPassword.value) {
      error.value = '两次输入的密码不一致';
      return;
    }

    const users = JSON.parse(localStorage.getItem('litmaster_users') || '[]');
    if (users.find((u: User) => u.username === username.value)) {
      error.value = '用户名已存在';
      return;
    }

    const newUser: User = {
      username: username.value,
      password: password.value,
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${username.value}`,
      role: 'student'
    };
    
    users.push(newUser);
    localStorage.setItem('litmaster_users', JSON.stringify(users));
    emit('login', newUser);

  } else {
    // Login logic
    const users = JSON.parse(localStorage.getItem('litmaster_users') || '[]');
    const foundUser = users.find((u: User) => u.username === username.value && u.password === password.value);
    
    if (foundUser) {
      emit('login', foundUser);
    } else {
      error.value = '用户名或密码错误';
    }
  }
};
</script>

<template>
  <div class="h-screen w-full bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md text-center transition-all">
      <div class="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg rotate-3 hover:rotate-6 transition-transform">
        <GraduationCap class="w-10 h-10 text-white" />
      </div>
      
      <h1 class="text-3xl font-bold text-slate-800 mb-2">LitMaster AI</h1>
      <p class="text-slate-500 mb-8">语文冲刺提分训练营</p>

      <div class="flex bg-slate-100 p-1 rounded-xl mb-6">
        <button 
          @click="isRegister = false; error = ''"
          :class="`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isRegister ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`"
        >
          登录
        </button>
        <button 
          @click="isRegister = true; error = ''"
          :class="`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isRegister ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`"
        >
          注册
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <input
          type="text"
          placeholder="用户名"
          v-model="username"
          class="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg"
          required
        />
        <input
          type="password"
          placeholder="密码"
          v-model="password"
          class="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg"
          required
        />
        
        <input
          v-if="isRegister"
          type="password"
          placeholder="确认密码"
          v-model="confirmPassword"
          class="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg animate-in fade-in slide-in-from-top-2"
          required
        />

        <p v-if="error" class="text-red-500 text-sm font-medium">{{ error }}</p>

        <button
          type="submit"
          class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          <UserPlus v-if="isRegister" class="w-5 h-5"/>
          <LogIn v-else class="w-5 h-5"/>
          {{ isRegister ? '注册账号' : '开始学习' }}
        </button>
      </form>
      
      <p class="mt-8 text-xs text-slate-400">
        技术支持：Google Gemini 2.5 Flash
      </p>
    </div>
  </div>
</template>
