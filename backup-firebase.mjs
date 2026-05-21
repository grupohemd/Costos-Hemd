import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyAZO4_ckQ3-k019Yykvkt0f8T6hDlGyfKg",
  authDomain: "costos-hemd.firebaseapp.com",
  projectId: "costos-hemd",
  storageBucket: "costos-hemd.firebasestorage.app",
  messagingSenderId: "864293531130",
  appId: "1:864293531130:web:353f7010a490f44103c843",
  measurementId: "G-66M758B14P"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const snap = await getDoc(doc(db, 'app', 'data'));
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const path = `backup-${stamp}.json`;
fs.writeFileSync(path, JSON.stringify(snap.data(), null, 2));
console.log('Backup escrito:', path);
process.exit(0);
