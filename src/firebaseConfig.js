// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfigurasi SEMENTARA (Agar aplikasi tidak error layar putih)
// Nanti ganti bagian ini dengan Config asli dari Firebase Console kamu
const firebaseConfig = {
  apiKey: "AIzaSyBJpqMOM9q4v_xE1OoHX55nICuvLwEZjs8",
  authDomain: "telago-88c2a.firebaseapp.com",
  projectId: "telago-88c2a",
  storageBucket: "telago-88c2a.firebasestorage.app",
  messagingSenderId: "536921420841",
  appId: "1:536921420841:web:2922f586fa165fea2f1838"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);