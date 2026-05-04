import cron from "node-cron";
import { prisma } from "./prisma.js";

/**
 * Runs every hour.
 * Deactivates daily quizzes that were created more than 24 hours ago.
 */
export function startCronJobs() {
  cron.schedule("0 * * * *", async () => {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const { count } = await prisma.quizSchema.updateMany({
        where: {
          isDaily: true,
          isActive: true,
          createdAt: { lt: cutoff },
        },
        data: { isActive: false },
      });

      if (count > 0) {
        console.log(`[CRON] Deactivated ${count} expired daily quiz(zes).`);
      }
    } catch (error) {
      console.error("[CRON] Failed to deactivate expired quizzes:", error);
    }
  });

  console.log("[CRON] Scheduled: daily quiz expiry (every hour)");
}
