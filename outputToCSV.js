const fs = require('fs');

// Read the file list from files.txt
let fileList;
try {
  fileList = fs.readFileSync('./files.txt', 'utf8');
} catch (err) {
  console.error('Error reading files.txt:', err);
  process.exit(1); // Exit if the file can't be read
}

// Split the list into lines and filter out empty entries
const files = fileList.trim().split('\n').filter(file => file);

// Group files by prefix (e.g., 28-31015)
const groupedFiles = {};
files.forEach(file => {
  const prefix = file.split('_')[0]; // Extract prefix (e.g., 28-31015)
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