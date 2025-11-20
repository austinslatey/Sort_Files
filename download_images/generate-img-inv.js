const fs = require('fs');
const path = require('path');

const rootDir = './downloaded_images';
const outputCsv = 'image_inventory_by_position.csv';

let csv = 'Part Number,Image Name 1,Image Name 2,Image Name 3,Image Name 4,Image Name 5,Image Name 6,Image Name 7,Image Name 8,Image Name 9,Image Name 10\n';

console.log('Generating image inventory (supports .jpg + .png)...\n');

const partFolders = fs.readdirSync(rootDir)
    .map(name => path.join(rootDir, name))
    .filter(fullPath => {
        try {
            return fs.statSync(fullPath).isDirectory();
        } catch (e) {
            return false;
        }
    });

partFolders.forEach(folderPath => {
    const partNumber = path.basename(folderPath);

    // Get ALL image files: .jpg, .jpeg, .png
    const imageFiles = fs.readdirSync(folderPath)
        .filter(f => /\.(jpe?g|png)$/i.test(f));

    if (imageFiles.length === 0) {
        csv += `"${partNumber}"${', '.repeat(10)}\n`;
        console.log(`${partNumber} → no images`);
        return;
    }

    const escapedPart = partNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Match main image: partNumber_Rough-Country_Waldoch.(jpg|jpeg|png)
    const mainPattern = new RegExp(`^${escapedPart}_Rough-Country_Waldoch\\.(jpe?g|png)$`, 'i');

    // Match numbered: partNumber_Rough-Country_Waldoch_1.(jpg|png), etc.
    const numberedPattern = new RegExp(`^${escapedPart}_Rough-Country_Waldoch_(\\d+)\\.(jpe?g|png)$`, 'i');

    const candidates = [];

    imageFiles.forEach(file => {
        const lowerFile = file.toLowerCase();

        if (mainPattern.test(lowerFile)) {
            // Main image (no number) → highest priority
            candidates.push({ original: file, sortKey: 0 });
        } else {
            const match = lowerFile.match(numberedPattern);
            if (match) {
                const num = parseInt(match[1], 10);
                candidates.push({ original: file, sortKey: num + 100 }); // +100 so main always wins
            }
            // If naming is slightly off, still include at end
            else if (lowerFile.includes('rough-country_waldoch')) {
                candidates.push({ original: file, sortKey: 999 });
            }
        }
    });

    // Sort: main first, then by number
    candidates.sort((a, b) => a.sortKey - b.sortKey);

    // Take first 10
    const top10 = candidates.slice(0, 10).map(c => c.original);

    // Build CSV row
    const row = [partNumber, ...top10];
    while (row.length < 11) row.push(''); // pad to 10 images

    csv += row.map(cell => `"${cell}"`).join(',') + '\n';

    console.log(`${partNumber} → ${top10.length} image(s): ${top10.join(', ') || '(none)'}`);
});

fs.writeFileSync(outputCsv, csv);
console.log('\nDone! Full inventory with JPG + PNG support →', outputCsv);
console.log('Open in Excel — perfect columns every time!');