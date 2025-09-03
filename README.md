# Sort_Files
This project processes terminal output from `ls` commands to organize file names, particularly for large sets of unorganized files. The `combined.js` script extracts `.jpg` file names from terminal output, saves them to `files.txt` (one file per line), and then generates a CSV (`files_by_prefix_row.csv`) where each row corresponds to a file prefix (e.g., `51-10005`), with associated files listed horizontally across columns for easy import into Excel.

## How to run
1. Ensure you have Node.js installed.
2. Place `combined.js` in the directory containing your terminal output or files (e.g., `~/Your/File/Path`).
3. Update the `terminalOutput` variable in `combined.js` with your terminal output, or modify the script to read from a file (e.g., `terminal_output.txt`).
4. Run the command:
   ```bash
   node combined.js
   ```
5. Check the output:
   - `files.txt`: Contains all `.jpg` file names, one per line.
   - `files_by_prefix_row.csv`: Contains files grouped by prefix, with each prefix in a row and files in columns, suitable for Excel import.

## Output Example
For terminal output like:
```bash
$ ls 10005
51-10005_ko3qtrps_p01_2.jpg  51-10005_kodir_p04.jpg  51-10005_p03_1.jpg
$ ls 10015
51-10015_ko3qtrps_p01_2.jpg  51-10015_kodir_p04.jpg  51-10015_p03_1.jpg
```
- `files.txt` will contain:
  ```
  51-10005_ko3qtrps_p01_2.jpg
  51-10005_kodir_p04.jpg
  51-10005_p03_1.jpg
  51-10015_ko3qtrps_p01_2.jpg
  51-10015_kodir_p04.jpg
  51-10015_p03_1.jpg
  ```
- `files_by_prefix_row.csv` will contain:
  ```
  "51-10005_ko3qtrps_p01_2.jpg","51-10005_kodir_p04.jpg","51-10005_p03_1.jpg"
  "51-10015_ko3qtrps_p01_2.jpg","51-10015_kodir_p04.jpg","51-10015_p03_1.jpg"
  ```
  When opened in Excel, each row represents a prefix with files in columns.

## Notes
- Ensure `files.txt` is writable in the script’s directory.
- If Excel uses a different delimiter (e.g., semicolon), modify `row.join(',')` to `row.join(';')` in `combined.js`.
- To process different file extensions, adjust the `.filter(line => line.includes('.jpg'))` line in the script.