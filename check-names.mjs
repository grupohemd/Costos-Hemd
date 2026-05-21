import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

const docRef = doc(db, 'app', 'data');
const snap = await getDoc(docRef);
const data = snap.data();
const ingredients = data.ingredients || [];

const search = ['agua', 'aceite', 'perej', 'chanch', 'siracha', 'sriracha'];
console.log('Total ingredientes:', ingredients.length);
for (const term of search) {
  const matches = ingredients.filter(i => i.ingrediente && i.ingrediente.toLowerCase().includes(term));
  console.log(`\nBúsqueda "${term}":`);
  matches.forEach(m => console.log(`  - "${m.ingrediente}" (precio: ${m.precio}, peso: ${m.pesoCompra})`));
}
process.exit(0);
