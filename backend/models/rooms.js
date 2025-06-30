import { DataTypes } from "sequelize";
import { sequelize } from "./datasource.js";

export const Room = sequelize.define("Room", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passcode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
  },
  creatorUsername: {
  type: DataTypes.STRING,
  allowNull: false,
  },
}, {
  timestamps: true
});
