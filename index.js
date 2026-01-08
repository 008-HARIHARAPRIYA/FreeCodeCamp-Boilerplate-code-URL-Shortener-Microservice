const express = require("express");
const cors = require("cors");
const dns = require("dns");
const bodyParser = require("body-parser");
const { URL } = require("url");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

// Store URLs in memory (short_url -> original_url)
const urlDatabase = {};
let urlCounter = 1;

// Root page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// POST new URL
app.post("/api/shorturl", (req, res) => {
  let originalUrl = req.body.url;

  try {
    // Validate URL format
    const urlObj = new URL(originalUrl);

    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return res.json({ error: "invalid url" });
    }

    // DNS lookup to validate hostname
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      } else {
        // Save URL and return JSON
        const short_url = urlCounter++;
        urlDatabase[short_url] = originalUrl;

        return res.json({
          original_url: originalUrl,
          short_url: short_url,
        });
      }
    });
  } catch (err) {
    // Invalid URL format
    return res.json({ error: "invalid url" });
  }
});

// Redirect short URL
app.get("/api/shorturl/:short_url", (req, res) => {
  const short_url = parseInt(req.params.short_url); // FIX: Convert to number
  const originalUrl = urlDatabase[short_url];

  if (originalUrl) {
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: "No short URL found for given input" });
  }
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
