import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import errorMiddleware from "./middleware/error.middleware.js";
import router from "./routes/auth.routes.js";
import managerRoutes from "./routes/manager.routes.js";
import testRouter from "./routes/test.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import variantsRoutes from "./routes/variants.routes.js";
import { startCronJobs } from "./lib/cron.js";

const app = express();

startCronJobs();

app.use(
  cors({
    origin: "*",
  }),
);
app.get("/healthxyz", (req, res) => {
  return res.status(200).json({ message: "Running", time: new Date() });
});
app.use(express.json());
app.use(router);
app.use(managerRoutes);
app.use(testRouter);
app.use(adminRoutes);
app.use(notesRoutes);
app.use(tasksRoutes);
app.use(variantsRoutes);
app.use(morgan("combined"));
app.use(helmet());
app.use(errorMiddleware);

export default app;
