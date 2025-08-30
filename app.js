const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const multer = require("multer");

// ---------------- Multer Setup ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // store in uploads/ folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  },
});
const upload = multer({ storage });
// ------------------------------------------------

// DB Connection
const MONGO_URL = 'mongodb://127.0.0.1:27017/sihprob';
main()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// Express setup
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
app.set("views",path.join(__dirname,"views"));
app.use("/uploads", express.static("uploads")); // serve uploaded images

// Routes
app.listen(port, () => {
  console.log(`🚀 Server is running at port ${port}`);
});

// Home page
app.get("/", async (req, res) => {
  let listofProb = await Listing.find({});
  res.render("home.ejs", { listofProb });
});

// New issue form page
app.get("/issues/new", (req, res) => {
  res.render("newissue.ejs");
});

// Handle form submission (with multer)
app.post("/issues", upload.single("image"), async (req, res) => {
  try {
    const { title, location, status } = req.body;
    let imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    let newIssue = new Listing({
      title,
      location,
      image: imagePath,
      status
    });

    await newIssue.save();
    console.log("✅ New Issue Saved:", newIssue);

    res.redirect("/");  // after saving redirect to home
  } catch (err) {
    console.error("❌ Error saving issue:", err);
    res.status(500).send("Error saving issue");
  }
});
