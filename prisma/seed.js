const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding pre-registered users...")

  const preUsers = [
    { email: 'alice@school.test', firstname: 'Alice', lastname: 'Dupont', promotion: 'B3' },
    { email: 'bob@school.test', firstname: 'Bob', lastname: 'Martin', promotion: 'B2' },
    { email: 'charlie@school.test', firstname: 'Charlie', lastname: 'Durand', promotion: 'B3' }
  ]

  for (const u of preUsers) {
    await prisma.preRegisteredUser.upsert({
      where: { email: u.email },
      update: {},
      create: u
    })
  }

  console.log("✅ Utilisateurs pré-enregistrés insérés avec succès !")
}

main()
  .catch(e => {
    console.error("❌ Erreur lors du seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
