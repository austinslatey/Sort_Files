const fs = require('fs');
const path = require('path');

const rootDir = './downloaded_images';
const csvOutput = 'zero_mb_images.csv';
const deleteScriptOutput = 'delete_zero_mb_images.sh';

const zeroMbFiles = [];
let csvContent = 'Part Number,Image Name,File Size (bytes)\n';

// Walk through all directories and files recursively
function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativeFromRoot = path.relative(rootDir, dir);

        if (entry.isDirectory()) {
            // Skip if it's the root folder itself (avoid empty part number)
            if (relativeFromRoot !== '') {
                scanDirectory(fullPath);
            } else {
                // First level folders (part numbers)
                scanDirectory(fullPath);
            }
        } else if (entry.isFile()) {
            // Only check image files
            if (/\.(jpe?g)$/i.test(entry.name)) {
                const stats = fs.statSync(fullPath);
                if (stats.size === 0) {
                    const partNumber = path.basename(dir); // Folder name = Part Number
                    zeroMbFiles.push({
                        partNumber,
                        imageName: entry.name,
                        fileSize: stats.size
                    });

                    csvContent += `"${partNumber}","${entry.name}",${stats.size}\n`;
                }
            }
        }
    }
}

// Start scanning
console.log('Scanning for 0-byte JPG images...');
scanDirectory(rootDir);

if (zeroMbFiles.length === 0) {
    console.log('No 0-byte images found. Great job!');
    fs.writeFileSync(csvOutput, 'No 0-byte images found.\n');
} else {
    // Write CSV
    fs.writeFileSync(csvOutput, csvContent);
    console.log(`Found ${zeroMbFiles.length} zero-byte image(s).`);
    console.log(`CSV exported to: ${csvOutput}`);

    // Generate deletion script (safe to review before running)
    let deleteScript = '#!/bin/bash\n';
    deleteScript += '# This script deletes all 0-byte JPG images listed in the CSV\n';
    deleteScript += '# Review carefully before running!\n\n';
    deleteScript += 'echo "Deleting 0-byte images..."\n\n';

    zeroMbFiles.forEach(file => {
        const safePath = path.join(rootDir, file.partNumber, file.imageName).replace(/'/g, "'\\'''");
        deleteScript += `rm -v '${safePath}'\n`;
    });

    deleteScript += '\necho "Done. All 0-byte images removed."\n';

    fs.writeFileSync(deleteScriptOutput, deleteScript);
    fs.chmodSync(deleteScriptOutput, '755'); // Make executable
    console.log(`Deletion script generated: ${deleteScriptOutput}`);
    console.log(`   Run it later with: ./${deleteScriptOutput}`);
}