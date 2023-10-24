import Sequelize from 'sequelize';
import db from './index.js'; // Import the database connection

const { DataTypes } = Sequelize;

const Document = db.sequelize.define('document', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  user_id: {
    type: DataTypes.INTEGER
  },
  file: {
    type: DataTypes.STRING
  },
  uploaded: {
    type: DataTypes.INTEGER
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  deletedAt: {
    allowNull: true,
    type: DataTypes.DATE
  }
  // ... add more attributes as needed
}, {
  paranoid: true
});

export default Document;