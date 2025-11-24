// frontend/src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 1. Importar as views (certifique-se que o caminho 'views/' está correto)
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ProdutosView from '@/views/ProdutosView.vue' 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }, // Rota protegida
    },
    {
      path: '/produtos',
      name: 'produtos',
      component: ProdutosView,
      meta: { requiresAuth: true }, // Rota protegida
    }
    // Você pode adicionar uma rota de fallback (404) aqui se desejar
  ]
})

// 2. Proteção de Rotas (Middleware)
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // ⚠️ CHAMA O LISTENER UMA ÚNICA VEZ
  // Isso inicia o processo do Firebase para ver se o usuário já está logado
  if (!authStore.unsubscribeAuth) {
    authStore.initAuthListener();
  }
  
  // Se ainda não verificou o estado inicial, aguarda (evita flash de tela)
  // Como o onAuthStateChanged é assíncrono, a forma mais simples é deixar a rota ser carregada
  // e o Vue (DashboardView) cuida do estado "loading".
  // Mas a proteção DEVE funcionar:

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = authStore.user !== null; // Verifica se há um usuário

  if (requiresAuth && !isAuthenticated) {
    // Tenta acessar rota protegida sem estar autenticado
    next('/');
  } else if (to.path === '/' && isAuthenticated) {
    // Tenta ir para a rota de login já estando autenticado
    next('/dashboard');
  } else {
    // Permite a navegação
    next();
  }
});

export default router