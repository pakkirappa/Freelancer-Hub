import express, { Express, Request, Response } from "express";
import cors from "cors";
// import { setRoutes } from "./routes";
import config from "./config";
import { connectDB } from "./db";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connect to the database
connectDB();

// Set up routes
// setRoutes();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from TypeScript Server!");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
