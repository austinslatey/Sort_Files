const fs = require('fs');
const { parse } = require('json2csv');

// Read JSON file
const jsonData = JSON.parse(fs.readFileSync('response.json', 'utf8'));

// Extract nodes from JSON
const nodes = jsonData.data.files.edges;

// Prepare data for CSV
const csvData = nodes.map(edge => ({
    id: edge.node.id,
    createdAt: edge.node.createdAt,
    alt: edge.node.alt,
    image_url: edge.node.image.url
}));

// Define CSV options
const fields = ['id', 'createdAt', 'alt', 'image_url'];
const opts = { fields };

// Convert to CSV and write to file
try {
    const csv = parse(csvData, opts);
    fs.writeFileSync('output.csv', csv);
    console.log("CSV file 'output.csv' has been created successfully.");
} catch (err) {
    console.error('Error:', err);
}