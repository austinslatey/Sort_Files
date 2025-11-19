const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');

// CONFIGURATION - CHANGE THESE
const CSV_FILE = 'products.csv';        // Your CSV file name
const OUTPUT_FOLDER = 'downloaded_images'; // Folder to save images

// Create output folder if it doesn't exist
if (!fs.existsSync(OUTPUT_FOLDER)) {
  fs.mkdirSync(OUTPUT_FOLDER);
  console.log(`Created folder: ${OUTPUT_FOLDER}`);
}

// Function to download image
async function downloadImage(url, filepath) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 30000, // 30 second timeout
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      writer.on('finish', () => {
        console.log(`Downloaded: ${path.basename(filepath)}`);
        resolve();
      });
      writer.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete partial file
        reject(err);
      });
    });
  } catch (error) {
    console.error(`Failed to download: ${url} → ${error.message}`);
  }
}

// Main function
async function processCSV() {
  const rows = [];

  // Read CSV
  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on('data', (row) => {
      rows.push(row);
    })
    .on('end', async () => {
      console.log(`CSV parsed successfully. Found ${rows.length} products.\n`);

      for (const row of rows) {
        const name = row['Name'] || row['name'] || row['Part Number'] || row['part_number'];
        if (!name) {
          console.warn('Skipping row with no name:', row);
          continue;
        }

        const baseName = `${name.trim()}_Rough-Country_Waldoch`;
        let imageIndex = 0; // 0 = no suffix, 1+ = _1, _2, etc.

        // Loop through all possible image columns
        for (let i = 1; i <= 10; i++) {
          const urlKey = `Image URL ${i}`; // Adjust if your header is different
          const url = row[urlKey]?.trim();

          if (!url || url === '') continue;

          // Determine filename
          const ext = path.extname(url.split('?')[0]) || '.jpg'; // fallback to .jpg
          const suffix = imageIndex === 0 ? '' : `_${imageIndex}`;
          const filename = `${baseName}${suffix}${ext}`;
          const filepath = path.join(OUTPUT_FOLDER, filename);

          // Skip if already downloaded
          if (fs.existsSync(filepath)) {
            console.log(`Already exists, skipping: ${filename}`);
          } else {
            await downloadImage(url, filepath);
          }

          imageIndex++;
        }

        // Optional: small delay to be respectful to server
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('\nAll done! Images saved to:', OUTPUT_FOLDER);
    });
}

// Run the script
processCSV().catch(err => {
  console.error('Script failed:', err);
});