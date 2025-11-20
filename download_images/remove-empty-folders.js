const fs = require('fs');
const path = require('path');

const rootDir = './downloaded_images';

console.log('Scanning for part folders with NO images (.jpg, .jpeg, .png)...\n');

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

    try {
        const files = fs.readdirSync(folderPath);

        // Check if there's at least ONE image (jpg or png)
        const hasImage = files.some(file =>
            /\.(jpe?g|png)$/i.test(file)
        );

        if (!hasImage) {
            if (files.length === 0) {
                console.log(`Completely empty folder: ${partNumber} → deleting`);
                fs.rmdirSync(folderPath);
            } else {
                console.log(`No images (has ${files.length} other file(s)): ${partNumber} → deleting folder`);
                fs.rmSync(folderPath, { recursive: true, force: true });
            }
            deletedCount++;
        } else {
            const imageCount = files.filter(f => /\.(jpe?g|png)$/i.test(f)).length;
            console.log(`${partNumber} → has ${imageCount} image(s) → keeping`);
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`${partNumber} → already deleted or inaccessible`);
        } else {
            console.log(`Error reading ${partNumber}: ${err.message}`);
        }
    }
});

console.log(`\nDone! Removed ${deletedCount} part folder(s) with no images (JPG/PNG).`);
console.log('All folders with at least one .jpg or .png are safe!');