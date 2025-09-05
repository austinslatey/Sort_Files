const fs = require('fs');

// Your terminal output as a string
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

// Split the output into lines and filter for .jpg files
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
}