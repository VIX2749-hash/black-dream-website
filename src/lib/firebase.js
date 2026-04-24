import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDJwpYENbWFAc6m8Yy_TOygKxfrAn3lsfQ",
  authDomain: "blackdream-7764b.firebaseapp.com",
  projectId: "blackdream-7764b",
  storageBucket: "blackdream-7764b.firebasestorage.app",
  messagingSenderId: "312344811996",
  appId: "1:312344811996:web:8784622cc88f4ead831719",
  measurementId: "G-5WF9YSGGFT",
};

const requiredValues = ["apiKey", "authDomain", "projectId", "appId"];

export const firebaseEnabled = requiredValues.every((key) => Boolean(firebaseConfig[key]));

export const firebaseApp = firebaseEnabled ? initializeApp(firebaseConfig) : null;
export const auth = firebaseEnabled ? getAuth(firebaseApp) : null;
export const googleProvider = firebaseEnabled ? new GoogleAuthProvider() : null;
