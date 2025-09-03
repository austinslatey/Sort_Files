const fs = require('fs');

// Your file list as a string
const fileList = `
28-31015_p03_6.jpg
28-31015_p05_2.jpg
28-31035_ko3qtrdr_p04.jpg
28-31035_kodir_p01_1.jpg
28-31035_p05_2.jpg
28-31045_kodir_p04.jpg
28-31045_p03_1.jpg
28-31095_ko3qtrps_p01_2.jpg
28-31095_p05_2.jpg
28-31135_ko3qtrdr_p04.jpg
28-31135_ko3qtrps_p01_2.jpg
28-31275_ko3qtrdr_p04.jpg
28-31275_kodir_p01_1.jpg
28-32165_p05_1.jpg
28-32425_p05_2.jpg
28-32785_ko3qtrdr_p04.jpg
28-32785_kodir_p01_1.jpg
`;

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