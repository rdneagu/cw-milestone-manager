/* eslint-disable global-require */
const path = require('path');
const cors = require('cors');
const express = require('express');
const expressSession = require('express-session');
const sequelize = require('../lib/db/config.js');
const routes = require('../loaders/routes.js');

async function init() {
  // Initialize sequelize ORM and models
  await sequelize.init();

  const app = express();
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../dist')));
  app.use(cors());

  // Persisting unique sessions
  app.set('trust proxy', 1);
  app.use(expressSession({
    secret: 'bamboozleSecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 24 * 365 * 1000,
      secure: false,
    },
  }));

  // Initialize routes
  await routes.init(app);

  // Handles any requests that don't match the ones above
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  const port = process.env.PORT || 5000;
  const server = app.listen(port, () => {
    console.log(`\u001b[36m    Server started! Listening on port: ${port}\n\u001b[0m`);
  });

  return { app, server };
}

module.exports = { init, sequelize, routes };
