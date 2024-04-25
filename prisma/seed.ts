import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding...")
  
  // const adminUser= await seedAdmin(prisma)
  // console.log({ adminUser })
  
  //await seedModels(prisma)

  console.log("Seeding complete")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
