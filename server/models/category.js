import Sequelize from 'sequelize';
import db from './index.js';

const { DataTypes } = Sequelize;
const Category = db.sequelize.define("categories", {
    parent_id: DataTypes.INTEGER,
    category_name: DataTypes.STRING,
    seo_url: DataTypes.STRING,
    description: DataTypes.TEXT,
    long_description: DataTypes.TEXT,
    meta_description: DataTypes.STRING,
    meta_keywords: DataTypes.STRING,
    h1_tag: DataTypes.STRING,
    alt: DataTypes.STRING,
    image_title: DataTypes.STRING,
    image: DataTypes.STRING,
    faq_schema: DataTypes.TEXT,
    top: DataTypes.TINYINT,
    api: DataTypes.TINYINT,
    createdAt: {
        field: 'created_at',
        type: DataTypes.DATE,
    },
    updatedAt: {
        field: 'updated_at',
        type: DataTypes.DATE
    }
});
export default Category;