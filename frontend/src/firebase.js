import { initializeApp } from "firebase/app"; 
import { getAuth } from "firebase/auth";

// Apenas o objeto de configuração é aproveitado do que você copiou:
const firebaseConfig = {
    apiKey: "AIzaSyCagth0DIWyKscYEJjpUoCY502AWsKJDW0", // Sua chave
    authDomain: "projeto-crud-fullstack-af6e0.firebaseapp.com",
    projectId: "projeto-crud-fullstack-af6e0",
    // Opcional: storageBucket: "projeto-crud-fullstack-af6e0.firebasestorage.app",
    // Opcional: messagingSenderId: "650674443318",
    // Opcional: appId: "1:650674443318:web:e1b30ff72f1f571124b497"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o serviço de autenticação
export const auth = getAuth(app);