// Auditoría completa (solo lectura) contra Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const cfg = {apiKey:'AIzaSyAZO4_ckQ3-k019Yykvkt0f8T6hDlGyfKg',authDomain:'costos-hemd.firebaseapp.com',projectId:'costos-hemd',storageBucket:'costos-hemd.firebasestorage.app',messagingSenderId:'864293531130',appId:'1:864293531130:web:353f7010a490f44103c843'};
const app = initializeApp(cfg);
const db = getFirestore(app);
const snap = await getDoc(doc(db,'app','data'));
const d = snap.data();

const ingredients = d.ingredients || [];
const recetasPorMarca = d.recetasPorMarca || {};
const brands = d.brands || [];
const basesRecetaPorMarca = d.basesRecetaPorMarca || {};
const basesPorReceta = d.basesPorReceta || {};
const empaquesPorMarca = d.empaquesPorMarca || {};
const empaquesPorReceta = d.empaquesPorReceta || {};
const deliveryPorReceta = d.deliveryPorReceta || {};
const isvPorReceta = d.isvPorReceta || {};
const precioVentaPorReceta = d.precioVentaPorReceta || {};
const configCostosPorMarca = d.configCostosPorMarca || d.configCostos || {};

const norm = s => (s ?? '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
const $ = v => `L${Number(v || 0).toFixed(2)}`;
const pct = v => `${Number(v || 0).toFixed(2)}%`;

// ================= INDICES =================
const bankById = new Map();
const bankByName = new Map();
ingredients.forEach((ing, idx) => {
  if (ing.id != null) {
    if (!bankById.has(String(ing.id))) bankById.set(String(ing.id), ing);
  }
  const k = norm(ing.ingrediente);
  if (k && !bankByName.has(k)) bankByName.set(k, ing);
});

const getBankIng = (id, nombre) => {
  if (id != null && bankById.has(String(id))) return bankById.get(String(id));
  if (nombre) return bankByName.get(norm(nombre));
  return null;
};

// ================= FORMULAS (espejo de App.jsx) =================
function calcularCostoSubReceta(subReceta) {
  return (subReceta.ingredientes || []).reduce((sum, ing) => {
    if (ing.esManual) {
      const pc = parseFloat(ing.pesoCompraManual) || 0;
      const p = parseFloat(ing.precioManual) || 0;
      const w = parseFloat(ing.peso) || 0;
      if (pc > 0 && p > 0 && w > 0) return sum + (w / pc) * p;
      return sum;
    }
    const banco = getBankIng(ing.ingredienteId, ing.ingredienteNombre);
    if (banco && banco.pesoCompra && banco.precio && ing.peso) {
      const merma = parseFloat(banco.merma) || 0;
      const pesoAprov = banco.pesoCompra * (1 - merma / 100);
      if (pesoAprov > 0) return sum + (ing.peso / pesoAprov) * banco.precio;
    }
    return sum;
  }, 0);
}
function calcularCostoPorcion(sr) {
  const t = calcularCostoSubReceta(sr);
  if (sr.pesoReceta && sr.pesoPorcion) return (sr.pesoPorcion / sr.pesoReceta) * t;
  return 0;
}
function calcularCostoPolloFrito(marcaId) {
  const br = basesRecetaPorMarca[marcaId];
  if (!br?.polloFrito) return 0;
  const { muslo, empanizado } = br.polloFrito;
  const cm = (muslo.pesoLimpio / muslo.pesoCompra) * muslo.precioCompra;
  const ce = empanizado.ingredientes.reduce((s, i) => s + (i.pesoUsado / i.pesoCompra) * i.precioCompra, 0);
  return cm + ce / empanizado.porciones;
}
function calcularCostoPolloFritoEnsalada(marcaId) {
  const br = basesRecetaPorMarca[marcaId];
  if (!br?.polloFritoEnsalada) return 0;
  const { muslo, empanizado } = br.polloFritoEnsalada;
  const cm = (muslo.pesoLimpio / muslo.pesoCompra) * muslo.precioCompra;
  const ce = empanizado.ingredientes.reduce((s, i) => s + (i.pesoUsado / i.pesoCompra) * i.precioCompra, 0);
  return cm + ce / empanizado.porciones;
}
function calcularCostoPapasFritas(marcaId) {
  const br = basesRecetaPorMarca[marcaId];
  if (!br?.papasFritas) return 0;
  const { pesoPorPorcion, pesoCompra, precioCompra } = br.papasFritas;
  return (precioCompra / pesoCompra) * pesoPorPorcion;
}
function calcularCostoBaseSimple(base) {
  if (!base) return 0;
  if (base.subRecetas && base.subRecetas.length > 0) {
    return base.subRecetas.reduce((tot, sr) => {
      const cs = sr.ingredientes.reduce((s, ing) => {
        if (!ing.pesoCompra) return s;
        return s + (ing.pesoUsado / ing.pesoCompra) * ing.precioCompra;
      }, 0);
      return tot + (cs / sr.pesoReceta) * sr.pesoPorcion;
    }, 0);
  }
  if (!base.ingredientes || !base.pesoReceta || !base.pesoPorcion) return 0;
  const cr = base.ingredientes.reduce((s, ing) => {
    if (!ing.pesoCompra) return s;
    return s + (ing.pesoUsado / ing.pesoCompra) * ing.precioCompra;
  }, 0);
  return (cr / base.pesoReceta) * base.pesoPorcion;
}
function calcularCostoBases(recetaId, marcaId) {
  const activas = basesPorReceta[recetaId] || {};
  const br = basesRecetaPorMarca[marcaId] || {};
  let t = 0;
  if (marcaId === '1' || marcaId === 1) {
    if (activas.polloFrito && br.polloFrito) t += calcularCostoPolloFrito(marcaId);
    if (activas.polloFritoEnsalada && br.polloFritoEnsalada) t += calcularCostoPolloFritoEnsalada(marcaId);
    if (activas.papasFritas && br.papasFritas) t += calcularCostoPapasFritas(marcaId);
  } else {
    Object.keys(activas).forEach(k => {
      if (!k.startsWith('custom_') && activas[k] && br[k]) t += calcularCostoBaseSimple(br[k]);
    });
  }
  Object.keys(activas).forEach(k => {
    if (k.startsWith('custom_') && activas[k] && br[k]) {
      const b = br[k];
      const cr = b.ingredientes.reduce((s, i) => s + (i.pesoCompra > 0 ? (i.pesoUsado / i.pesoCompra) * i.precioCompra : 0), 0);
      t += b.pesoReceta > 0 ? (cr / b.pesoReceta) * b.pesoPorcion : 0;
    }
  });
  return t;
}
function calcularCostoEmpaques(recetaId, marcaId) {
  const act = empaquesPorReceta[recetaId] || {};
  const lista = empaquesPorMarca[marcaId] || [];
  return lista.reduce((s, e) => s + (act[e.id] ? e.precio : 0), 0);
}

// ================= SEC 2A: INGREDIENTES =================
console.log('===========================================================');
console.log('=== AUDITORÍA COSTOS HEMD — ' + new Date().toLocaleString('es-HN') + ' ===');
console.log('===========================================================\n');

console.log('=== SECCIÓN 2A: INGREDIENTES ===');
const total = ingredients.length;
const sinPrecio = ingredients.filter(i => !i.precio || Number(i.precio) === 0);
const sinPeso = ingredients.filter(i => !i.pesoCompra || Number(i.pesoCompra) === 0);
const conMerma = ingredients.filter(i => Number(i.merma) > 0);
console.log(`Total ingredientes: ${total}`);
console.log(`Sin precio (=0 o null): ${sinPrecio.length}`);
console.log(`Sin pesoCompra (=0 o null): ${sinPeso.length}`);
console.log(`Con merma > 0: ${conMerma.length}`);

console.log('\n--- Ingredientes con merma ---');
conMerma.sort((a, b) => Number(b.merma) - Number(a.merma)).forEach(i => {
  console.log(`  ${(i.ingrediente || '').padEnd(35)} ${pct(i.merma).padStart(8)}`);
});

console.log('\n--- Sin precio ---');
sinPrecio.slice(0, 20).forEach(i => console.log(`  ${i.ingrediente}`));
if (sinPrecio.length > 20) console.log(`  ... y ${sinPrecio.length - 20} más`);

console.log('\n--- Sin pesoCompra ---');
sinPeso.slice(0, 20).forEach(i => console.log(`  ${i.ingrediente}`));
if (sinPeso.length > 20) console.log(`  ... y ${sinPeso.length - 20} más`);

// Duplicados por nombre normalizado
const counts = new Map();
ingredients.forEach(i => {
  const k = norm(i.ingrediente);
  counts.set(k, (counts.get(k) || []).concat(i));
});
const dups = [...counts.values()].filter(arr => arr.length > 1);
console.log(`\n--- Duplicados (mismo nombre normalizado): ${dups.length} grupos ---`);
dups.forEach(arr => {
  console.log(`  "${arr[0].ingrediente}" x${arr.length}  ids: [${arr.map(x => x.id).join(', ')}]`);
});

// Uso de ingredientes en recetas
const usados = new Set();
const ingNombreUsado = new Set();
const ingFaltantes = new Set();
function escanearSubReceta(sr) {
  (sr.ingredientes || []).forEach(ing => {
    if (ing.esManual) return;
    const banco = getBankIng(ing.ingredienteId, ing.ingredienteNombre);
    if (banco) {
      usados.add(String(banco.id));
      ingNombreUsado.add(norm(banco.ingrediente));
    } else if (ing.ingredienteNombre) {
      ingFaltantes.add(ing.ingredienteNombre);
    }
  });
}
Object.values(recetasPorMarca).forEach(recs => recs.forEach(r => (r.subRecetas || []).forEach(escanearSubReceta)));
// También bases
Object.values(basesRecetaPorMarca).forEach(br => {
  Object.values(br || {}).forEach(b => {
    if (!b) return;
    if (b.subRecetas) b.subRecetas.forEach(escanearSubReceta);
    if (b.ingredientes && b.ingredientes.forEach) {
      // Ingredientes directos de base (no usan banco — son standalone)
    }
  });
});

const noUsados = ingredients.filter(i => !usados.has(String(i.id)) && !ingNombreUsado.has(norm(i.ingrediente)));
console.log(`\n--- Ingredientes del banco NO usados en ninguna receta: ${noUsados.length} ---`);
noUsados.slice(0, 30).forEach(i => console.log(`  ${i.ingrediente}`));
if (noUsados.length > 30) console.log(`  ... y ${noUsados.length - 30} más`);

console.log(`\n--- Referencias en recetas a ingredientes que NO existen en banco: ${ingFaltantes.size} ---`);
[...ingFaltantes].slice(0, 30).forEach(n => console.log(`  ${n}`));

// ================= SEC 2B: RECETAS POR MARCA =================
console.log('\n\n=== SECCIÓN 2B: RECETAS POR MARCA ===');

const recipeAnalyses = {};
for (const brand of brands) {
  const bid = String(brand.id);
  const recs = recetasPorMarca[bid] || [];
  recipeAnalyses[bid] = [];
  console.log(`\n--- Marca: ${brand.name} (id=${bid}) — ${recs.length} recetas ---\n`);
  console.log('  ' + 'Receta'.padEnd(40) + 'SubR  CostoDirecto  Empaques  CostoTotal   PrecioV   FoodCost  Margen');
  for (const r of recs) {
    const costoSub = (r.subRecetas || []).reduce((s, sr) => s + calcularCostoPorcion(sr), 0);
    const costoBases = calcularCostoBases(r.id, bid);
    const costoDirecto = costoSub + costoBases;
    const costoEmpaques = calcularCostoEmpaques(r.id, bid);
    const costoTotal = costoDirecto + costoEmpaques;
    const pv = Number(precioVentaPorReceta[r.id] || 0);
    const foodCost = pv > 0 ? (costoDirecto / pv) * 100 : 0;
    const margen = pv > 0 ? pv - costoTotal : 0;
    const subCount = (r.subRecetas || []).length;
    recipeAnalyses[bid].push({ recipe: r, costoSub, costoBases, costoDirecto, costoEmpaques, costoTotal, pv, foodCost, margen, subCount });
    const fc = pv > 0 ? `${foodCost.toFixed(1)}%` : '   -  ';
    const mg = pv > 0 ? $(margen) : '   -   ';
    console.log(`  ${(r.nombre || '').slice(0, 38).padEnd(40)}${String(subCount).padStart(4)}  ${$(costoDirecto).padStart(12)}  ${$(costoEmpaques).padStart(8)}  ${$(costoTotal).padStart(10)}  ${(pv > 0 ? $(pv) : '  -').padStart(8)}  ${fc.padStart(8)}  ${mg.padStart(8)}`);
  }
}

// Resumen Food cost por marca
console.log('\n--- Resumen Food Cost por marca ---');
for (const brand of brands) {
  const bid = String(brand.id);
  const ra = recipeAnalyses[bid] || [];
  const conPrecio = ra.filter(x => x.pv > 0);
  const sinPV = ra.filter(x => !x.pv);
  const verde = conPrecio.filter(x => x.foodCost <= 30);
  const amber = conPrecio.filter(x => x.foodCost > 30 && x.foodCost <= 35);
  const rojo = conPrecio.filter(x => x.foodCost > 35);
  console.log(`\n  ${brand.name}: ${ra.length} recetas total, ${conPrecio.length} con precio venta`);
  console.log(`    Verde (≤30%):     ${verde.length}`);
  console.log(`    Amarillo (31-35%):${amber.length}`);
  console.log(`    Rojo (>35%):      ${rojo.length}`);
  console.log(`    Sin precio venta: ${sinPV.length}`);
  if (sinPV.length) {
    console.log('    Recetas sin precio venta:');
    sinPV.forEach(x => console.log(`      - ${x.recipe.nombre}`));
  }
  if (rojo.length) {
    console.log('    Recetas en ROJO (food cost > 35%):');
    rojo.sort((a, b) => b.foodCost - a.foodCost).forEach(x => console.log(`      - ${x.recipe.nombre.padEnd(35)} FC=${x.foodCost.toFixed(1)}%  Margen=${$(x.margen)}`));
  }
  if (amber.length) {
    console.log('    Recetas en AMARILLO (31-35%):');
    amber.sort((a, b) => b.foodCost - a.foodCost).forEach(x => console.log(`      - ${x.recipe.nombre.padEnd(35)} FC=${x.foodCost.toFixed(1)}%`));
  }
}

// ================= SEC 2C: BASES =================
console.log('\n\n=== SECCIÓN 2C: BASES DE RECETA POR MARCA ===');
for (const brand of brands) {
  const bid = String(brand.id);
  const br = basesRecetaPorMarca[bid] || {};
  console.log(`\n--- ${brand.name} (id=${bid}) ---`);
  for (const [k, b] of Object.entries(br)) {
    if (!b) continue;
    let costo = 0;
    if (k === 'polloFrito') costo = calcularCostoPolloFrito(bid);
    else if (k === 'polloFritoEnsalada') costo = calcularCostoPolloFritoEnsalada(bid);
    else if (k === 'papasFritas') costo = calcularCostoPapasFritas(bid);
    else if (k.startsWith('custom_')) {
      const cr = (b.ingredientes || []).reduce((s, i) => s + (i.pesoCompra > 0 ? (i.pesoUsado / i.pesoCompra) * i.precioCompra : 0), 0);
      costo = b.pesoReceta > 0 ? (cr / b.pesoReceta) * b.pesoPorcion : 0;
    } else costo = calcularCostoBaseSimple(b);
    console.log(`  ${k.padEnd(30)} "${b.nombre || ''}"  costo/porción: ${$(costo)}`);
  }
}

// ================= SEC 2D: EMPAQUES =================
console.log('\n\n=== SECCIÓN 2D: EMPAQUES POR MARCA ===');
for (const brand of brands) {
  const bid = String(brand.id);
  const lista = empaquesPorMarca[bid] || [];
  console.log(`\n--- ${brand.name}: ${lista.length} empaques ---`);
  lista.forEach(e => console.log(`  ${(e.nombre || '').padEnd(30)} ${$(e.precio)}`));
}

// ================= SEC 2E: CONFIG COSTOS =================
console.log('\n\n=== SECCIÓN 2E: CONFIGURACIÓN DE COSTOS POR MARCA ===');
for (const brand of brands) {
  const bid = String(brand.id);
  const cfg = configCostosPorMarca[bid] || configCostosPorMarca;
  const ventas = cfg?.ventas || [];
  const fijos = cfg?.costosFijos || [];
  const totalVentas = ventas.reduce((s, x) => s + (x.valor || 0), 0);
  const totalFijos = fijos.reduce((s, x) => s + (x.valor || 0), 0);
  const cfPlato = totalVentas > 0 ? totalFijos / totalVentas : 0;
  console.log(`\n--- ${brand.name} ---`);
  console.log(`  Total ventas/platos al mes: ${totalVentas.toLocaleString('es-HN')}`);
  console.log(`  Total costos fijos mensuales: ${$(totalFijos)}`);
  console.log(`  Costo fijo por plato: ${$(cfPlato)}`);
  console.log(`  Porcentaje delivery: ${pct(cfg?.porcentajeDelivery)}`);
  console.log(`  Porcentaje ISV: ${pct(cfg?.porcentajeISV)}`);
  if (ventas.length) {
    console.log('  Ventas por canal:');
    ventas.forEach(v => console.log(`    ${(v.nombre || '').padEnd(25)} ${(v.valor || 0).toLocaleString('es-HN').padStart(10)}`));
  }
  if (fijos.length) {
    console.log('  Costos fijos:');
    fijos.forEach(v => console.log(`    ${(v.nombre || '').padEnd(25)} ${$(v.valor || 0).padStart(12)}`));
  }
}

// ================= SEC 4: TOP impacto =================
console.log('\n\n=== SECCIÓN 4: IMPACTO Y RECOMENDACIONES ===');

// Top 10 ingredientes con mayor uso ponderado en costo
const impactoIng = new Map(); // bankId -> { nombre, costoTotal, ocurrencias }
function acumular(ing, peso) {
  const banco = getBankIng(ing.ingredienteId, ing.ingredienteNombre);
  if (!banco || !banco.pesoCompra || !banco.precio || !peso) return;
  const merma = parseFloat(banco.merma) || 0;
  const pesoAprov = banco.pesoCompra * (1 - merma / 100);
  if (pesoAprov <= 0) return;
  const costo = (peso / pesoAprov) * banco.precio;
  const k = String(banco.id);
  const prev = impactoIng.get(k) || { nombre: banco.ingrediente, costoTotal: 0, ocurrencias: 0 };
  prev.costoTotal += costo;
  prev.ocurrencias += 1;
  impactoIng.set(k, prev);
}
Object.entries(recetasPorMarca).forEach(([bid, recs]) => {
  recs.forEach(r => {
    (r.subRecetas || []).forEach(sr => {
      const factor = sr.pesoReceta > 0 ? (sr.pesoPorcion / sr.pesoReceta) : 1;
      (sr.ingredientes || []).forEach(ing => acumular(ing, (ing.peso || 0) * factor));
    });
  });
});
console.log('\n--- Top 10 ingredientes con mayor impacto en costo total agregado (suma de costo en todas las recetas) ---');
[...impactoIng.values()].sort((a, b) => b.costoTotal - a.costoTotal).slice(0, 10).forEach((x, i) => {
  console.log(`  ${(i + 1).toString().padStart(2)}. ${x.nombre.padEnd(30)} ${$(x.costoTotal).padStart(12)}  (en ${x.ocurrencias} sub-recetas)`);
});

// Margen alto/bajo
console.log('\n--- Recetas con MENOR margen (peor rentabilidad) — top 10 ---');
const allWithPV = Object.entries(recipeAnalyses).flatMap(([bid, arr]) =>
  arr.filter(x => x.pv > 0).map(x => ({ marca: brands.find(b => String(b.id) === bid)?.name || bid, ...x }))
);
allWithPV.sort((a, b) => a.margen - b.margen).slice(0, 10).forEach(x => {
  console.log(`  ${(x.marca + ' / ' + x.recipe.nombre).padEnd(50)} margen=${$(x.margen).padStart(10)}  FC=${x.foodCost.toFixed(1)}%`);
});
console.log('\n--- Recetas con MAYOR margen — top 10 ---');
allWithPV.sort((a, b) => b.margen - a.margen).slice(0, 10).forEach(x => {
  console.log(`  ${(x.marca + ' / ' + x.recipe.nombre).padEnd(50)} margen=${$(x.margen).padStart(10)}  FC=${x.foodCost.toFixed(1)}%`);
});

// Críticos: recetas con costo > precio venta
console.log('\n--- Recetas con COSTO DIRECTO > PRECIO VENTA (vendiendo en pérdida) ---');
const perdiendo = allWithPV.filter(x => x.costoDirecto > x.pv);
if (!perdiendo.length) console.log('  Ninguna.');
else perdiendo.forEach(x => console.log(`  ${x.marca + ' / ' + x.recipe.nombre}  costoDirecto=${$(x.costoDirecto)}  precioVenta=${$(x.pv)}`));

// Críticos: recetas con costo total > precio venta
console.log('\n--- Recetas con COSTO TOTAL (con empaques) > PRECIO VENTA ---');
const perdiendoTotal = allWithPV.filter(x => x.costoTotal > x.pv);
if (!perdiendoTotal.length) console.log('  Ninguna.');
else perdiendoTotal.forEach(x => console.log(`  ${x.marca + ' / ' + x.recipe.nombre}  costoTotal=${$(x.costoTotal)}  precioVenta=${$(x.pv)}`));

// Recetas con costo = 0 (síntoma de ingredientes faltantes)
console.log('\n--- Recetas con costo directo = 0 (probablemente ingredientes faltantes/sin precio) ---');
const recCeroCosto = Object.entries(recipeAnalyses).flatMap(([bid, arr]) =>
  arr.filter(x => x.costoDirecto === 0).map(x => ({ marca: brands.find(b => String(b.id) === bid)?.name || bid, ...x }))
);
if (!recCeroCosto.length) console.log('  Ninguna.');
else recCeroCosto.forEach(x => console.log(`  ${x.marca + ' / ' + x.recipe.nombre}`));

// Recetas con sub-receta que tiene ingredientes faltantes/incompletos
console.log('\n--- Recetas con ingredientes incompletos (sin precio o sin peso en banco) ---');
function subRecetaIncompletos(sr) {
  return (sr.ingredientes || []).some(ing => {
    if (ing.esManual) return false;
    const b = getBankIng(ing.ingredienteId, ing.ingredienteNombre);
    return !b || !b.pesoCompra || !b.precio;
  });
}
Object.entries(recetasPorMarca).forEach(([bid, recs]) => {
  const bname = brands.find(b => String(b.id) === bid)?.name || bid;
  recs.forEach(r => {
    if ((r.subRecetas || []).some(subRecetaIncompletos)) {
      console.log(`  ${bname} / ${r.nombre}`);
    }
  });
});

process.exit(0);
