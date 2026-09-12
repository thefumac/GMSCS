import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// 환경 변수(.env) 기반으로 인증기관별 프로젝트 키를 동적으로 로드 (기본값: GMSCS)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAGprE-UE_dgQSjoOlCJkbnQYvY91c9vls",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gmscs-a9925.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gmscs-a9925",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gmscs-a9925.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "87446465221",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:87446465221:web:0aac9613c405cbad275eac",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1RJPRQPQVW"
};

// 인증기관(Tenant) 식별 정보
export const TENANT_CONFIG = {
  tenantId: import.meta.env.VITE_TENANT_ID || 'gmscs',
  tenantName: import.meta.env.VITE_TENANT_NAME || 'GMS 인증원'
};

// Initialize Firebase (Singleton)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Database & Storage Services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Analytics
export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

