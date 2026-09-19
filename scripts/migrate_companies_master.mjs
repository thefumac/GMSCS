import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, writeBatch, getDoc, collection, getDocs, query, limit } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyAGprE-UE_dgQSjoOlCJkbnQYvY91c9vls",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "gmscs-a9925.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "gmscs-a9925",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "gmscs-a9925.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "87446465221",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:87446465221:web:0aac9613c405cbad275eac"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// JSON 데이터 로드
const officialMasterPath = path.resolve(__dirname, '../src/data/officialMasterCerts.json');
const legacyCompaniesPath = path.resolve(__dirname, '../src/data/legacyCompanies.json');
const realAuditProjectsPath = path.resolve(__dirname, '../src/data/realAuditProjects.json');

const officialMasterCertsRaw = JSON.parse(fs.readFileSync(officialMasterPath, 'utf-8'));
const legacyCompaniesRaw = JSON.parse(fs.readFileSync(legacyCompaniesPath, 'utf-8'));
const realAuditProjectsRaw = JSON.parse(fs.readFileSync(realAuditProjectsPath, 'utf-8'));

function normalizeCompanyName(name) {
  if (!name) return '';
  return name
    .replace(/\(주\)|주식회사|\(유\)|유한회사|\(합\)|합자회사|\(사\)|사단법인/g, '')
    .replace(/\s+/g, '')
    .trim()
    .toLowerCase();
}

// Master Certs Map
const masterCertsByBiz = new Map();
const masterCertsByNorm = new Map();

officialMasterCertsRaw.forEach(mc => {
  const cleanBiz = (mc.bizNumber || '').replace(/[^0-9]/g, '').trim();
  if (cleanBiz && cleanBiz !== '0000000000') {
    if (!masterCertsByBiz.has(cleanBiz)) masterCertsByBiz.set(cleanBiz, mc);
  }
  const norm = normalizeCompanyName(mc.companyName);
  if (norm) {
    if (!masterCertsByNorm.has(norm)) masterCertsByNorm.set(norm, mc);
  }
});

// Real Audit Projects Map
const realProjectsByBiz = new Map();
const realProjectsByNorm = new Map();

realAuditProjectsRaw.forEach(p => {
  const norm = normalizeCompanyName(p.companyName || p.clientName);
  if (norm) {
    if (!realProjectsByNorm.has(norm)) realProjectsByNorm.set(norm, []);
    realProjectsByNorm.get(norm).push(p);
  }
  const biz = ((p.bizNumber || p.bizNo || '')).replace(/[^0-9]/g, '').trim();
  if (biz && biz !== '0000000000') {
    if (!realProjectsByBiz.has(biz)) realProjectsByBiz.set(biz, []);
    realProjectsByBiz.get(biz).push(p);
  }
});

function resolveTimeline(companyName, bizNumber) {
  const norm = normalizeCompanyName(companyName);
  const cleanBiz = (bizNumber || '').replace(/[^0-9]/g, '').trim();

  let matched = [];
  if (cleanBiz && realProjectsByBiz.has(cleanBiz)) {
    matched = realProjectsByBiz.get(cleanBiz);
  } else if (norm && realProjectsByNorm.has(norm)) {
    matched = realProjectsByNorm.get(norm);
  }

  const sortedProjs = [...matched].sort((a, b) => (a.startDate || '9999-99-99').localeCompare(b.startDate || '9999-99-99'));
  const todayStr = '2026-09-18';

  let latestAuditDate = '-';
  const pastCompletedProjs = matched.filter(p => {
    const d = p.endDate || p.startDate || (p.auditDates && p.auditDates[p.auditDates.length - 1]) || '';
    return d && d <= todayStr;
  });

  if (pastCompletedProjs.length > 0) {
    const sortedDesc = [...pastCompletedProjs].sort((a, b) => {
      const dateA = a.endDate || a.startDate || (a.auditDates && a.auditDates[a.auditDates.length - 1]) || '';
      const dateB = b.endDate || b.startDate || (b.auditDates && b.auditDates[b.auditDates.length - 1]) || '';
      return dateB.localeCompare(dateA);
    });
    const target = sortedDesc[0];
    latestAuditDate = target.endDate || target.startDate || (target.auditDates && target.auditDates[target.auditDates.length - 1]) || '-';
  }

  let initialDate = sortedProjs.length > 0 ? sortedProjs[0].startDate : '2024-01-01';
  let lastAuditDate = pastCompletedProjs.length > 0 ? pastCompletedProjs[pastCompletedProjs.length - 1].startDate : '2025-01-01';

  return { initialDate, lastAuditDate, latestAuditDate };
}

