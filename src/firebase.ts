import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDPLXS1BeI6THFdJSHOR0SIYnpIxme4Srk",
  authDomain: "aplica-478505.firebaseapp.com",
  projectId: "aplica-478505",
  storageBucket: "aplica-478505.firebasestorage.app",
  messagingSenderId: "958135187004",
  appId: "1:958135187004:web:3708b8c02e14916b61b539"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId
const db = getFirestore(app, "ai-studio-320b101a-5973-4f5b-bdb6-ca4dad644422");

const auth = getAuth(app);

export { db, auth };
