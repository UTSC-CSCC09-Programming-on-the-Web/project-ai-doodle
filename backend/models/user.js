import { DataTypes } from "sequelize";
import { sequelize } from "./datasource.js";

// more fields need to be added later
export const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nickname: {
    type: DataTypes.STRING,
  },
});
