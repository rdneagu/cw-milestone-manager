const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const readdirAsync = promisify(fs.readdir);

const ROUTES_DIR = path.join(__dirname, '../routes');

const routes = {
  async init(app) {
    try {
      const list = await readdirAsync(ROUTES_DIR);
      // Loop through the files in the ROUTES_DIR and load the .js files into the express app
      list.forEach((fn) => {
        if (!/.js/.test(fn)) return;

        const [name] = fn.split('.');
        const route = require(path.join(ROUTES_DIR, fn)); // eslint-disable-line
        app.use(`/${name}`, route);
        console.log(`\u001b[32m✓   Route \`${name}\` has loaded successfully\u001b[0m`);
      });
      console.log('\u001b[32m✓   Routes config finished loading\n\u001b[0m');
    } catch (e) {
      console.error(e);
      console.log('\u001b[31;1mx   Routes failed loading, see error above\n\u001b[0m');
    }
  },
};

module.exports = routes;
