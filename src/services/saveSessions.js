const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Sauvegarde les sessions dans la base de données
 * Supprime toutes les sessions dont la date est différente de "date"
 * et insère uniquement les nouvelles pour cette date
 * @param {Array} courses - tableau d'objets { salle, matiere, enseignant, publicGroup }
 * @param {string} date - date au format YYYY-MM-DD
 */
async function saveCourses(courses, date) {
  // Étape 1 : supprimer toutes les sessions qui ne sont pas à la date scrappée
  const deleted = await prisma.session.deleteMany({
    where: {
      NOT: { date }
    }
  });
  if (deleted.count > 0) {
    console.log(`🗑️ ${deleted.count} sessions d'anciennes dates supprimées`);
  }

  // Étape 2 : supprimer les sessions déjà présentes pour la date scrappée
  const deletedToday = await prisma.session.deleteMany({
    where: { date }
  });
  if (deletedToday.count > 0) {
    console.log(`🗑️ ${deletedToday.count} sessions existantes pour ${date} supprimées`);
  }

  // Étape 3 : insérer les nouvelles sessions
  if (courses.length > 0) {
    await prisma.session.createMany({
      data: courses.map(course => ({
        subject: course.matiere,
        teacher: course.enseignant,
        promotion: course.publicGroup,
        classroom: course.salle,
        date: date,
        startTime: '00:00',
        endTime: '00:00',
      }))
    });
    console.log(`✅ ${courses.length} nouvelles sessions insérées pour ${date}`);
  } else {
    console.log(`⚠️ Aucun cours à insérer pour ${date}`);
  }
}

module.exports = { saveCourses };
