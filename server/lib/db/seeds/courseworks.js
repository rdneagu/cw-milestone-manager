const rows = [
  { owner: 1, title: 'Seed Project 1', module: 'Computing', description: 'Project number 1', privacy: true, shared: Date.now(), expectedDate: Date.now() + (86400 * 30 * 1000), createdAt: Date.now() - (86400 * 30 * 1000) },
  { owner: 1, title: 'Seed Project 2', module: 'Physics', description: 'Project number 2', privacy: false, shared: Date.now(), expectedDate: Date.now() + (86400 * 60 * 1000), createdAt: Date.now() - (86400 * 60 * 1000) },
  { owner: 2, title: 'Seed Project 76', module: 'Alien Science', description: 'Find the aliens', privacy: false, shared: Date.now(), expectedDate: Date.now() + (86400 * 30 * 1000), createdAt: Date.now() - (86400 * 30 * 1000) },
  { owner: 1, title: 'Seed Project Web Development', module: 'Web Development Foundations', description: 'Kill me please', privacy: true, shared: Date.now(), expectedDate: Date.now() + (45000 * 1000), createdAt: Date.now() - (86400 * 30 * 1000) },
  { owner: 1, title: 'Seed Project', module: 'Integrated Project', description: 'Boom boom pow', privacy: false, shared: Date.now(), expectedDate: Date.now() - (86400 * 1000), createdAt: Date.now() - (86400 * 30 * 1000) },
];

async function insert(model) {
  await model.destroy({ where: {} });
  // Only populate the development database with seeds
  await model.bulkCreate(rows);
  console.log(`\u001b[32m✓   "${model.tableName}" has been populated\u001b[0m`);
}

module.exports = { insert };
