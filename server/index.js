/* eslint-disable global-require */
const path = require('path');
const cors = require('cors');
const express = require('express');
const expressSession = require('express-session');
const sequelizeSession = require('connect-session-sequelize')(expressSession.Store);
const sequelize = require('./lib/db/config.js');
const routes = require('./loaders/routes.js');

(async () => {
  // Initialize sequelize ORM and models
  await sequelize.init();

  const app = express();
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../dist')));
  app.use(cors());

  // Persisting unique sessions
  app.set('trust proxy', 1);
  const store = new sequelizeSession({
    db: sequelize.sql,
    tableName: 'tbl_sessions',
  });
  await store.sync();
  app.use(expressSession({
    secret: 'bamboozleSecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 24 * 365 * 1000,
      secure: false,
    },
    store,
  }));

  // Initialize routes
  await routes.init(app);

  // Handles any requests that don't match the ones above
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`\u001b[36m    Server started! Listening on port: ${port}\n\u001b[0m`);
  });
})();
