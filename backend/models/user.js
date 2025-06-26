import { DataTypes } from "sequelize";
import { sequelize } from "./datasource.js";

export const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nickname: {
    type: DataTypes.STRING,
  },
  isSubscribed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});
