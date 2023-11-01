import Sequelize from 'sequelize';
import db from './index.js';
import Category from './category.js';
const { DataTypes } = Sequelize;

const APIProducts = db.sequelize.define('APIProducts', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    api_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    api_key: {
        type: DataTypes.STRING,
        allowNull: true
    },
    company: {
        type: DataTypes.STRING,
        allowNull: true
    },
    env: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
    },
    updatedAt: {
        type: DataTypes.DATE
    }
}, {
    // explicitly specifying the table name
    tableName: 'api_products',

});
APIProducts.belongsTo(Category, {
    as: 'APICategory',
    foreignKey: 'api_id',
})
export default APIProducts;