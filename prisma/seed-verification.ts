import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const testData = [
        {
            nationalId: "123456789012",
            name: "Jugal Kishor",
            dob: new Date("2000-01-01"),
            phone: "9876543210",
            address: "123, Street Name, City, Country"
        },
        {
            nationalId: "987654321098",
            name: "Admin User",
            dob: new Date("1985-05-20"),
            phone: "9998887776",
            address: "Admin Office, City Hall"
        }
    ]

    console.log('Seeding verification data...')

    for (const data of testData) {
        await prisma.verificationDataset.upsert({
            where: { nationalId: data.nationalId },
            update: {},
            create: data,
        })
    }

    console.log('Verification data seeded successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
