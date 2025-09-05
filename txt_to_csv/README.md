# CSV Converter Script

This Node.js script converts a text file with alternating lines of item names/numbers and descriptions into a CSV file.

## Functionality
- **Input**: Reads a text file (`input.txt`) where each pair of lines represents an item:
  - First line: Item name or number.
  - Second line: Item description.
- **Processing**: Parses the input, pairing each item name/number with its description.
- **Output**: Generates a CSV file (`output.csv`) with two columns: `Item` and `Description`.
- **CSV Compatibility**: Escapes commas and quotes in descriptions to ensure proper CSV formatting.

## Usage
1. Ensure Node.js is installed.
2. Place your input data in a file named `input.txt` in the same directory as the script.
3. Run the script using:
   ```bash
   node convertToCsv.js
   ```
4. The script will create `output.csv` in the same directory.

## Example Input (`input.txt`)
```
300110
Waldoch Goldstone Colored Interior Vinyl
304502LAM
Waldoch Goldstone Colored Textured Wall Vinyl
```

## Example Output (`output.csv`)
```csv
Item,Description
300110,"Waldoch Goldstone Colored Interior Vinyl"
304502LAM,"Waldoch Goldstone Colored Textured Wall Vinyl"
```

## Requirements
- Node.js
- Input file (`input.txt`) with alternating item names/numbers and descriptions.