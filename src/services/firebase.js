// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC68IlehvTa7nJ5oz4Im6LFQmc_0hzsjWM",
  authDomain: "portfolio-70129.firebaseapp.com",
  projectId: "portfolio-70129",
  storageBucket: "portfolio-70129.firebasestorage.app",
  messagingSenderId: "975062529685",
  appId: "1:975062529685:web:843aabe71f2e3b84720d9c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
