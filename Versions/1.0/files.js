// Import the Node.js file system module
const fs = require('fs');

// Your list as a single string (copy-paste your list directly)
const fileList = `
file3.txt file2.js file1.jsx
`;

// Split the string into an array, removing extra whitespace and empty entries
const files = fileList.trim().split(/\s+/).filter(file => file);

// Sort the array
const sortedFiles = files.sort();

// Write the sorted list to output.txt
try {
  fs.writeFileSync('output.txt', sortedFiles.map(file => `${file}`).join('\n'), 'utf8');
  console.log('Sorted list has been written to output.txt');
} catch (err) {
  console.error('Error writing to file:', err);
}