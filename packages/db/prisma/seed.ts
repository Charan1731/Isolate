// prisma/seed.ts
import { PrismaClient, Role, Plan } from "../generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Clearing previous seed data...");

  // Delete in proper order to avoid foreign key issues
  await prisma.note.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.tenant.deleteMany({});

  console.log("🗑️ Previous data cleared.");

  // Hash default password
  const defaultPassword = "password";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  console.log("🌱 Seeding new tenants and users...");

  // Create tenants
  const acme = await prisma.tenant.create({
    data: {
      name: "Acme Inc",
      slug: "acme",
      plan: Plan.FREE,
    },
  });

  const globex = await prisma.tenant.create({
    data: {
      name: "Globex Corp",
      slug: "globex",
      plan: Plan.FREE,
    },
  });

  // Users for Acme
  await prisma.user.createMany({
    data: [
      {
        email: "admin@acme.test",
        password: hashedPassword,
        role: Role.ADMIN,
        tenantId: acme.id,
      },
      {
        email: "user@acme.test",
        password: hashedPassword,
        role: Role.MEMBER,
        tenantId: acme.id,
      },
    ],
  });

  // Users for Globex
  await prisma.user.createMany({
    data: [
      {
        email: "admin@globex.test",
        password: hashedPassword,
        role: Role.ADMIN,
        tenantId: globex.id,
      },
      {
        email: "user@globex.test",
        password: hashedPassword,
        role: Role.MEMBER,
        tenantId: globex.id,
      },
    ],
  });

  console.log("✅ Seed data inserted successfully with hashed passwords.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
