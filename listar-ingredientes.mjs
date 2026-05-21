import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
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

function scoreIngrediente(ing) {
  let score = 0;
  if (ing.proveedor && String(ing.proveedor).trim() !== '') score += 10;
  if (ing.precio && Number(ing.precio) > 0) score += 2;
  if (ing.pesoCompra && Number(ing.pesoCompra) > 0) score += 2;
  if (ing.categoria && String(ing.categoria).trim() !== '') score += 1;
  if (ing.merma !== undefined && ing.merma !== null && ing.merma !== '') score += 1;
  return score;
}

async function main() {
  console.log('Conectando a Firebase...');
  const snap = await getDoc(doc(db, 'app', 'data'));

  if (!snap.exists()) {
    console.error('El documento app/data no existe.');
    process.exit(1);
  }

  const data = snap.data();
  const ingredients = Array.isArray(data.ingredients) ? data.ingredients : [];
  console.log(`Total de ingredientes en Firestore (incluyendo duplicados): ${ingredients.length}`);

  // Deduplicar por nombre, quedándose con el que tenga más datos completos
  const map = new Map();
  for (const ing of ingredients) {
    const nombre = (ing.ingrediente || '').trim();
    if (!nombre) continue;
    const key = nombre.toUpperCase();
    const existing = map.get(key);
    if (!existing || scoreIngrediente(ing) > scoreIngrediente(existing)) {
      map.set(key, ing);
    }
  }

  const unicos = Array.from(map.values()).sort((a, b) =>
    (a.ingrediente || '').localeCompare(b.ingrediente || '', 'es', { sensitivity: 'base' })
  );

  const conProveedor = unicos.filter(i => i.proveedor && String(i.proveedor).trim() !== '').length;

  const rows = [['Ingrediente', 'Proveedor']];
  for (const ing of unicos) {
    rows.push([
      ing.ingrediente || '',
      (ing.proveedor && String(ing.proveedor).trim()) || ''
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 40 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ingredientes');

  const outPath = 'ingredientes-proveedores.xlsx';
  XLSX.writeFile(wb, outPath);

  console.log('');
  console.log('===== RESULTADO =====');
  console.log(`Ingredientes únicos: ${unicos.length}`);
  console.log(`Con proveedor asignado: ${conProveedor}`);
  console.log(`Sin proveedor: ${unicos.length - conProveedor}`);
  console.log(`Archivo generado: ${outPath}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
