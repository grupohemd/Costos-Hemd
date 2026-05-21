import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();

const consoleLogs = [];
page.on('console', msg => {
  consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
});

console.log('=== Navegando a localhost:5173 ===');
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3000);

console.log('=== Login ===');
await page.locator('input[type="email"]').fill('grupohemd@gmail.com');
await page.locator('input[type="password"]').fill('Camisa14');
await page.locator('button:has-text("Ingresar")').click();

console.log('=== Esperando carga post-login ===');
await page.waitForTimeout(4000);

// Seleccionar Soul Chkn (primera marca)
console.log('=== Seleccionando marca Soul Chkn ===');
const soulChkn = page.locator('text=Soul Chkn').first();
if (await soulChkn.isVisible({ timeout: 3000 }).catch(() => false)) {
  await soulChkn.click();
  await page.waitForTimeout(1000);
}

console.log('=== Entrando al módulo Variación de Precios ===');
await page.locator('text=Variación de Precios').first().click();
await page.waitForTimeout(2000);

const getListInfo = async () => {
  return await page.evaluate(() => {
    const cards = document.querySelectorAll('.space-y-3 > div');
    return Array.from(cards).slice(0, 8).map(card => {
      const nombre = card.querySelector('.text-base.font-medium')?.textContent?.trim();
      const badge = card.querySelector('.bg-red-50, .bg-green-50, .bg-gray-100')?.textContent?.trim();
      return { nombre, badge };
    });
  });
};

console.log('\n=== Estado inicial (filtro = Todos) ===');
let items = await getListInfo();
items.forEach((it, i) => console.log(`  [${i}] ${it.nombre?.padEnd(35)} ${it.badge}`));

console.log('\n=== Click en "Bajaron" ===');
await page.locator('button:has-text("Bajaron")').click();
await page.waitForTimeout(1500);

items = await getListInfo();
console.log('Items visibles después de clic en Bajaron:');
items.forEach((it, i) => console.log(`  [${i}] ${it.nombre?.padEnd(35)} ${it.badge}`));

const allItems = await page.evaluate(() => {
  const cards = document.querySelectorAll('.space-y-3 > div');
  return Array.from(cards).map(card => {
    const badge = card.querySelector('.bg-red-50, .bg-green-50, .bg-gray-100')?.textContent?.trim() || '';
    return badge;
  });
});
const subio = allItems.filter(b => b.includes('+')).length;
const bajo = allItems.filter(b => b.includes('-') && !b.includes('+')).length;
const igual = allItems.filter(b => b.includes('0%')).length;
console.log(`\nResumen badges visibles: total=${allItems.length}, subio(+)=${subio}, bajo(-)=${bajo}, igual(0%)=${igual}`);

console.log('\n=== Click en "Subieron" ===');
await page.locator('button:has-text("Subieron")').click();
await page.waitForTimeout(1500);
items = await getListInfo();
items.forEach((it, i) => console.log(`  [${i}] ${it.nombre?.padEnd(35)} ${it.badge}`));

console.log('\n=== Click en "Sin cambio" ===');
await page.locator('button:has-text("Sin cambio")').click();
await page.waitForTimeout(1500);
const sinCambioCount = await page.locator('.space-y-3 > div').count();
console.log(`Items visibles tras "Sin cambio": ${sinCambioCount}`);

console.log('\n=== Console logs capturados del navegador ===');
consoleLogs.filter(l => l.includes('VariacionPrecios')).forEach(l => console.log(l));

await browser.close();
process.exit(0);
