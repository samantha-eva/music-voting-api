require('./jobs/scraper');
require('dotenv').config();

// src/app.js
const express = require("express")
const app = express()

// Importer les routes 
const authRoutes = require("./routes/auth")
const sessionRoutes = require("./routes/sessions")


app.use(express.json())

// Route racine
app.get("/", (req, res) => {
  res.send("API Music Voting OK !")
})

// Monter les routes sous /api/auth
app.use('/api/auth', authRoutes)
app.use("/api/sessions", sessionRoutes);

app.listen(3000, () => {
  console.log("API listening on port 3000")
})
