// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-fe0de.firebaseapp.com",
  projectId: "mern-estate-fe0de",
  storageBucket: "mern-estate-fe0de.firebasestorage.app",
  messagingSenderId: "881098091414",
  appId: "1:881098091414:web:47d22483836e32eb460bb7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);