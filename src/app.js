// src/app.js
const express = require("express")
const app = express()

// Importer les routes auth
const authRoutes = require("./routes/auth")

app.use(express.json())

// Route racine
app.get("/", (req, res) => {
  res.send("API Music Voting OK !")
})

// Monter les routes sous /api/auth
app.use('/api/auth', authRoutes)

app.listen(3000, () => {
  console.log("API listening on port 3000")
})
