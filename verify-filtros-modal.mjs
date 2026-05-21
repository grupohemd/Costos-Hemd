import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newContext().then(c => c.newPage());
const errs = [];
page.on('pageerror', e => errs.push(`pageerror: ${e.message}`));
page.on('console', m => { if (m.type() === 'error') errs.push(`console.error: ${m.text()}`); });

await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3000);
await page.locator('input[type="email"]').fill('grupohemd@gmail.com');
await page.locator('input[type="password"]').fill('Camisa14');
await page.locator('button:has-text("Ingresar")').click();
await page.waitForTimeout(4000);
await page.locator('text=Soul Chkn').first().click();
await page.waitForTimeout(1500);
await page.locator('text=Variación de Precios').first().click();
await page.waitForTimeout(1500);
await page.locator('button:has-text("Impacto en Platos")').click();
await page.waitForTimeout(2000);

const countCards = async () => {
  return await page.evaluate(() => {
    let count = 0;
    document.querySelectorAll('h3').forEach(h3 => {
      const grid = h3.parentElement?.querySelector('.grid');
      if (!grid) return;
      count += grid.querySelectorAll(':scope > div.rounded-xl').length;
    });
    return count;
  });
};

const getCounts = async () => {
  const labels = await page.locator('button:has-text("Todos ("), button:has-text("Necesitan subida ("), button:has-text("En rango (")').allTextContents();
  return labels;
};

console.log('Filtros visibles:', await getCounts());
console.log('Cards iniciales (Todos):', await countCards());

await page.locator('button:has-text("Necesitan subida")').click();
await page.waitForTimeout(800);
console.log('Cards tras "Necesitan subida":', await countCards());

await page.locator('button:has-text("En rango")').click();
await page.waitForTimeout(800);
console.log('Cards tras "En rango":', await countCards());

await page.locator('button:has-text("Todos (")').click();
await page.waitForTimeout(800);

// Verify only matching badge polarity for "Necesitan subida"
await page.locator('button:has-text("Necesitan subida")').click();
await page.waitForTimeout(800);
const recomendaciones = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('h3').forEach(h3 => {
    const grid = h3.parentElement?.querySelector('.grid');
    if (!grid) return;
    grid.querySelectorAll(':scope > div.rounded-xl').forEach(card => {
      const recomEl = card.querySelector('span.bg-green-700, span.bg-white');
      out.push(recomEl?.textContent?.trim());
    });
  });
  return out;
});
console.log('Recomendaciones tras "Necesitan subida":', recomendaciones.slice(0, 5));
const allSubir = recomendaciones.every(r => r && r.startsWith('Subir'));
console.log('Todas son "Subir LX"?:', allSubir);

await page.locator('button:has-text("En rango")').click();
await page.waitForTimeout(800);
const recomendaciones2 = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('h3').forEach(h3 => {
    const grid = h3.parentElement?.querySelector('.grid');
    if (!grid) return;
    grid.querySelectorAll(':scope > div.rounded-xl').forEach(card => {
      const recomEl = card.querySelector('span.bg-green-700, span.bg-white');
      out.push(recomEl?.textContent?.trim());
    });
  });
  return out;
});
console.log('Recomendaciones tras "En rango":', recomendaciones2.slice(0, 5));
const allMantener = recomendaciones2.every(r => r === 'Mantener');
console.log('Todas son "Mantener"?:', allMantener);

await page.locator('button:has-text("Todos (")').click();
await page.waitForTimeout(800);

// Click "Ver detalles" en la primera card
console.log('\n=== Abriendo modal ===');
const verDetalles = page.locator('button:has-text("Ver detalles")').first();
await verDetalles.click();
await page.waitForTimeout(1000);

const modalVisible = await page.locator('.bg-black\\/50').first().isVisible().catch(() => false);
console.log('Modal visible:', modalVisible);

const modalTitle = await page.locator('.bg-black\\/50 h3').first().textContent().catch(() => null);
console.log('Título modal:', modalTitle);

const filas = await page.evaluate(() => {
  const rows = document.querySelectorAll('.bg-black\\/50 tbody tr');
  return Array.from(rows).slice(0, 5).map(r => {
    const cells = Array.from(r.querySelectorAll('td')).map(c => c.textContent.trim());
    const highlighted = r.classList.contains('bg-yellow-50');
    return { cells, highlighted };
  });
});
console.log('\nPrimeras 5 filas:');
filas.forEach((f, i) => console.log(`  [${i}] ${f.highlighted ? '⭐ ' : '   '}${f.cells.join(' | ')}`));

const totalRow = await page.evaluate(() => {
  const rows = document.querySelectorAll('.bg-black\\/50 tfoot tr');
  return Array.from(rows).map(r => Array.from(r.querySelectorAll('td')).map(c => c.textContent.trim()).join(' | '));
});
console.log('\nFilas tfoot:');
totalRow.forEach(r => console.log('  ' + r));

// Cerrar haciendo clic fuera
console.log('\n=== Cerrar haciendo clic fuera ===');
await page.locator('.bg-black\\/50').first().click({ position: { x: 10, y: 10 } });
await page.waitForTimeout(500);
const modalStillVisible = await page.locator('.bg-black\\/50').first().isVisible().catch(() => false);
console.log('Modal cerrado al hacer clic fuera:', !modalStillVisible);

if (errs.length) {
  console.log('\n=== ERRORES ===');
  errs.forEach(e => console.log(e));
} else {
  console.log('\nSin errores.');
}

await browser.close();
process.exit(0);
