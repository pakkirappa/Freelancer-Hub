import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 5002,
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "freelancer_hub",
    readHost1: process.env.DB_READ_HOST1 || "localhost",
    readPort1: process.env.DB_READ_PORT1 || 3307,
    readUser1: process.env.DB_READ_USER1 || "root",
    readPassword1: process.env.DB_READ_PASSWORD1 || "root",
    readHost2: process.env.DB_READ_HOST2 || "localhost",
    readPort2: process.env.DB_READ_PORT2 || 3307,
    readUser2: process.env.DB_READ_USER2 || "root",
    readPassword2: process.env.DB_READ_PASSWORD2 || "root",
  },
};

export default config;
