const rows = [
  { coursework: 1, title: 'Seed Milestone 1', startedDate: Date.now() + (86400 * 2 * 1000), expectedDate: Date.now() + (86400 * 12 * 1000) },
  { coursework: 1, title: 'Seed Milestone 2', startedDate: Date.now() - (86400 * 3 * 1000), expectedDate: Date.now() + (86400 * 15 * 1000), completedDate: Date.now() + (86400 * 30 * 1000) },
  { coursework: 1, title: 'Seed Milestone 3', startedDate: Date.now() - (86400 * 6 * 1000), expectedDate: Date.now() + (86400 * 24 * 1000), completedDate: Date.now() + (86400 * 23 * 1000) },
  { coursework: 1, title: 'Seed Milestone 4', startedDate: Date.now() - (86400 * 2 * 1000), expectedDate: Date.now() + (86400 * 24 * 1000), completedDate: Date.now() + (86400 * 10 * 1000) },
  { coursework: 1, title: 'Seed Milestone 5', startedDate: Date.now() - (86400 * 2 * 1000), expectedDate: Date.now() + (45000 * 1000) },
  { coursework: 1, title: 'Seed Milestone 6', startedDate: Date.now() - (86400 * 8 * 1000), expectedDate: Date.now() - (86400 * 1000) },
];

async function insert(model) {
  await model.destroy({ where: {} });
  // Only populate the development database with seeds
  await model.bulkCreate(rows);
  console.log(`\u001b[32m✓   "${model.tableName}" has been populated\u001b[0m`);
}

module.exports = { insert };