async function runMigration() {
  console.log('🚀 [Firestore Migration] 정규화된 마스터 기업 데이터 일괄 동기화 시작...');

  let signedIn = false;
  const accounts = [
    { email: 'the.elphis@gmail.com', pass: 'gms9001' },
    { email: 'fumac@naver.com', pass: 'gms9001' },
    { email: 'admin@gmscs.co.kr', pass: 'gms9001' },
    { email: 'kgms2304@gmail.com', pass: 'gms9001' }
  ];

  for (const acc of accounts) {
    try {
      await signInWithEmailAndPassword(auth, acc.email, acc.pass);
      console.log(`✅ Firebase 인증 성공 (${acc.email})!`);
      signedIn = true;
      break;
    } catch (e) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, acc.email, acc.pass);
          console.log(`✅ Firebase 계정 신규 생성 및 로그인 성공 (${acc.email})!`);
          signedIn = true;
          break;
        } catch (ce) {
          // continue
        }
      }
    }
  }

  if (!signedIn) {
    throw new Error('Firebase Auth 로그인/계정 생성 실패');
  }

  const companiesToMigrate = [];

  // 1. legacyCompanies 매핑
  legacyCompaniesRaw.forEach((lc, idx) => {
    const cleanBiz = (lc.bizNo || '').replace(/[^0-9]/g, '').trim();
    const norm = normalizeCompanyName(lc.name);

    let masterCert = null;
    if (cleanBiz && masterCertsByBiz.has(cleanBiz)) {
      masterCert = masterCertsByBiz.get(cleanBiz);
    } else if (norm && masterCertsByNorm.has(norm)) {
      masterCert = masterCertsByNorm.get(norm);
    }

    const timeline = resolveTimeline(lc.name, lc.bizNo);

    const certNo = (masterCert?.certNo || lc.certNo || `Q26${String(idx + 100).padStart(4, '0')}`).trim();
    const certStatus = (masterCert ? (masterCert.certStatus || '') : (lc.status || '')).trim();
    const initialDate = (masterCert?.initialCertDate || timeline.initialDate || '2024-01-01').trim();
    const certStartDate = (masterCert?.certStartDate || '').trim();
    const expiryDate = (masterCert?.expiryDate || '2027-12-31').trim();

    let latestAuditDate = '-';
    if (certStartDate) {
      latestAuditDate = certStartDate;
    } else if (timeline.latestAuditDate && timeline.latestAuditDate !== '-') {
      latestAuditDate = timeline.latestAuditDate;
    }

    let currentCycleNumber = 1;
    try {
      const initYr = new Date(initialDate).getFullYear();
      if (!isNaN(initYr)) {
        currentCycleNumber = Math.max(1, Math.floor((2026 - initYr) / 3) + 1);
      }
    } catch (e) {}

    const cycleBaseDate = certStartDate || initialDate;

    companiesToMigrate.push({
      id: `comp-legacy-${lc.no || idx + 1}`,
      bizNumber: lc.bizNo || (masterCert?.bizNumber) || `000-00-${String(idx).padStart(5, '0')}`,
      companyName: lc.name,
      tenantId: 'gmscs',
      certNo,
      certStatus,
      rawStatus: masterCert?.certStatus || lc.status || '',
      certStartDate,
      initialCertDate: initialDate,
      lastAuditDate: timeline.lastAuditDate,
      latestAuditDate,
      expiryDate,
      currentCycleNumber,
      cycleBaseDate,
      pastCycles: [],
      standards: masterCert?.standards || lc.standards,
      scope: masterCert?.scope || lc.scope,
      updatedAt: new Date().toISOString()
    });
  });

  // 2. CSV 마스터 신규 기업 매핑
  const existingBizSet = new Set(legacyCompaniesRaw.map(c => (c.bizNo || '').replace(/[^0-9]/g, '').trim()).filter(b => b && b !== '0000000000'));
  const existingNormSet = new Set(legacyCompaniesRaw.map(c => normalizeCompanyName(c.name)).filter(Boolean));

  officialMasterCertsRaw.forEach((mc) => {
    const cleanBiz = (mc.bizNumber || '').replace(/[^0-9]/g, '').trim();
    const norm = normalizeCompanyName(mc.companyName);

    const isBizMatched = cleanBiz && cleanBiz !== '0000000000' && existingBizSet.has(cleanBiz);
    const isNormMatched = norm && existingNormSet.has(norm);

    if (!isBizMatched && !isNormMatched) {
      const idx = companiesToMigrate.length;
      const initialDate = mc.initialCertDate || '2024-01-01';
      const expiryDate = mc.expiryDate || '2027-12-31';
      const certStartDate = mc.certStartDate || '';
      const latestAuditDate = certStartDate || '-';

      companiesToMigrate.push({
        id: `comp-csv-master-${mc.no || idx + 1}`,
        bizNumber: mc.bizNumber || `000-00-${String(idx).padStart(5, '0')}`,
        companyName: mc.companyName,
        tenantId: 'gmscs',
        certNo: mc.certNo || '',
        certStatus: (mc.certStatus || '').trim(),
        rawStatus: (mc.certStatus || '').trim(),
        certStartDate,
        initialCertDate: initialDate,
        lastAuditDate: latestAuditDate,
        latestAuditDate,
        expiryDate,
        currentCycleNumber: 1,
        cycleBaseDate: certStartDate || initialDate,
        pastCycles: [],
        standards: mc.standards,
        scope: mc.scope,
        updatedAt: new Date().toISOString()
      });
    }
  });

  console.log(`📦 총 ${companiesToMigrate.length}개 기업 문서 마이그레이션 대상 준비 완료.`);

  // Batch Write (500개 단위)
  const batchSize = 400;
  let batch = writeBatch(db);
  let count = 0;
  let totalBatches = 0;

  for (let i = 0; i < companiesToMigrate.length; i++) {
    const comp = companiesToMigrate[i];
    const docRef = doc(db, 'companies', comp.id);
    batch.set(docRef, comp, { merge: true });
    count++;

    if (count >= batchSize || i === companiesToMigrate.length - 1) {
      totalBatches++;
      console.log(`⏳ Batch #${totalBatches} (${count}건) Firestore 커밋 중...`);
      await batch.commit();
      console.log(`✅ Batch #${totalBatches} 커밋 완료!`);
      batch = writeBatch(db);
      count = 0;
    }
  }

  console.log(`\n🎉 전체 ${companiesToMigrate.length}개 문서 Firestore 동기화 완료!`);

  // 검증: 샘플 문서 5건 조회
  console.log('\n🔍 [검증] Firestore 저장 문서 샘플 5건 조회 확인:');
  const sampleIds = [
    companiesToMigrate[0].id,
    companiesToMigrate[10].id,
    companiesToMigrate[50].id,
    companiesToMigrate[100].id,
    companiesToMigrate[companiesToMigrate.length - 1].id
  ];

  for (const sid of sampleIds) {
    const sDoc = await getDoc(doc(db, 'companies', sid));
    if (sDoc.exists()) {
      const data = sDoc.data();
      console.log(`- [${sid}] ${data.companyName} | 상태: '${data.certStatus}' | 주기: ${data.currentCycleNumber}주기 | 기산일: ${data.cycleBaseDate} | 만료일: ${data.expiryDate} | 최근심사일: ${data.latestAuditDate}`);
    }
  }
}

runMigration().catch(err => {
  console.error('❌ Migration 에러:', err);
  process.exit(1);
});
