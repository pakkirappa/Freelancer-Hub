import express, { Express, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { connectDB } from "./db";
import sequelize from "./db";
import appLogger from "./utils/Logger";
import { requestLogger, errorHandler } from "./middleware";

const app: Express = express();
const port = config.port || 5002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Connect to the database
connectDB();

app.get("/test-read", async (req: Request, res: Response) => {
  try {
    const [results, metadata] = await sequelize.query("SELECT 1");
    appLogger.info("Read operation successful", { results });
    res.json({ results });
  } catch (error: any) {
    appLogger.error("Read operation failed", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.post("/test-write", async (req: Request, res: Response) => {
  try {
    const [results, metadata] = await sequelize.query(
      "INSERT INTO test_table (name) VALUES ('test')"
    );
    appLogger.info("Write operation successful", { results });
    res.json({ results });
  } catch (error: any) {
    appLogger.error("Write operation failed", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req: Request, res: Response) => {
  appLogger.info("Root endpoint accessed");
  res.send("Hello from TypeScript Server!");
});

// Error handling middleware should be last
app.use(errorHandler);

app.listen(port, () => {
  appLogger.info(`Server is running at http://localhost:${port}`);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  appLogger.error("Uncaught Exception", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  appLogger.error("Unhandled Rejection", { reason, promise });
  process.exit(1);
});
