const axios = require("axios");
const mongoose = require("mongoose");
const CVE = require("./CVE"); // Mongoose model

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://nandine:08042004@cluster0.iggbcwg.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Function to fetch and store CVEs
async function fetchAndStoreCVEs(offset, resultsPerPage) {
  try {
    const response = await axios.get(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?startIndex=${offset}&resultsPerPage=${resultsPerPage}`
    );
    // 0 to 2000
    const data = response.data;
    const vulnerabilities = data.vulnerabilities || [];

    for (const vulnerability of vulnerabilities) {
      const cveData = vulnerability.cve;
      if (!cveData) {
        console.error(
          'Missing "cve" property in vulnerability object:',
          vulnerability
        );
        continue;
      }

      const cve = new CVE({
        cve_id: cveData.id,
        sourceIdentifier: cveData.sourceIdentifier,
        published: new Date(cveData.published),
        lastModified: new Date(cveData.lastModified),
        vulnStatus: cveData.vulnStatus,
        descriptions: cveData.descriptions,
        metrics: cveData.metrics,
        weaknesses: cveData.weaknesses,
        configurations: cveData.configurations,
        references: cveData.references,
      });

      await cve.save();
    }

    console.log(`Stored ${vulnerabilities.length} CVEs.`);
// Stored 2000 CVEs - 240988
    return vulnerabilities.length; // Return the number of CVEs stored
  } catch (error) {
    console.error("Error fetching and storing CVEs:", error);
    return 0;
  }
}

// Main function to fetch CVEs
async function main() {
  const resultsPerPage = 2000; // Adjust as needed
  let offset = 0;
  let totalStored = 0;

  console.log("Fetching and storing CVEs...");

  while (true) {
    const storedCount = await fetchAndStoreCVEs(offset, resultsPerPage);
    // 0 to 2000
    totalStored += storedCount;

    // 2000 , 4000, 6000 , -- update

    if (storedCount < resultsPerPage) {
      // If fewer than `resultsPerPage` CVEs were stored, we've reached the end
      break;
    }
    offset += resultsPerPage;
  }

  console.log(`Total CVEs stored: ${totalStored}`);
  mongoose.connection.close();
}

main();
