const fs = require('fs');
const path = require('path');

const rootDir = './downloaded_images';

console.log('Scanning for empty part folders (no .jpg/.jpeg files)...\n');

let deletedCount = 0;

const folders = fs.readdirSync(rootDir)
    .map(name => path.join(rootDir, name))
    .filter(fullPath => {
        try {
            return fs.statSync(fullPath).isDirectory();
        } catch (e) {
            return false;
        }
    });

folders.forEach(folderPath => {
    const partNumber = path.basename(folderPath);

    let hasImage = false;

    try {
        const files = fs.readdirSync(folderPath);

        // Check if any file is a .jpg or .jpeg
        hasImage = files.some(file => /\.(jpe?g)$/i.test(file));

        if (!hasImage && files.length === 0) {
            // Completely empty folder
            console.log(`Empty folder (no files at all): ${partNumber} → deleting`);
            fs.rmdirSync(folderPath);
            deletedCount++;
        }
        else if (!hasImage && files.length > 0) {
            // Has files, but none are images (maybe .txt, .DS_Store, etc.)
            console.log(`No images (but has ${files.length} other file(s)): ${partNumber} → deleting anyway`);
            fs.rmSync(folderPath, { recursive: true, force: true });
            deletedCount++;
        }
        else {
            console.log(`${partNumber} → has images → keeping`);
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`${partNumber} → already gone or access denied`);
        } else {
            console.log(`Error with ${partNumber}:`, err.message);
        }
    }
});

console.log(`\nDone! Removed ${deletedCount} empty/unused part folder(s).`);