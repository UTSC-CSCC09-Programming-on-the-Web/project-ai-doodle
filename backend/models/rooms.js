import { DataTypes } from "sequelize";
import { sequelize } from "./datasource.js";

export const Room = sequelize.define(
  "Room",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passcode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creatorUsername: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    allowSynonyms: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
  },
);
