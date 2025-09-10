// src/services/scrapingPuppeteer.js
require('dotenv').config();
const puppeteer = require('puppeteer');

const SCRAPE_URL = process.env.SCRAPE_URL;

async function fetchCourses() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(SCRAPE_URL, { waitUntil: 'networkidle0' }); // attend que tout le JS soit exécuté

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
  return courses;
}

module.exports = { fetchCourses };
