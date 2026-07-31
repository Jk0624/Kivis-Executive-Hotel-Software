import { prisma } from "../prisma.js";

async function main() {
  const tokenToRemove = "ExponentPushToken[lII2OKIsbiC5t1n3yziA_j]";
  
  console.log(`Attempting to remove token: ${tokenToRemove}`);
  
  const result = await prisma.deviceToken.deleteMany({
    where: {
      pushToken: tokenToRemove,
    },
  });
  
  if (result.count > 0) {
    console.log(`✅ Success: Removed ${result.count} stale token(s).`);
  } else {
    console.log(`ℹ️  No tokens found with that value. It might have already been removed.`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error removing token:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
