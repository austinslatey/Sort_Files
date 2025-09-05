const fs = require('fs');

// Input data (you can replace this with reading from a file)
const inputData = fs.readFileSync('input.txt', 'utf8');

// Function to convert the input to CSV
function convertToCsv(data) {
  const lines = data.trim().split('\n');
  let csvContent = 'Item,Description\n'; // CSV header

  for (let i = 0; i < lines.length; i += 2) {
    const item = lines[i].trim();
    const description = lines[i + 1] ? lines[i + 1].trim() : '';
    // Escape commas and quotes in the description for CSV compatibility
    const escapedDescription = `"${description.replace(/"/g, '""')}"`;
    csvContent += `${item},${escapedDescription}\n`;
  }

  return csvContent;
}

// Generate CSV content
const csvOutput = convertToCsv(inputData);

// Write to a CSV file
fs.writeFileSync('output.csv', csvOutput, 'utf8');
console.log('CSV file has been created as output.csv');