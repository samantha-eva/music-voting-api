const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Ajouter des utilisateurs
  await prisma.user.createMany({
    data: [
      { email: "alice@example.com", firstname: "Alice", lastname: "Dupont", promotion: "L3" },
      { email: "bob@example.com", firstname: "Bob", lastname: "Martin", promotion: "L3" },
    ],
  });

  // Ajouter des sessions
  await prisma.session.createMany({
    data: [
      {
        subject: "Mathématiques",
        teacher: "M. Leblanc",
        promotion: "L3",
        classroom: "101",
        date: "2025-09-10",
        startTime: "09:00",
        endTime: "10:30",
      },
      {
        subject: "Physique",
        teacher: "Mme Durand",
        promotion: "L3",
        classroom: "102",
        date: "2025-09-10",
        startTime: "10:45",
        endTime: "12:15",
      },
    ],
  });

  console.log("Seed terminé !");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
