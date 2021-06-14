const Sequelize = require('sequelize');

/**
 * This file is used to create the connection to the database using the sequelize module
 * https://sequelize.org/v5/manual/
 */
// SQL environment vars defaulting to localhost settings
process.env.SQL = process.env.SQL || 'develop';
process.env.DBHOST = process.env.DBHOST || 'localhost';
process.env.DBUSER = process.env.DBUSER || 'cwscheduleapp';
process.env.DBPASS = process.env.DBPASS || 'cwscheduleapp';
process.env.DBNAME = process.env.DBNAME || 'cwscheduleapp';
const sql = new Sequelize({
  host: process.env.DBHOST,
  username: `${process.env.DBUSER}_${process.env.SQL}`,
  password: process.env.DBPASS,
  database: `${process.env.DBNAME}_${process.env.SQL}`,
  dialect: 'mysql',
  pool: {
    max: 10,
    idle: 30000,
    acquire: 60000,
  },
  define: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
  logging: false, // (process.env.SQL === 'develop'),
});

const models = require('./models.js');

async function init() {
  // Automatically create tables if they don't exist (add a second parameter set to true if you want to remove the previous tables)
  console.log(`\u001b[36m    Using \`cwscheduleapp_${process.env.SQL}\` database\n\u001b[0m`);
  await models.init(sql, false);
  console.log('\u001b[32m✓   Database config finished loading\n\u001b[0m');
}

module.exports = { sql, init, models };
