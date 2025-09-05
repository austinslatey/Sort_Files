const fs = require('fs');

// Step 1: Process terminal output to generate files.txt
const terminalOutput = `
AzureAD+YourName@DESKTOP-DESKTOP MINGW64 ~/Your/File/Path
$ ls 31000
31000_ko3qtrdr_p01_1.jpg  31000_kodir_p04.jpg

AzureAD+YourName@DESKTOP-DESKTOP MINGW64 ~/Your/File/Path
$ ls 31003
ls: cannot access '31003': No such file or directory

AzureAD+YourName@DESKTOP-DESKTOP MINGW64 ~/Your/File/Path
$ ls 31006
31006_ko3qtrdr_p01_1.jpg  31006_kodir_p04.jpg
`;

// Split the terminal output into lines
const lines = terminalOutput.trim().split('\n');

// Extract directories from ls commands and .jpg files
const directories = [];
const files = [];
let currentDir = null;
lines.forEach((line) => {
  // Match lines starting with "$ ls " to extract directory names
  if (line.startsWith('$ ls ')) {
    currentDir = line.replace('$ ls ', '').trim();
    directories.push(currentDir);
  }
  // Collect lines with .jpg files, associating with the current directory
  if (line.includes('.jpg')) {
    files.push(...line.trim().split(/\s+/).filter(file => file).map(file => ({ file, dir: currentDir })));
  }
});

// Write the filtered file list to files.txt
try {
  fs.writeFileSync('files.txt', files.map(item => item.file).join('\n'), 'utf8');
  console.log('File list has been written to files.txt');
} catch (err) {
  console.error('Error writing to file:', err);
  process.exit(1);
}

// Step 2: Generate CSV with a row for each directory
const groupedFiles = {};
// Initialize all directories with empty arrays
directories.forEach(dir => {
  groupedFiles[dir] = [];
});

// Add files to their respective prefix groups
files.forEach(({ file, dir }) => {
  groupedFiles[dir].push(file);
});

// Create CSV content: each directory gets a row, empty or with files
const csvRows = [];
const prefixes = directories.sort(); // Sort directories
prefixes.forEach(prefix => {
  const row = groupedFiles[prefix].map(file => `"${file}"`); // Wrap in quotes
  csvRows.push(row.join(',')); // Empty row will be ""
});

// Write CSV to file
const csvContent = csvRows.join('\n');
try {
  fs.writeFileSync('files_by_prefix_row.csv', csvContent, 'utf8');
  console.log('CSV file has been written to files_by_prefix_row.csv');
} catch (err) {
  console.error('Error writing to file:', err);
}