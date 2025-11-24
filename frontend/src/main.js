// frontend/src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import '@mdi/font/css/materialdesignicons.css' // Ícones do Vuetify

// 1. Importações do Vuetify
import 'vuetify/styles' // ⚠️ ESSENCIAL: Garante os estilos CSS do Vuetify
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' // Ícones do Vuetify

// 2. Criação da instância do Vuetify
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi', 
  },
})

// 3. Criação da instância do Pinia
const pinia = createPinia()

const app = createApp(App)

// 4. Conectar Pinia, Router e Vuetify ao aplicativo Vue
app.use(router)
app.use(pinia) 
app.use(vuetify) // ⚠️ ESSENCIAL: Diz ao Vue para USAR o Vuetify

app.mount('#app')