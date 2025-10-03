const fs = require("fs");
const { DOMParser } = require("@xmldom/xmldom");

// Read XML file as a string
let xmlString;
try {
  xmlString = fs.readFileSync("./customList.xml", "utf8");
  // console.log("XML Content (first 200 chars):\n", xmlString.substring(0, 200)); // Uncomment for debug
} catch (error) {
  console.error("Error reading XML file:", error.message);
  process.exit(1);
}

function xmlToCsv(xmlString) {
  try {
    // Parse XML string to DOM
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Check for parsing errors
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
      console.error("Parser Errors:", xmlDoc.getElementsByTagName("parsererror")[0].textContent);
      throw new Error("Invalid XML format");
    }

    // Get all customvalue elements
    const customValues = xmlDoc.getElementsByTagName("customvalue");
    // console.log("customValues NodeList Length:", customValues.length); // Uncomment for debug
    if (customValues.length === 0) {
      console.warn("No customvalue elements found in XML");
      return "";
    }

    // Define headers for customvalue fields
    const headers = ["scriptid", "abbreviation", "isinactive", "value"];
    const csvRows = [headers.join(",")];

    // Extract data for each customvalue (index-based loop to avoid iterability issues)
    for (let i = 0; i < customValues.length; i++) {
      const customValue = customValues[i];
      // console.log("Processing customValue scriptid:", customValue.getAttribute("scriptid")); // Uncomment for debug
      const row = [
        `"${customValue.getAttribute("scriptid") || ""}"`,
        `"${getElementText(customValue, "abbreviation").replace(/"/g, '""')}"`,
        `"${getElementText(customValue, "isinactive").replace(/"/g, '""')}"`,
        `"${getElementText(customValue, "value").replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(","));
    }

    // Helper function to get text content of a child element
    function getElementText(parent, tagName) {
      const element = parent.getElementsByTagName(tagName)[0];
      return element ? (element.textContent || "").trim() : ""; // Trim whitespace for safety
    }

    return csvRows.join("\n");
  } catch (error) {
    console.error("Error processing XML:", error.message);
    return "";
  }
}

// Convert XML to CSV
const csv = xmlToCsv(xmlString);
if (csv) {
  console.log("CSV Output (first 5 rows):\n", csv.split("\n").slice(0, 6).join("\n")); // Show preview
  console.log(`\n... (Total rows: ${csv.split("\n").length})`);
  // Write CSV to file
  try {
    fs.writeFileSync("paint_codes.csv", csv, "utf8");
    console.log("\nCSV written to paint_codes.csv");
  } catch (error) {
    console.error("Error writing CSV file:", error.message);
  }
} else {
  console.log("No CSV output generated");
}