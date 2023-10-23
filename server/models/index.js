import * as dotenv from "dotenv";
dotenv.config();
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
const db = {
  sequelize,
  Sequelize,
};

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully asasasas.");
  } catch (error) {
    console.log(process.env.DB_HOST);
    console.error("Unable to connect to the database:", error);
  }
})();

export default db;