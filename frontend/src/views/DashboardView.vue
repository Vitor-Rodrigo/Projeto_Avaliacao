<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Sistema de Produtos</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <span class="mr-4">Olá, {{ authStore.userName }}!</span>
      
      <v-btn 
        text 
        @click="handleLogout"
      >
        <v-icon left>mdi-logout</v-icon>
        Logout
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <h1 class="text-h4 mb-6">Bem-vindo(a) ao Sistema de Produtos</h1>

        <v-row>
          <v-col cols="12" md="6">
            <v-card elevation="5" color="blue-grey-lighten-5">
                <v-card-title class="text-h6 d-flex align-center">
                    <v-icon left color="primary" class="mr-2">mdi-account-circle</v-icon>
                    Sessão Ativa
                </v-card-title>
                <v-card-text>
                    <p>Você está logado com sucesso via Google.</p>
                    <v-divider class="my-3"></v-divider>
                    <p><strong>Nome:</strong> {{ authStore.userName }}</p>
                    <p><strong>E-mail:</strong> {{ authStore.user?.email }}</p>
                </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card elevation="5" color="success">
                <v-card-title class="text-h6 white--text">
                    <v-icon left class="mr-2">mdi-database</v-icon>
                    Gerenciar Produtos
                </v-card-title>
                <v-card-text class="white--text">
                    Acesse a tela de CRUD para visualizar, criar, editar e excluir itens.
                </v-card-text>
                <v-card-actions>
                    <v-btn to="/produtos" color="white" variant="flat" size="large">
                        <v-icon left>mdi-arrow-right-circle</v-icon>
                        Ir para Produtos
                    </v-btn>
                </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};
</script>