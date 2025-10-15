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

// Importer les routes API
const authRoutes = require("./routes/auth");
const sessionRoutes = require("./routes/sessions");
const tracksRoutes = require("./routes/tracks");
const votesRoutes = require("./routes/votes");

// Monter les routes API EN PREMIER
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/tracks", tracksRoutes);
app.use("/api/votes", votesRoutes);

// Servir les fichiers statiques APRÈS les routes API
app.use(express.static(path.join(__dirname, "../Frontend")));

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