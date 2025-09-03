const fs = require('fs');

// Step 1: Process terminal output to generate files.txt
const terminalOutput = `
AzureAD+YourName@DESKTOP-DESKTOP MINGW64 ~/Your/File/Path
$ ls 4000
23-4000_ko3qtrdr_p04.jpg  23-4000_ko3qtrps_p01_2.jpg  23-4000_kodir_p01_1.jpg  23-4000_p05_3.jpg

AzureAD+YourName@DESKTOP-DESKTOP MINGW64 ~/Your/File/Path
$ ls 4005
23-4005_ko3qtrdr_p04.jpg  23-4005_ko3qtrps_p01_2.jpg  23-4005_kodir_p01_1.jpg  23-4005_p03_1.jpg  23-4005_p05_3.jpg

AzureAD+YourName@DESKTOP-DESKTOP MINGW64 ~/Your/File/Path
$ ls 4010
23-4010_ko3qtrdr_p04.jpg  23-4010_ko3qtrps_p01_2.jpg  23-4010_kodir_p01_1.jpg  23-4010_p05_3.jpg
`;

// Split the terminal output into lines and filter for .jpg files
const lines = terminalOutput.trim().split('\n');
const files = lines
  .filter(line => line.includes('.jpg')) // Keep only lines with .jpg
  .flatMap(line => line.trim().split(/\s+/)) // Split each line by whitespace
  .filter(file => file); // Remove any empty entries

// Write the filtered list to files.txt
try {
  fs.writeFileSync('files.txt', files.join('\n'), 'utf8');
  console.log('File list has been written to files.txt');
} catch (err) {
  console.error('Error writing to file:', err);
  process.exit(1); // Exit if the file can't be written
}

// Step 2: Read files.txt and generate CSV
let fileList;
try {
  fileList = fs.readFileSync('./files.txt', 'utf8');
} catch (err) {
  console.error('Error reading files.txt:', err);
  process.exit(1); // Exit if the file can't be read
}

// Split the list into lines and filter out empty entries
const fileListArray = fileList.trim().split('\n').filter(file => file);

// Group files by prefix (e.g., 51-10005)
const groupedFiles = {};
fileListArray.forEach(file => {
  const prefix = file.split('_')[0]; // Extract prefix (e.g., 51-10005)
  if (!groupedFiles[prefix]) {
    groupedFiles[prefix] = [];
  }
  groupedFiles[prefix].push(file);
});

// Create CSV content: each prefix gets a row with files in columns
const csvRows = [];
const prefixes = Object.keys(groupedFiles).sort();
prefixes.forEach(prefix => {
  const row = groupedFiles[prefix].map(file => `"${file}"`); // Wrap in quotes to handle commas in file names
  csvRows.push(row.join(','));
});

// Write CSV to file
const csvContent = csvRows.join('\n');
try {
  fs.writeFileSync('files_by_prefix_row.csv', csvContent, 'utf8');
  console.log('CSV file has been written to files_by_prefix_row.csv');
} catch (err) {
  console.error('Error writing to file:', err);
}