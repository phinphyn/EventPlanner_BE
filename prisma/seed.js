import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function deleteAllData() {
  console.log("Deleting all seeded data...");
  
  await prisma.variation.deleteMany();
  console.log("Deleted variations");
  
  await prisma.service.deleteMany();
  console.log("Deleted services");
  
  await prisma.serviceType.deleteMany();
  console.log("Deleted service types");
  
  console.log("All seeded data deleted successfully!");
}

async function main() {
  console.log("Starting to seed variations...");

  // Define variations based on your service IDs
  const variationsData = [
    // Service ID 1: Tiếc cưới đơn giản
    { variation_name: "Tiệc cưới cơ bản (50-100 khách)", base_price: 15000000, service_id: 1 },
    { variation_name: "Tiệc cưới cao cấp (100-200 khách)", base_price: 25000000, service_id: 1 },
    { variation_name: "Tiệc cưới VIP (200+ khách)", base_price: 40000000, service_id: 1 },

    // Service ID 2: Dịch vụ MC tiếc cưới
    { variation_name: "MC bán chuyên", base_price: 1000000, service_id: 2 },
    { variation_name: "MC chuyên nghiệp", base_price: 2500000, service_id: 2 },
    { variation_name: "MC nổi tiếng", base_price: 5000000, service_id: 2 },

    // Service ID 6: Trang trí sự kiện
    { variation_name: "Trang trí cơ bản", base_price: 2000000, service_id: 6 },
    { variation_name: "Trang trí cao cấp với backdrop", base_price: 5000000, service_id: 6 },
    { variation_name: "Trang trí VIP concept độc đáo", base_price: 10000000, service_id: 6 },

    // Service ID 7: Âm thanh ánh sáng
    { variation_name: "Hệ thống âm thanh cơ bản", base_price: 1500000, service_id: 7 },
    { variation_name: "Âm thanh chuyên nghiệp", base_price: 3500000, service_id: 7 },
    { variation_name: "Hệ thống ánh sáng sân khấu", base_price: 4000000, service_id: 7 },
    { variation_name: "Combo âm thanh + ánh sáng LED", base_price: 6000000, service_id: 7 },

    // Service ID 8: Dịch vụ ăn uống
    { variation_name: "Buffet cơ bản", base_price: 200000, service_id: 8 },
    { variation_name: "Buffet cao cấp", base_price: 400000, service_id: 8 },
    { variation_name: "Set menu VIP", base_price: 800000, service_id: 8 },
    { variation_name: "Tiệc cocktail", base_price: 300000, service_id: 8 },
  ];

  // Create variations
  let createdCount = 0;
  for (const variationData of variationsData) {
    try {
      // Check if variation already exists to avoid duplicates
      const existingVariation = await prisma.variation.findFirst({
        where: {
          variation_name: variationData.variation_name,
          service_id: variationData.service_id
        }
      });

      if (existingVariation) {
        console.log(`⚠ Variation already exists: ${variationData.variation_name}`);
        continue;
      }

      const variation = await prisma.variation.create({
        data: {
          variation_name: variationData.variation_name,
          base_price: variationData.base_price,
          service_id: variationData.service_id
        }
      });
      
      createdCount++;
      console.log(`✓ Created variation: ${variation.variation_name} (ID: ${variation.variation_id}) for service_id: ${variationData.service_id}`);
    } catch (error) {
      console.error(`✗ Failed to create variation: ${variationData.variation_name}`, error.message);
    }
  }

  console.log(`\n🎉 Successfully created ${createdCount} variations!`);
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--delete')) {
  deleteAllData()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} else {
  main()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}