<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Gestão de Produtos</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <v-btn text to="/dashboard" class="mr-4">
        <v-icon left>mdi-view-dashboard</v-icon>
        Dashboard
      </v-btn>

      <span class="mr-4">Olá, {{ authStore.userName }}!</span>
      
      <v-btn text @click="handleLogout">
        <v-icon left>mdi-logout</v-icon>
        Logout
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <h1 class="text-h4 mb-4">Lista de Produtos</h1>

        <v-card class="elevation-3">
          <v-card-title>
            <v-btn color="success" @click="openDialog('create')" class="mb-4">
              <v-icon left>mdi-plus-circle</v-icon>
              Novo Produto
            </v-btn>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Pesquisar"
              single-line
              hide-details
              class="mx-4"
              style="max-width: 300px;"
              variant="underlined"
              density="compact"
            ></v-text-field>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="produtos"
            :search="search"
            :loading="loading"
            loading-text="Carregando produtos..."
            no-data-text="Nenhum produto cadastrado."
            class="elevation-1"
          >
            <template v-slot:item.actions="{ item }">
              <v-icon
                small
                class="mr-2"
                @click="openDialog('edit', item)"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                small
                color="error"
                @click="deleteItem(item.id)"
              >
                mdi-delete
              </v-icon>
            </template>

            <template v-slot:item.preco="{ item }">
              {{ formatCurrency(item.preco) }}
            </template>

          </v-data-table>
        </v-card>

        <v-dialog v-model="dialog" max-width="500px">
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>
            
            <v-card-text>
              <v-container>
                <v-form ref="form" v-model="valid" lazy-validation>
                  <v-text-field
                    v-model="editedItem.nome"
                    label="Nome do Produto"
                    required
                    :rules="[v => !!v || 'O nome é obrigatório']"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                  <v-text-field
                    v-model="editedItem.preco"
                    label="Preço"
                    type="number"
                    step="0.01"
                    required
                    :rules="[v => !!v || 'O preço é obrigatório']"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                  <v-textarea
                    v-model="editedItem.descricao"
                    label="Descrição (Opcional)"
                    variant="outlined"
                    density="compact"
                    rows="2"
                  ></v-textarea>
                </v-form>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDialog">
                Cancelar
              </v-btn>
              <v-btn color="success" variant="flat" @click="saveItem">
                Salvar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Tem certeza que deseja excluir este item?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDeleteDialog">Cancelar</v-btn>
              <v-btn color="error" variant="flat" @click="confirmDelete">Excluir</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
        
      </v-container>
    </v-main>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      top
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar = false">
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; 

// --- VARIÁVEIS DE ESTADO ---
const authStore = useAuthStore();
const router = useRouter();
const API_URL = 'http://localhost:3000/produtos'; 

const produtos = ref([]); 
const loading = ref(false); 
const search = ref(''); 
const dialog = ref(false); 
const dialogDelete = ref(false); 
const form = ref(null); 
const valid = ref(true); 

const editedIndex = ref(-1); 
const editedItem = ref({ 
  id: 0,
  nome: '',
  preco: 0.00,
  descricao: '',
});
const defaultItem = { 
  id: 0,
  nome: '',
  preco: 0.00,
  descricao: '',
};

const itemToDelete = ref(null); 

// --- SNACKBAR (Feedback) ---
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

// --- COMPONENTES COMPUTADOS ---
const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Novo Produto' : 'Editar Produto';
});
const headers = ref([
  { title: 'ID', key: 'id' },
  { title: 'Nome', key: 'nome' },
  { title: 'Preço', key: 'preco' },
  { title: 'Descrição', key: 'descricao', sortable: false },
  { title: 'Ações', key: 'actions', sortable: false },
]);

// --- FUNÇÕES DE NAVEGAÇÃO E UTILS ---
const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// --- FUNÇÕES CRUD (Ações) ---

// 1. READ (Listar)
const fetchProdutos = async () => {
  loading.value = true;
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Erro ao buscar produtos. Verifique o backend.');
    }
    const data = await response.json();
    produtos.value = data;
  } catch (error) {
    console.error("Falha ao carregar produtos:", error);
    snackbarColor.value = 'error';
    snackbarText.value = 'Não foi possível conectar com a API (porta 3000).';
    snackbar.value = true;
  } finally {
    loading.value = false;
  }
};

// 2. CREATE/UPDATE (Salvar)
const saveItem = async () => {
  if (!form.value.validate()) return; 

  const isCreating = editedIndex.value === -1;
  let url = isCreating ? API_URL : `${API_URL}/${editedItem.value.id}`;
  let method = isCreating ? 'POST' : 'PUT';

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedItem.value),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Falha ao ${isCreating ? 'criar' : 'atualizar'} o produto.`);
    }

    // FEEDBACK DE SUCESSO
    snackbarColor.value = 'success';
    snackbarText.value = `Produto ${isCreating ? 'criado' : 'atualizado'} com sucesso!`;
    snackbar.value = true;

    await fetchProdutos();
    closeDialog();
  } catch (error) {
    console.error("Falha ao salvar item:", error);
    // FEEDBACK DE ERRO
    snackbarColor.value = 'error';
    snackbarText.value = `Erro: ${error.message}`;
    snackbar.value = true;
  }
};

// 3. DELETE (Excluir)
const deleteItem = (id) => {
  itemToDelete.value = id;
  dialogDelete.value = true;
};

const confirmDelete = async () => {
  try {
    const response = await fetch(`${API_URL}/${itemToDelete.value}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao excluir o produto.');
    }

    // FEEDBACK DE SUCESSO
    snackbarColor.value = 'success';
    snackbarText.value = 'Produto excluído com sucesso.';
    snackbar.value = true;

    await fetchProdutos();
  } catch (error) {
    console.error("Falha ao excluir item:", error);
    // FEEDBACK DE ERRO
    snackbarColor.value = 'error';
    snackbarText.value = `Erro: ${error.message}`;
    snackbar.value = true;
  } finally {
    closeDeleteDialog();
  }
};

// --- FUNÇÕES DE CONTROLE DE MODAL ---

const openDialog = (type, item = defaultItem) => {
  if (type === 'create') {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
  } else if (type === 'edit') {
    editedItem.value = { ...item };
    editedIndex.value = produtos.value.findIndex(p => p.id === item.id);
  }
  dialog.value = true;
  nextTick(() => {
    form.value.resetValidation(); 
  });
};

const closeDialog = () => {
  dialog.value = false;
  nextTick(() => {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
  });
};

const closeDeleteDialog = () => {
  dialogDelete.value = false;
  itemToDelete.value = null;
};


// --- HOOK DE INICIALIZAÇÃO ---
onMounted(() => {
  fetchProdutos(); 
});
</script>