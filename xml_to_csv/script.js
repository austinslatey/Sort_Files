const fs = require("fs");
const { DOMParser } = require("@xmldom/xmldom");

// Read PIES XML file
let xmlString;
try {
  xmlString = fs.readFileSync("./customList.xml", "utf8"); // CHANGE THIS TO YOUR FILE
} catch (error) {
  console.error("Error reading XML file:", error.message);
  process.exit(1);
}

function piesToImageCsv(xmlString) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Check for parsing errors
    const errors = xmlDoc.getElementsByTagName("parsererror");
    if (errors.length > 0) {
      console.error("XML Parse Error:", errors[0].textContent);
      throw new Error("Invalid XML");
    }

    const items = xmlDoc.getElementsByTagName("Item");
    if (items.length === 0) {
      console.warn("No <Item> elements found in PIES XML");
      return "";
    }

    // CSV Headers
    const headers = ["part_number", "image_url", "asset_type", "filename"];
    const csvRows = [headers.join(",")];

    let imageCount = 0;

    // Loop through each <Item>
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const partNumber = getText(item, "PartNumber") || "UNKNOWN_PART";

      // Find all DigitalFileInformation inside this Item
      const assets = item.getElementsByTagName("DigitalFileInformation");
      for (let j = 0; j < assets.length; j++) {
        const asset = assets[j];
        const assetType = getText(asset, "AssetType");
        const uri = getText(asset, "URI");
        const fileName = getText(asset, "FileName");

        // Only include image types (P01, P02, P04, etc.)
        if (uri && /^P\d{2}$/.test(assetType)) {
          const cleanFilename = fileName ? fileName.split("/").pop().split("?")[0] : uri.split("/").pop().split("?")[0];
          const row = [
            `"${partNumber}"`,
            `"${uri}"`,
            `"${assetType}"`,
            `"${cleanFilename}"`,
          ];
          csvRows.push(row.join(","));
          imageCount++;
        }
      }
    }

    console.log(`Found ${imageCount} product images (AssetType Pxx)`);
    return csvRows.join("\n");
  } catch (error) {
    console.error("Error processing PIES XML:", error.message);
    return "";
  }
}

// Helper: Get text from first child tag
function getText(parent, tagName) {
  const elements = parent.getElementsByTagName(tagName);
  return elements.length > 0 ? (elements[0].textContent || "").trim() : "";
}

// Run conversion
const csv = piesToImageCsv(xmlString);
if (csv) {
  const preview = csv.split("\n").slice(0, 6).join("\n");
  console.log("CSV Preview:\n", preview);
  console.log(`\n... (${csv.split("\n").length - 1} total images)`);

  // Write to file
  try {
    fs.writeFileSync("bds_images.csv", csv, "utf8");
    console.log("\nSUCCESS: bds_images.csv created!");
    console.log("Next: Use wget/curl or JDownloader to batch download from image_url column");
  } catch (error) {
    console.error("Error writing CSV:", error.message);
  }
} else {
  console.log("No images found or error occurred");
}