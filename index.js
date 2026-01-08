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

// Store URLs in memory
const urlDatabase = {};
let urlCounter = 1;

// Root page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// POST: create short URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  try {
    const urlObj = new URL(originalUrl);

    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return res.json({ error: "invalid url" });
    }

    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      }

      const short_url = urlCounter++;
      urlDatabase[short_url] = originalUrl;

      res.json({
        original_url: originalUrl,
        short_url: short_url,
      });
    });
  } catch {
    res.json({ error: "invalid url" });
  }
});

// ✅ GET: redirect short URL (MISSING PART)
app.get("/api/shorturl/:short_url", (req, res) => {
  const short_url = req.params.short_url;
  const originalUrl = urlDatabase[short_url];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "No short URL found for given input" });
  }
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
