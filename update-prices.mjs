import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import XLSX from 'xlsx';

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

function normalize(s) {
  if (s == null) return '';
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

async function main() {
  const wb = XLSX.readFile('Actualizacion precios .xlsx');
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const dataRows = rows.slice(1).filter(r => r && r[0] != null);

  const docRef = doc(db, 'app', 'data');
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    console.error('No data found in Firebase');
    process.exit(1);
  }
  const data = snap.data();
  const ingredients = Array.isArray(data.ingredients) ? data.ingredients : [];

  const aliasMap = {
    'agua': 'agua potable',
    'aceite oliva blend': 'aceite de oliva blend',
    'prejil': 'perejil'
  };

  const indexesByName = new Map();
  ingredients.forEach((ing, i) => {
    const key = normalize(ing.ingrediente);
    if (!key) return;
    if (!indexesByName.has(key)) indexesByName.set(key, []);
    indexesByName.get(key).push(i);
  });

  const now = new Date();
  const isoNow = now.toISOString();
  const fechaHN = now.toLocaleDateString('es-HN');

  const updated = [];
  const skipped = [];
  const notFound = [];
  const unchanged = [];

  for (const row of dataRows) {
    const [nombreRaw, pesoRaw, precioRaw] = row;
    const nombreKey = normalize(nombreRaw);
    if (!nombreKey) continue;

    if (pesoRaw == null || precioRaw == null || pesoRaw === '' || precioRaw === '') {
      skipped.push({ nombre: nombreRaw, motivo: 'peso o precio vacío' });
      continue;
    }

    const newPesoCompra = Number(pesoRaw);
    const newPrecio = Number(precioRaw);
    if (!isFinite(newPesoCompra) || !isFinite(newPrecio)) {
      skipped.push({ nombre: nombreRaw, motivo: 'peso o precio no numérico' });
      continue;
    }

    const lookupKey = aliasMap[nombreKey] || nombreKey;
    const idxs = indexesByName.get(lookupKey);
    if (!idxs || idxs.length === 0) {
      notFound.push(nombreRaw);
      continue;
    }

    let anyChange = false;
    for (const idx of idxs) {
      const old = ingredients[idx];
      const oldPrecio = Number(old.precio) || 0;
      const oldPesoCompra = Number(old.pesoCompra) || 0;
      const precioCambio = oldPrecio !== newPrecio;
      const pesoCambio = oldPesoCompra !== newPesoCompra;

      if (!precioCambio && !pesoCambio) {
        unchanged.push(old.ingrediente);
        continue;
      }
      anyChange = true;

      const historialPrevio = Array.isArray(old.historialPrecios) ? old.historialPrecios : [];
      let nuevoHistorial = historialPrevio;
      const debeGuardarHistorial = (precioCambio || pesoCambio) && oldPrecio > 0 && oldPesoCompra > 0;
      if (debeGuardarHistorial) {
        const precioGramoAnterior = oldPesoCompra > 0 ? oldPrecio / oldPesoCompra : 0;
        const precioGramoNuevo = newPesoCompra > 0 ? newPrecio / newPesoCompra : 0;
        nuevoHistorial = [
          ...historialPrevio,
          {
            fecha: isoNow,
            precioAnterior: oldPrecio,
            precioNuevo: newPrecio,
            pesoCompraAnterior: oldPesoCompra,
            pesoCompraNuevo: newPesoCompra,
            precioGramoAnterior,
            precioGramoNuevo
          }
        ];
      }

      ingredients[idx] = {
        ...old,
        pesoCompra: newPesoCompra,
        precio: newPrecio,
        historialPrecios: nuevoHistorial,
        fechaActualizacion: fechaHN,
        fechaActualizacionPrecio: precioCambio ? isoNow : (old.fechaActualizacionPrecio || isoNow)
      };

      updated.push({
        nombre: old.ingrediente,
        precio: `${oldPrecio} -> ${newPrecio}`,
        pesoCompra: `${oldPesoCompra} -> ${newPesoCompra}`
      });
    }
  }

  console.log(`\n=== Actualizados: ${updated.length} ===`);
  updated.forEach(u => console.log(`  ${u.nombre}: precio ${u.precio}, peso ${u.pesoCompra}`));

  console.log(`\n=== Sin cambios: ${unchanged.length} ===`);
  unchanged.forEach(n => console.log(`  ${n}`));

  console.log(`\n=== No encontrados: ${notFound.length} ===`);
  notFound.forEach(n => console.log(`  ${n}`));

  console.log(`\n=== Saltados: ${skipped.length} ===`);
  skipped.forEach(s => console.log(`  ${s.nombre} (${s.motivo})`));

  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) {
    console.log('\n[DRY RUN] No se escribió a Firebase.');
  } else {
    await setDoc(docRef, { ...data, ingredients });
    console.log('\nDatos guardados en Firebase.');
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
