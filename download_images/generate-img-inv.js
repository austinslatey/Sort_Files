const fs = require('fs');
const path = require('path');

const rootDir = './downloaded_images';
const outputCsv = 'image_inventory_by_position.csv';

let csv = 'Part Number,Image Name 1,Image Name 2,Image Name 3,Image Name 4,Image Name 5,Image Name 6,Image Name 7,Image Name 8,Image Name 9,Image Name 10\n';

console.log('Generating image inventory (smart sequential fill)...\n');

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
    const files = fs.readdirSync(folderPath)
        .filter(f => /\.(jpe?g)$/i.test(f))
        .map(f => f.toLowerCase()); // normalize for matching

    if (files.length === 0) {
        csv += `"${partNumber}"${', '.repeat(10)}\n`;
        console.log(`${partNumber} → no images`);
        return;
    }

    // Normalize part number for matching (escape special chars)
    const escapedPart = partNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const mainImagePattern = new RegExp(`^${escapedPart}_rough-country_waldoch\\.jpe?g$`, 'i');
    const numberedPattern = new RegExp(`^${escapedPart}_rough-country_waldoch_(\\d+)\\.jpe?g$`, 'i');

    const candidates = [];

    files.forEach(file => {
        // Check if it's the main image (no number)
        if (mainImagePattern.test(file)) {
            candidates.push({ file: file, original: file, sortKey: 0 }); // main image = highest priority
        }
        // Check if it's a numbered image
        else {
            const match = file.match(numberedPattern);
            if (match) {
                const num = parseInt(match[1], 10);
                candidates.push({ file: file, original: file, sortKey: num + 100 }); // +100 so main beats all
            }
        }
    });

    // Sort: main image first (sortKey 0), then by number ascending
    candidates.sort((a, b) => a.sortKey - b.sortKey);

    // Take only first 10, extract original filenames (preserve case)
    const top10 = candidates.slice(0, 10);

    // Build row: Image Name 1 to 10
    const row = [partNumber];
    for (let i = 0; i < 10; i++) {
        const img = top10[i];
        row.push(img ? img.original : '');
    }

    csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    console.log(`${partNumber} → ${top10.length} image(s) → ${top10.map(t => t.original).join(', ')}`);
});

fs.writeFileSync(outputCsv, csv);
console.log('\nDone! CSV generated →', outputCsv);
console.log('Open in Excel/Google Sheets — perfect columns every time!');