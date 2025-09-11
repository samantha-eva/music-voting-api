const cron = require('node-cron');
const { fetchCourses } = require('../services/scraping');
const { saveCourses } = require('../services/saveSessions');

const startScrapingCron = () => {
  cron.schedule('45 8 * * *', async () => { // tous les jours à 08:45
    console.log('⏰ Cron job: lancement du scraping à 8h45');

    try {
      const courses = await fetchCourses();
      const today = new Date().toISOString().split('T')[0];
      await saveCourses(courses, today);

      console.log(`✅ ${courses.length} sessions sauvegardées pour le ${today}`);
    } catch (error) {
      console.error('❌ Erreur lors du scraping:', error);
    }
  }, {
    timezone: 'Europe/Paris'
  });
};

module.exports = { startScrapingCron };
