require("dotenv").config();
require("./jobs/scraper");

const express = require("express");
const path = require("path");
const { startScrapingCron } = require("./jobs/scraper");
const cors = require("cors");
const app = express();

app.use(cors());
// Middlewares
app.use(express.json());

// Servir les fichiers statiques depuis ton dossier Frontend
app.use(express.static(path.join(__dirname, "../Frontend")));

// Importer les routes API
const authRoutes = require("./routes/auth");
const sessionRoutes = require("./routes/sessions");
const tracksRoutes = require("./routes/tracks");

// Monter les routes API
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/tracks", tracksRoutes);

// Route racine → index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

// Démarrer le cron
startScrapingCron();

// Lancer le serveur
app.listen(3000, () => {
  console.log("API listening on port 3000");
});
