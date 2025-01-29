// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace this with your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA5A_28xPlGqGCtTsTUc-6WhnZ-nPqV0Lg",
    authDomain: "muffledmkt.firebaseapp.com",
    projectId: "muffledmkt",
    storageBucket: "muffledmkt.firebasestorage.app",
    messagingSenderId: "675299712055",
    appId: "1:675299712055:web:7a0e084952782df88b73b2",
    measurementId: "G-HX4EB7R085"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export default db;
