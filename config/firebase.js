import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from
  "@react-native-async-storage/async-storage";

  const firebaseConfig = {
    apiKey: "AIzaSyAPh3TDkHPKK0bu9M7wRR6W9N3Phc3UDoU",
    authDomain: "discalculy.firebaseapp.com",
    projectId: "discalculy",
    storageBucket: "discalculy.firebasestorage.app",
    messagingSenderId: "66452009952",
    appId: "1:66452009952:web:f7e1d928a195732762f185",
    measurementId: "G-7WR8PK8WRK"
  };

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});