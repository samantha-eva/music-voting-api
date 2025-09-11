// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding pre-registered users...")

  const preUsers = [
    { firstname: 'Othmane', lastname: 'BELMAJDOUB', email: 'othmane.belmajdoub@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Axel', lastname: 'BLANCHARD', email: 'axel.blanchard@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Benjamin', lastname: 'BONNEVIAL', email: 'benjamin.bonnevial@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Anthony', lastname: 'BROSSE', email: 'anthony.brosse@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Raphaël', lastname: 'DUBOST', email: 'raphael.dubost@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Bastien', lastname: 'FOURNIER', email: 'bastien.fournier@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Esteban', lastname: 'GASPAR', email: 'esteban.gaspar@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Ikram', lastname: 'LAHMOURI', email: 'ikram.lahmouri@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Hugo', lastname: 'MALEZET', email: 'hugo.malezet@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Abdelbasir', lastname: 'MEFIRE NSANGOU', email: 'abdelbasir.mefirensangou@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Said', lastname: 'MOHAMED ABDO', email: 'said.mohamedabdo@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Sana', lastname: 'NAJJAH', email: 'sana.najjah@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Mamadou Khaly', lastname: 'SOW', email: 'mamadoukhaly.sow@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Samantha', lastname: 'THIEBAUT', email: 'samantha.thiebaut@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Marie', lastname: 'TURCO', email: 'marie.turco@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Bastien', lastname: 'USUBELLI', email: 'bastien.usubelli@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Lorenzo', lastname: 'VATRIN', email: 'lorenzo.vatrin@my-digital-school.org', promotion: 'B3' },
    { firstname: 'Adrien', lastname: 'VERWAERDE', email: 'adrien.verwaerde@my-digital-school.org', promotion: 'B3' }
  ]

  await prisma.preRegisteredUser.createMany({
    data: preUsers,
    skipDuplicates: true
  })

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
