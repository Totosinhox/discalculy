// Configuração do Firebase do projeto Discalculy.
// Usa o SDK pelo CDN oficial (não precisa de npm).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPh3TDkHPKK0bu9M7wRR6W9N3Phc3UDoU",
  authDomain: "discalculy.firebaseapp.com",
  projectId: "discalculy",
  storageBucket: "discalculy.firebasestorage.app",
  messagingSenderId: "66452009952",
  appId: "1:66452009952:web:f7e1d928a195732762f185",
  measurementId: "G-7WR8PK8WRK",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); // autenticação (cadastro e login)
export const db = getFirestore(app); // banco de dados (perfil e histórico)
