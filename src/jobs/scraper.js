const cron = require('node-cron');
const { fetchCourses } = require('../services/scraping');
const { saveCourses } = require('../services/saveSessions');

const startScrapingCron = () => {
  cron.schedule('13 0 * * *', async () => { // tous les jours à 00:05
    console.log('⏰ Cron job: lancement du scraping à minuit 5');

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
