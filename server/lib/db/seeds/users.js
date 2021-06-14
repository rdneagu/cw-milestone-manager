const bcrypt = require('bcrypt');

const rows = [
  { username: 'admin_1', password: '%test%', email: 'admin_1@abc.com' },
  { username: 'admin_2', password: '?test?', email: 'admin_2@abc.com' },
  { username: 'admin_3', password: '.test`', email: 'admin_3@abc.com' },
  { username: 'user_1', password: '.test`', email: 'user_1@abc.com' },
  { username: 'user_2', password: '.test`', email: 'user_2@abc.com' },
  { username: 'user_3', password: '.test`', email: 'user_3@abc.com' },
];

async function cryptPasswords() {
  const promises = rows.map(async (row) => {
    const crypted = await bcrypt.hash(row.password, 10);
    return crypted;
  });
  const result = await Promise.all(promises);
  result.forEach((value, id) => { rows[id].password = value; });
}

async function insert(model) {
  await model.destroy({ where: {} });
  await cryptPasswords();
  await model.bulkCreate(rows);
  console.log(`\u001b[32m✓   "${model.tableName}" has been populated\u001b[0m`);
}

module.exports = { insert };
