import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const cfg = {apiKey:'AIzaSyAZO4_ckQ3-k019Yykvkt0f8T6hDlGyfKg',authDomain:'costos-hemd.firebaseapp.com',projectId:'costos-hemd',storageBucket:'costos-hemd.firebasestorage.app',messagingSenderId:'864293531130',appId:'1:864293531130:web:353f7010a490f44103c843'};
const app = initializeApp(cfg);
const db = getFirestore(app);
const snap = await getDoc(doc(db,'app','data'));
const d = snap.data();
for (const name of ['Tortillas','Repollo morado']) {
  const matches = d.ingredients.filter(i => i.ingrediente && i.ingrediente.toLowerCase().includes(name.toLowerCase()));
  for (const m of matches) {
    console.log('---', m.ingrediente, '(id:', m.id, ')---');
    console.log('precio:', m.precio, 'pesoCompra:', m.pesoCompra);
    console.log('historialPrecios:');
    (m.historialPrecios || []).forEach((h, i) => {
      const pgA = h.precioGramoAnterior;
      const pgN = h.precioGramoNuevo;
      const pct = pgA > 0 ? ((pgN - pgA) / pgA) * 100 : null;
      console.log(`  [${i}] fecha=${h.fecha} precioGramoAnterior=${pgA} precioGramoNuevo=${pgN} pct=${pct?.toFixed(2)}%`);
    });
  }
}
process.exit(0);
