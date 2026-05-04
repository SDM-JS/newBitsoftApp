import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("Starting seeding...");

  // 1. Create Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.admin.upsert({
    where: { id: "admin-id" },
    update: {},
    create: {
      id: "admin-id",
      email: "admin@bitsoft.com",
      password: adminPassword,
    },
  });
  console.log("Admin created:", admin.email);

  // 2. Create Group
  const group = await prisma.group.create({
    data: {
      name: "Standard Group",
    },
  });
  console.log("Group created:", group.name);

  // 3. Create Students
  const studentPassword = await bcrypt.hash("student123", 10);
  const student1 = await prisma.student.create({
    data: {
      fullName: "John Doe",
      email: "john@student.com",
      username: "johndoe",
      password: studentPassword,
      parentNumber: "+1234567890",
      groupId: group.id,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      fullName: "Jane Smith",
      email: "jane@student.com",
      username: "janesmith",
      password: studentPassword,
      parentNumber: "+0987654321",
      groupId: group.id,
    },
  });
  console.log("Students created:", student1.fullName, student2.fullName);

  // 4. Create Today's Test
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const testToday = await prisma.test.create({
    data: {
      title: "General Knowledge - Day 1",
      scheduledDate: today,
      allPoints: 20,
      questions: {
        create: [
          {
            text: "What is 5 + 5?",
            points: 10,
            options: ["8", "9", "10", "11"],
            answer: "10",
          },
          {
            text: "What is the capital of France?",
            points: 10,
            options: ["London", "Berlin", "Paris", "Madrid"],
            answer: "Paris",
          },
        ],
      },
    },
  });
  console.log("Today's test created:", testToday.title);

  // 5. Create Tomorrow's Test
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const testTomorrow = await prisma.test.create({
    data: {
      title: "Science Quiz - Day 2",
      scheduledDate: tomorrow,
      allPoints: 15,
      questions: {
        create: [
          {
            text: "Does the sun rise in the East?",
            points: 15,
            options: ["Yes", "No"],
            answer: "Yes",
          },
        ],
      },
    },
  });
  console.log("Tomorrow's test created:", testTomorrow.title);

  console.log("Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
