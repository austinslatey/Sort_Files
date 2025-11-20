// download-images-RESUME.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const CSV_FILE = 'products.csv';
const OUTPUT_FOLDER = 'downloaded_images';

// RESUME SUPPORT — CHANGE THIS TO YOUR CURRENT LINE
const START_FROM_LINE = 4144;   // ← Set to 4144 to continue from "76650RED"

if (!fs.existsSync(OUTPUT_FOLDER)) fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });

async function downloadImage(url, filepath) {
  if (fs.existsSync(filepath)) {
    console.log(`  Already exists → ${path.basename(filepath)}`);
    return;
  }
  try {
    const writer = fs.createWriteStream(filepath);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 60000,
    });
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`  Downloaded → ${path.basename(filepath)}`);
        resolve();
      });
      writer.on('error', reject);
    });
  } catch (err) {
    console.error(`  Failed → ${url}`);
  }
}

(async () => {
  console.log('Reading CSV file...\n');

  let content = fs.readFileSync(CSV_FILE, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);

  const lines = content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l);

  if (lines.length <= 1) {
    console.log('CSV is empty!');
    return;
  }

  const totalProducts = lines.length - 1;
  console.log(`Found ${totalProducts} products total`);
  console.log(`STARTING FROM LINE ${START_FROM_LINE} (product ${START_FROM_LINE}/${totalProducts})\n`);

  // Start from your desired line (line 0 = header, line 1 = first product)
  for (let i = Math.max(START_FROM_LINE, 1); i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(',').map(c => c.trim());

    const name = cols[0];
    if (!name || name === 'Name') continue;

    const partFolder = path.join(OUTPUT_FOLDER, name);
    if (!fs.existsSync(partFolder)) {
      fs.mkdirSync(partFolder, { recursive: true });
    }

    const baseName = `${name}_Rough-Country_Waldoch`;
    let imgIndex = 0;

    console.log(`\n[${i}/${totalProducts}] ${name}`);

    for (let j = 1; j < cols.length && j <= 10; j++) {
      let url = cols[j];
      if (!url || !url.startsWith('http')) continue;

      const ext = path.extname(new URL(url).pathname) || '.jpg';
      const suffix = imgIndex === 0 ? '' : `_${imgIndex}`;
      const filename = `${baseName}${suffix}${ext}`;
      const fullPath = path.join(partFolder, filename);

      await downloadImage(url, fullPath);
      imgIndex++;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\nFINISHED! All remaining images downloaded.');
  console.log(`Check folder: ${path.resolve(OUTPUT_FOLDER)}`);
})();