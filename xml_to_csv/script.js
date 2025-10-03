const fs = require("fs");
const { DOMParser } = require("@xmldom/xmldom");

// Read XML file as a string
let xmlString;
try {
  xmlString = fs.readFileSync("./customList.xml", "utf8");
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
      throw new Error("Invalid XML format");
    }

    // Get all customvalue elements
    const customValues = xmlDoc.getElementsByTagName("customvalue");
    if (customValues.length === 0) {
      console.warn("No customvalue elements found in XML");
      return "";
    }

    // Define headers for customvalue fields
    const headers = ["scriptid", "abbreviation", "isinactive", "value"];
    const csvRows = [headers.join(",")];

    // Extract data for each customvalue
    for (const customValue of customValues) {
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
      return element ? element.textContent || "" : "";
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
  console.log("CSV Output:\n", csv);
  // Write CSV to file
  try {
    fs.writeFileSync("paint_codes.csv", csv, "utf8");
    console.log("CSV written to paint_codes.csv");
  } catch (error) {
    console.error("Error writing CSV file:", error.message);
  }
} else {
  console.log("No CSV output generated");
}