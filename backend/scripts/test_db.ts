import prisma from "../src/config/prisma.js";

async function main() {
  try {
    const users = await prisma.user.findMany({
      take: 1
    });
    console.log("Success: 'users' table is accessible. Found " + users.length + " users.");
  } catch (error) {
    console.error("Failure: Could not access 'users' table.");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
