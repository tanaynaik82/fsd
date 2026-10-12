// Used by both the app (config/database.js) and sequelize-cli (.sequelizerc)
require('dotenv').config();

const base = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || null,
  database: process.env.DB_NAME || 'recipe_hub',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  logging: false,
};

module.exports = {
  development: { ...base },
  test: { ...base, database: `${base.database}_test` },
  production: { ...base },
};
