import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
  },
);

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected.");
  } catch (error) {
    console.error("Unable to connect to DB:", error);
  }
};
