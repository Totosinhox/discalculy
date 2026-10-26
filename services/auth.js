import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
  } from "firebase/auth";
  
  import { auth } from "../config/firebase";
  
  export async function cadastrar(email, senha) {
    const resultado = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      senha
    );
  
    return resultado.user;
  }
  
  export async function entrar(email, senha) {
    const resultado = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      senha
    );
  
    return resultado.user;
  }
  
  export async function sair() {
    await signOut(auth);
  }