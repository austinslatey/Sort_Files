// json-to-csv.js
const fs = require('fs');
const path = require('path');

// === CONFIG ===
const INPUT_FILE = 'exports.json';    // ← your file
const OUTPUT_FILE = 'exports.csv';    // ← will be created

// === READ JSON ===
let rawData;
try {
    rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
} catch (err) {
    console.error(`Could not read ${INPUT_FILE}. Is it in the same folder?`);
    process.exit(1);
}

let data;
try {
    data = JSON.parse(rawData);
} catch (err) {
    console.error('Invalid JSON in exports.json:', err.message);
    process.exit(1);
}

const products = data.products || [];

// === BUILD CSV ===
const headers = [
    "SKU",
    "TITLE",
    "INVENTORY POLICY",
    "INVENTORY QUANTITY"
];

const rows = products.map(product => {
    const variant = product.variants?.[0] || {};
    return [
        variant.sku || "",
        product.title || "",
        variant.inventory_policy || "",
        variant.inventory_quantity ?? ""
    ];
});

// Escape quotes and join
const escape = str => `"${(str + "").replace(/"/g, '""')}"`;
const csvLines = [
    headers.map(escape).join(","),
    ...rows.map(row => row.map(escape).join(","))
];

const csvContent = csvLines.join("\n");

// === WRITE CSV ===
try {
    fs.writeFileSync(OUTPUT_FILE, csvContent, 'utf-8');
    console.log(`SUCCESS!`);
    console.log(`   ${products.length} products exported`);
    console.log(`   → ${path.resolve(OUTPUT_FILE)}`);
} catch (err) {
    console.error('Failed to write CSV:', err.message);
}