
import { defineStore } from 'pinia';
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";
// O @/firebase é um atalho para frontend/src/firebase.js
import { auth } from '@/firebase'; 

export const useAuthStore = defineStore('auth', {
    state: () => ({
        // Armazena o objeto do usuário Firebase (ou null se deslogado)
        user: null, 
        // Estado para saber se a verificação inicial do Firebase já ocorreu
        authReady: false, 
        // Função para remover o listener de autenticação, se necessário
        unsubscribeAuth: null
    }),

    getters: {
        // Retorna true se houver um objeto de usuário (isAuthenticated)
        isAuthenticated: (state) => !!state.user,
        // Retorna o nome do usuário para exibição
        userName: (state) => state.user ? state.user.displayName : 'Visitante',
    },

    actions: {
        // Ação para iniciar o login com pop-up do Google
        async loginWithGoogle() {
            try {
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                
                // O onAuthStateChanged (no initAuthListener) já deve atualizar o 'user',
                // mas você pode opcionalmente forçar aqui:
                this.user = result.user; 
                
                return true; 
            } catch (error) {
                // Se o pop-up for fechado, ou houver erro
                console.error("Erro no login:", error.code, error.message);
                return false;
            }
        },

        // Ação para fazer o logout
        async logout() {
            try {
                await signOut(auth);
                // O onAuthStateChanged (no initAuthListener) limpará o 'user',
                // mas limpamos aqui por garantia.
                this.user = null; 
                return true;
            } catch (error) {
                console.error("Erro no logout:", error);
                return false;
            }
        },

        // ESSENCIAL: Verifica a sessão salva do usuário ao carregar a app
        initAuthListener() {
            // Garante que o listener seja configurado apenas uma vez
            if (this.unsubscribeAuth) return;

            // onAuthStateChanged é um listener assíncrono que verifica o estado 
            // de login do Firebase e se a sessão está salva localmente.
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                this.user = user;
                this.authReady = true; // Marca que o estado inicial foi verificado
                console.log("Estado de autenticação atualizado:", user ? 'LOGADO' : 'DESLOGADO');
            });

            // Guarda a função para que possamos verificar se já foi inicializado
            this.unsubscribeAuth = unsubscribe;
        }
    }
});