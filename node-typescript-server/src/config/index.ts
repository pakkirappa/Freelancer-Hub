import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 5001,
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "freelancer_hub",
  },
};

export default config;
