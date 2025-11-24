<template>
  <v-app :full-height="true" class="bg-grey-lighten-3">
    <v-main class="d-flex align-center justify-center">
      <v-container fluid>
        <v-row justify="center">
          <v-col cols="12" sm="8" md="4">
            
            <v-card 
              class="elevation-12 pa-6" 
              rounded="lg"
              :loading="loading"
              loader-height="3"
            >
              <v-card-title class="text-h5 text-center mb-4 text-primary">
                <v-icon size="36" class="mr-2">mdi-lock</v-icon>
                Acesso ao Sistema
              </v-card-title>

              <v-card-subtitle class="text-center mb-6">
                Faça login para gerenciar seus produtos.
              </v-card-subtitle>

              <v-card-text class="d-flex justify-center">
                
                <v-btn
                  :disabled="loading"
                  :loading="loading"
                  color="#4285F4" 
                  size="large"
                  class="text-white elevation-4"
                  @click="login"
                >
                  <v-icon left size="24" class="mr-2">mdi-google</v-icon>
                  Entrar com Google
                </v-btn>

              </v-card-text>

              <v-card-actions v-if="loading" class="justify-center">
                 <v-progress-circular 
                    indeterminate 
                    color="primary"
                    size="24"
                    width="3"
                ></v-progress-circular>
                <span class="ml-2 text-primary">Autenticando...</span>
              </v-card-actions>
              
            </v-card>
            
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);

const login = async () => {
  loading.value = true;
  try {
    const success = await authStore.loginWithGoogle();
    
    if (success) {
      // Redireciona para a rota protegida após o sucesso
      router.push('/dashboard');
    } else {
      // Se a função retornar false (cancelamento ou erro), apenas desativa o loading
      loading.value = false;
    }
  } catch (error) {
    console.error("Erro no login:", error);
    // Em caso de erro grave, exibe uma notificação e desativa o loading
    alert('Ocorreu um erro inesperado ao tentar logar.');
    loading.value = false;
  }
};
</script>