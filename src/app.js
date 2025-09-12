require('./jobs/scraper');
require('dotenv').config();

// src/app.js
const express = require("express")
const app = express()

// Importer les routes 
const authRoutes = require("./routes/auth")
const sessionRoutes = require("./routes/sessions")
const tracksRoutes = require("./routes/tracks")
const { startScrapingCron } = require('./jobs/scraper');
const votesRoutes = require("./routes/votes");
// Démarrer le cron
startScrapingCron();

app.use(express.json())

// Route racine
app.get("/", (req, res) => {
  res.send("API Music Voting OK !")
})

// Monter les routes sous /api/auth
app.use('/api/auth', authRoutes)
app.use("/api/sessions", sessionRoutes)
app.use('/api/tracks', tracksRoutes)
app.use("/api/votes", votesRoutes)

app.listen(3000, () => {
  console.log("API listening on port 3000")
})
