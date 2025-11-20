const fs = require('fs');
const path = require('path');

const rootDir = './downloaded_images';
const csvOutput = 'zero_mb_images.csv';

let csvContent = 'Part Number,Image Name,File Size (bytes)\n';
let foundCount = 0;

// Get all first-level folders (these are your Part Numbers)
const partFolders = fs.readdirSync(rootDir)
    .map(name => path.join(rootDir, name))
    .filter(fullPath => fs.statSync(fullPath).isDirectory());

console.log(`Scanning ${partFolders.length} part folders for 0-byte JPGs...\n`);

partFolders.forEach(folderPath => {
    const partNumber = path.basename(folderPath);

    // Skip if folder doesn't actually exist or is empty
    if (!fs.existsSync(folderPath)) return;

    const files = fs.readdirSync(folderPath);

    files.forEach(fileName => {
        if (/\.(jpe?g)$/i.test(fileName)) {  // matches .jpg, .jpeg, .JPG, etc.
            const filePath = path.join(folderPath, fileName);
            const stats = fs.statSync(filePath);

            if (stats.size === 0) {
                foundCount++;
                csvContent += `"${partNumber}","${fileName}",0\n`;
                console.log(`Found → ${partNumber}/${fileName}`);
            }
        }
    });
});

// Write the CSV file
if (foundCount === 0) {
    console.log('\nNo 0-byte images found. You are all good!');
    fs.writeFileSync(csvOutput, 'No 0-byte images found.\n');
} else {
    fs.writeFileSync(csvOutput, csvContent);
    console.log(`\nDone! Found ${foundCount} zero-byte image(s).`);
    console.log(`CSV saved as: ${csvOutput}`);
}