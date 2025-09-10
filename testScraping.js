// testScraping.js
const { fetchCourses } = require('./src/services/scraping');

async function test() {
  const courses = await fetchCourses();
  console.log('Nombre de cours récupérés :', courses.length);
  console.log(courses);
}

test();
