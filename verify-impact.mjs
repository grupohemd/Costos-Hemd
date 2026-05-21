import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newContext().then(c => c.newPage());

const logs = [];
page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`));

await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3000);

console.log('=== Login ===');
await page.locator('input[type="email"]').fill('grupohemd@gmail.com');
await page.locator('input[type="password"]').fill('Camisa14');
await page.locator('button:has-text("Ingresar")').click();
await page.waitForTimeout(4000);

console.log('=== Seleccionar Soul Chkn ===');
const soul = page.locator('text=Soul Chkn').first();
if (await soul.isVisible({ timeout: 3000 }).catch(() => false)) {
  await soul.click();
  await page.waitForTimeout(1500);
}

console.log('=== Entrar a Variación de Precios ===');
await page.locator('text=Variación de Precios').first().click();
await page.waitForTimeout(2000);

console.log('\n=== Estado inicial: vista "Ingredientes" ===');
const ingTabActivo = await page.locator('button:has-text("Ingredientes")').first().getAttribute('class');
console.log('Botón Ingredientes class incluye bg-gray-900:', ingTabActivo?.includes('bg-gray-900'));

console.log('\n=== Clic en "Impacto en Platos" ===');
await page.locator('button:has-text("Impacto en Platos")').click();
await page.waitForTimeout(2000);

const cards = await page.evaluate(() => {
  const containers = document.querySelectorAll('h3');
  const result = [];
  for (const h3 of containers) {
    const marca = h3.textContent;
    const grid = h3.parentElement?.querySelector('.grid');
    if (!grid) continue;
    const cardsArr = grid.querySelectorAll('div.rounded-xl');
    const platos = [];
    for (const c of cardsArr) {
      const nombre = c.querySelector('h4')?.textContent || c.querySelector('.font-medium')?.textContent;
      const fcBadge = c.querySelector('.bg-green-50, .bg-amber-50, .bg-red-50, .bg-gray-100');
      const fcText = fcBadge?.textContent?.trim();
      const sugerido = c.querySelector('.text-lg.font-semibold')?.textContent;
      const recom = c.querySelector('span.bg-green-700, span.bg-white.border-green-200, span.bg-white.border-gray-200')?.textContent?.trim();
      const explic = c.querySelector('p.text-xs.text-gray-500.leading-relaxed')?.textContent?.trim();
      platos.push({ nombre, fc: fcText, sugerido, recom, explic });
    }
    result.push({ marca, platos });
  }
  return result;
});

for (const grupo of cards) {
  console.log(`\n--- ${grupo.marca} ---`);
  for (const p of grupo.platos) {
    console.log(`  ${(p.nombre || '?').padEnd(40)} FC=${p.fc || '-'}  sugerido=${p.sugerido || '-'}  recom=${p.recom || '-'}`);
    if (p.explic) console.log(`    "${p.explic.slice(0, 130)}"`);
  }
}

const summary = await page.locator('text=Necesitan ajuste').first().textContent().catch(() => null);
console.log('\n=== Summary visible:', summary);

const errores = logs.filter(l => l.startsWith('[pageerror]') || l.startsWith('[error]'));
if (errores.length) {
  console.log('\n=== ERRORES DEL NAVEGADOR ===');
  errores.slice(0, 20).forEach(e => console.log(e));
} else {
  console.log('\n=== Sin errores del navegador ===');
}

await browser.close();
process.exit(0);
