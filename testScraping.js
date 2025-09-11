// testScraping.js
require('dotenv').config();
const { fetchCourses } = require('./src/services/scraping');
const { saveCourses } = require('./src/services/saveSessions');

async function main() {
  try {
    console.log('🚀 Lancement du scraping...');

    // 1️⃣ Récupérer les sessions depuis Hyperplanning
    const courses = await fetchCourses();
    console.log(`✅ Nombre de sessions récupérées : ${courses.length}`);
    console.table(courses);

    // 2️⃣ Déterminer la date du jour (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // 3️⃣ Sauvegarder dans la base de données
    await saveCourses(courses, today);

    console.log('💾 Sauvegarde terminée !');
  } catch (error) {
    console.error('❌ Erreur lors du test de scraping :', error);
  } finally {
    process.exit(0);
  }
}

main();
