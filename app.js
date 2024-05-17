const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const CVE = require("./CVE"); // schema

const app = express();

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://nandine:08042004@cluster0.iggbcwg.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

//EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Set absolute path to views directory
app.get("/cves/list", async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const startIndex = (page - 1) * limit;

    // Sort
    const sortBy = req.query.sortBy || "published_date"; // Default sorting by published_date
    const sortOrder = req.query.sortOrder || "asc"; // Default sorting order ascending

    const cves = await CVE.find()
      .sort({ [sortBy]: sortOrder })
      .skip(startIndex)
      .limit(limit)
      .lean(); 
    const totalRecords = await CVE.countDocuments();
    res.render("index", {
      cves,
      limit,
      totalRecords,
      sortOrder,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      sortBy: sortBy, 
    });
  } catch (error) {
    console.error("Error retrieving CVE data:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/cves/:id", async (req, res) => {
  try {
    const cve = await CVE.findById(req.params.id).lean();
    if (!cve) {
      
      return res.status(404).send("CVE not found");
    }

    res.render("cveDetails", { cve });
  } catch (error) {
    console.error("Error retrieving CVE details:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
