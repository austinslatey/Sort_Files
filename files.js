// Your list as a single string (copy-paste your list directly)
const fileList = `
file3.txt file2.js file1.jsx
`;

// Split the string into an array, removing extra whitespace and empty entries
const files = fileList.trim().split(/\s+/).filter(file => file);

// Sort the array
const sortedFiles = files.sort();

// Output the sorted list
console.log(sortedFiles.join('\n'));