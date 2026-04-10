// screenshot.mjs — Puppeteer screenshot utility
// Usage: node screenshot.mjs <url> [label]
// Output: ./temporary screenshots/screenshot-N.png
//         ./temporary screenshots/screenshot-N-label.png

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url   = process.argv[2];
const label = process.argv[3] || null;

if (!url) {
  console.error('Usage: node screenshot.mjs <url> [label]');
  process.exit(1);
}

const outputDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function getNextFilename(dir, label) {
  let n = 1;
  while (true) {
    const name = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
    if (!fs.existsSync(path.join(dir, name))) return name;
    n++;
  }
}

const filename = getNextFilename(outputDir, label);
const outputPath = path.join(outputDir, filename);

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    console.log(`Navigating to ${url} ...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluateHandle('document.fonts.ready');

    // Force all animation elements visible
    await page.evaluate(async () => {
      document.querySelectorAll('.anim-fade, .anim-slide-up, .anim-slide-left, .anim-slide-right, .anim-scale-in').forEach(el => el.classList.add('visible'));
      await new Promise(r => setTimeout(r, 600));
    });

    await page.screenshot({ path: outputPath, fullPage: true });
    console.log(`Saved: ${outputPath}`);
  } catch (err) {
    console.error('Screenshot failed:', err.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
