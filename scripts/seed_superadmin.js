import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase 설정 (.env 또는 기본 설정)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyAGprE-UE_dgQSjoOlCJkbnQYvY91c9vls",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "gmscs-a9925.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "gmscs-a9925",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "gmscs-a9925.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "87446465221",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:87446465221:web:0aac9613c405cbad275eac"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedSuperAdmin() {
  const superAdminEmail = process.env.VITE_SUPERADMIN_EMAIL || 'the.elphis@gmail.com';
  console.log(`[Seed] SuperAdmin 계정 Firestore 등록 시작: ${superAdminEmail}`);

  try {
    const superAdminDocRef = doc(db, 'auditors', 'super-admin');
    await setDoc(superAdminDocRef, {
      id: 'super-admin',
      tenantId: 'gmscs',
      name: '최고관리자 (SuperAdmin)',
      email: superAdminEmail,
      role: 'SuperAdmin',
      isSystemAdmin: true,
      affiliation: '상근',
      originType: '상근',
      grade: '선임심사원',
      status: '활동',
      mobile: '010-0000-0000',
      telephone: '02-6929-1700',
      address: '서울특별시 금천구 가산디지털1로 181 (가산동, W-MALL 12층)',
      residentialRegion: '서울 금천구',
      registeredStandards: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'],
      contractExpiryDate: '2030-12-31',
      activeClientCount: 0,
      isCommitteeMember: true,
      committeeRole: '심의위원장',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // users 컬렉션에도 SuperAdmin 문서 등록
    const usersDocRef = doc(db, 'users', 'the-elphis');
    await setDoc(usersDocRef, {
      id: 'the-elphis',
      email: superAdminEmail,
      role: 'SuperAdmin',
      name: '최고관리자',
      isSystemAdmin: true,
      createdAt: new Date().toISOString()
    }, { merge: true });

    console.log(`✅ [성공] SuperAdmin 문서가 Firestore (auditors/super-admin 및 users/the-elphis)에 정상 등록되었습니다.`);
    console.log(`- 이메일: ${superAdminEmail}`);
    console.log(`- Role: SuperAdmin`);
    console.log(`- isSystemAdmin: true`);
  } catch (error) {
    console.error('❌ SuperAdmin 등록 실패:', error);
  }
}

seedSuperAdmin();
