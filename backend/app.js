import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { testConnection, sequelize } from "./models/datasource.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend is running" });
});

const init = async () => {
  await testConnection();
  await sequelize.sync({ alter: true });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

init();
