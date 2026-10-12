const { Sequelize } = require('sequelize');
const config = require('./config');

const env = process.env.NODE_ENV || 'development';
const { database, username, password, ...options } = config[env];

const sequelize = new Sequelize(database, username, password, {
  ...options,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
});

module.exports = sequelize;
