import { Sequelize } from "sequelize";
import config from "./config";
import appLogger from "./utils/Logger";

const sequelize = new Sequelize({
  database: config.db.database,
  username: config.db.user,
  password: config.db.password,
  dialect: "mysql",
  replication: {
    write: {
      host: config.db.host,
      port: config.db.port,
      username: config.db.user,
      password: config.db.password,
    },
    read: [
      {
        host: config.db.readHost1,
        port: config.db.readPort1,
        username: config.db.readUser1,
        password: config.db.readPassword1,
      },
      {
        host: config.db.readHost2,
        port: config.db.readPort2,
        username: config.db.readUser2,
        password: config.db.readPassword2,
      },
      // Add more read replicas as needed
    ],
  },
  pool: {
    max: 10,
    idle: 30000,
    acquire: 60000,
  },
  logging: (msg) => appLogger.debug(msg),
});

// connect to the database
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    appLogger.info(
      "Connection to the database has been established successfully."
    );
  } catch (error) {
    appLogger.error("Unable to connect to the database:", error);
  }
};

export default sequelize;
