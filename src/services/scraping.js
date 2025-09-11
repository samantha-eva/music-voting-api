require('dotenv').config();
const puppeteer = require('puppeteer');

const SCRAPE_URL = process.env.SCRAPE_URL;

/**
 * Récupère les sessions/cours depuis Hyperplanning
 * @returns {Promise<Array>} Tableau d'objets { salle, matiere, enseignant, publicGroup }
 */
async function fetchCourses() {
  console.log('🌐 Lancement de Puppeteer...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // nécessaire pour Docker
  });
  const page = await browser.newPage();

  console.log(`🔗 Accès à l'URL : ${SCRAPE_URL}`);
  await page.goto(SCRAPE_URL, { waitUntil: 'networkidle0' });

  // Scraping depuis le DOM réel
  const courses = await page.evaluate(() => {
    const rows = document.querySelectorAll(
      '#interfacePanneauInformations_objetPanneauInformation_donnees tr.objetPanneauInfoLigne'
    );
    const result = [];

    rows.forEach(row => {
      const className = row.className;
      if (!className.includes('objetPanneauInfoPage')) return;

      const tds = row.querySelectorAll('td');
      if (tds.length < 5) {
        console.warn('⚠ Ligne ignorée, td manquant :', row.innerText);
        return;
      }

      result.push({
        salle: tds[1].innerText.trim(),
        matiere: tds[2].innerText.trim(),
        enseignant: tds[3].innerText.trim(),
        publicGroup: tds[4].innerText.trim(),
      });
    });

    return result;
  });

  await browser.close();
  console.log(`✅ Scraping terminé, ${courses.length} sessions récupérées`);
  return courses;
}

module.exports = { fetchCourses };