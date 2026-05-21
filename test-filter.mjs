// Reproduce la lógica de filtrado de VariacionPreciosModule contra los datos reales de Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const cfg = {apiKey:'AIzaSyAZO4_ckQ3-k019Yykvkt0f8T6hDlGyfKg',authDomain:'costos-hemd.firebaseapp.com',projectId:'costos-hemd',storageBucket:'costos-hemd.firebasestorage.app',messagingSenderId:'864293531130',appId:'1:864293531130:web:353f7010a490f44103c843'};
const app = initializeApp(cfg);
const db = getFirestore(app);
const snap = await getDoc(doc(db,'app','data'));
const ingredients = snap.data().ingredients || [];

// Replica EXACTA del useMemo del componente
function buildIngredientesConHistorial(ings) {
  const lista = [];
  for (const ing of ings) {
    const historial = Array.isArray(ing.historialPrecios) ? ing.historialPrecios : [];
    if (historial.length === 0) continue;
    const ordenado = [...historial].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const ultimo = ordenado[0];
    const pgA = Number(ultimo.precioGramoAnterior) || 0;
    const pgN = Number(ultimo.precioGramoNuevo) || 0;
    const porcentaje = pgA > 0 ? ((pgN - pgA) / pgA) * 100 : 0;
    lista.push({ nombre: ing.ingrediente, porcentaje });
  }
  return lista;
}

function aplicarFiltro(lista, filtroActivo) {
  const filtrados = lista.filter(item => {
    if (filtroActivo === 'subieron' && !(item.porcentaje > 0)) return false;
    if (filtroActivo === 'bajaron' && !(item.porcentaje < 0)) return false;
    if (filtroActivo === 'sinCambio' && item.porcentaje !== 0) return false;
    return true;
  });
  if (filtroActivo === 'subieron') filtrados.sort((a, b) => b.porcentaje - a.porcentaje);
  else if (filtroActivo === 'bajaron') filtrados.sort((a, b) => a.porcentaje - b.porcentaje);
  else if (filtroActivo === 'todos') filtrados.sort((a, b) => Math.abs(b.porcentaje) - Math.abs(a.porcentaje));
  return filtrados;
}

const data = buildIngredientesConHistorial(ingredients);
console.log('Total ingredientes con historial:', data.length);

for (const filtro of ['todos', 'subieron', 'bajaron', 'sinCambio']) {
  const r = aplicarFiltro(data, filtro);
  console.log(`\n[${filtro}] -> ${r.length} items (primeros 5):`);
  r.slice(0, 5).forEach(x => console.log(`  ${x.nombre.padEnd(35)} ${x.porcentaje >= 0 ? '+' : ''}${x.porcentaje.toFixed(2)}%`));
}

// Sanity check: ningún positivo cuando filtro=bajaron, ningún negativo cuando filtro=subieron
const errSubieron = aplicarFiltro(data, 'subieron').filter(x => x.porcentaje <= 0);
const errBajaron = aplicarFiltro(data, 'bajaron').filter(x => x.porcentaje >= 0);
const errSinCambio = aplicarFiltro(data, 'sinCambio').filter(x => x.porcentaje !== 0);
console.log('\n=== INVARIANTES ===');
console.log('Subieron con porcentaje <= 0:', errSubieron.length, errSubieron.length ? '❌' : '✓');
console.log('Bajaron con porcentaje >= 0:', errBajaron.length, errBajaron.length ? '❌' : '✓');
console.log('Sin cambio con porcentaje != 0:', errSinCambio.length, errSinCambio.length ? '❌' : '✓');
process.exit(0);
