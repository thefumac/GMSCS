import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAGprE-UE_dgQSjoOlCJkbnQYvY91c9vls",
  authDomain: "gmscs-a9925.firebaseapp.com",
  projectId: "gmscs-a9925",
  storageBucket: "gmscs-a9925.firebasestorage.app",
  messagingSenderId: "87446465221",
  appId: "1:87446465221:web:0aac9613c405cbad275eac",
  measurementId: "G-1RJPRQPQVW"
};

// Initialize Firebase (Singleton)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics is supported in browser environments
export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};
