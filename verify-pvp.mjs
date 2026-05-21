import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newContext().then(c => c.newPage());
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3000);
await page.locator('input[type="email"]').fill('grupohemd@gmail.com');
await page.locator('input[type="password"]').fill('Camisa14');
await page.locator('button:has-text("Ingresar")').click();
await page.waitForTimeout(4000);
const soul = page.locator('text=Soul Chkn').first();
if (await soul.isVisible({ timeout: 3000 }).catch(() => false)) {
  await soul.click();
  await page.waitForTimeout(1500);
}
await page.locator('text=Variación de Precios').first().click();
await page.waitForTimeout(1500);
await page.locator('button:has-text("Impacto en Platos")').click();
await page.waitForTimeout(2000);

const fechaHeader = await page.locator('text=Basado en actualización').first().textContent().catch(() => null);
console.log('Header fecha:', fechaHeader);

const cards = await page.evaluate(() => {
  const result = [];
  document.querySelectorAll('h3').forEach(h3 => {
    const grid = h3.parentElement?.querySelector('.grid');
    if (!grid) return;
    grid.querySelectorAll(':scope > div.rounded-xl').forEach(card => {
      const nombre = card.querySelector('h4')?.textContent?.trim();
      const sugerido = card.querySelector('p.text-lg.font-semibold')?.textContent?.trim();
      const linesEls = card.querySelectorAll('.text-xs.space-y-0\\.5 > div');
      const lines = [];
      linesEls.forEach(d => lines.push(d.textContent?.trim()));
      result.push({ marca: h3.textContent?.trim(), nombre, sugerido, lines });
    });
  });
  return result;
});

console.log('\nMuestra de primeras 4 cards:');
cards.slice(0, 4).forEach(c => {
  console.log(`\n[${c.marca}] ${c.nombre}  → ${c.sugerido}`);
  c.lines.forEach(l => console.log('  ' + l));
});

console.log('\nÚltimas 2 cards:');
cards.slice(-2).forEach(c => {
  console.log(`\n[${c.marca}] ${c.nombre}  → ${c.sugerido}`);
  c.lines.forEach(l => console.log('  ' + l));
});

if (errs.length) {
  console.log('\nERRORES:', errs);
} else {
  console.log('\nSin errores.');
}
await browser.close();
process.exit(0);
