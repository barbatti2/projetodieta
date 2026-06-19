import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "COLE_AQUI_A_API_KEY_EXATA_DO_FIREBASE",
  authDomain: "projetodieta-10.firebaseapp.com",
  projectId: "projetodieta-10",
  storageBucket: "projetodieta-10.firebasestorage.app",
  messagingSenderId: "231336204822",
  appId: "1:231336204822:web:4103b58d33549bea0b3337"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
