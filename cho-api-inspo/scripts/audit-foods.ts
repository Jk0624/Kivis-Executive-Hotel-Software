import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env BEFORE importing prisma
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

// Now import prisma (after env is loaded)
const { prisma } = await import("../src/prisma.js");

interface BrokenFood {
  id: bigint;
  name: string;
  requiredAddonTags: string[];
  linkedTags: string[];
  orphanedTags: string[];
}

async function auditAndFixFoods() {
  console.log("🔍 Auditing foods for broken requiredAddonTags...\n");

  // Get all foods with requiredAddonTags that are not empty
  const foods = await prisma.food.findMany({
    where: {
      requiredAddonTags: { isEmpty: false }
    },
    include: {
      addons: {
        include: { addon: true }
      }
    }
  });

  console.log(`Found ${foods.length} foods with requiredAddonTags\n`);

  const brokenFoods: BrokenFood[] = [];

  for (const food of foods) {
    // Get tags from linked addons
    const linkedTags = new Set(food.addons.map(fa => fa.addon.tag));

    // Find required tags that don't have matching addons
    const orphanedTags = food.requiredAddonTags.filter(tag => !linkedTags.has(tag));

    if (orphanedTags.length > 0) {
      brokenFoods.push({
        id: food.id,
        name: food.name,
        requiredAddonTags: food.requiredAddonTags,
        linkedTags: [...linkedTags],
        orphanedTags
      });
    }
  }

  if (brokenFoods.length === 0) {
    console.log("✅ No broken foods found! All requiredAddonTags have matching addons.");
    return;
  }

  console.log(`⚠️  Found ${brokenFoods.length} broken foods:\n`);
  console.log("=" .repeat(60));

  for (const food of brokenFoods) {
    console.log(`\nFood: "${food.name}" (ID: ${food.id})`);
    console.log(`  Required tags: [${food.requiredAddonTags.join(", ")}]`);
    console.log(`  Linked tags:   [${food.linkedTags.join(", ")}]`);
    console.log(`  ❌ Orphaned:    [${food.orphanedTags.join(", ")}]`);
  }

  console.log("\n" + "=" .repeat(60));
  console.log("\n🔧 Fixing broken foods (removing orphaned tags)...\n");

  for (const food of brokenFoods) {
    const validTags = food.requiredAddonTags.filter(tag => !food.orphanedTags.includes(tag));

    await prisma.food.update({
      where: { id: food.id },
      data: { requiredAddonTags: validTags }
    });

    console.log(`✓ Fixed "${food.name}":`);
    console.log(`   Before: [${food.requiredAddonTags.join(", ")}]`);
    console.log(`   After:  [${validTags.join(", ")}]\n`);
  }

  console.log("=" .repeat(60));
  console.log(`\n✅ Fixed ${brokenFoods.length} broken foods!`);
}

// Run the audit
auditAndFixFoods()
  .catch((error) => {
    console.error("❌ Error during audit:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
