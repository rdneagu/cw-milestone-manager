const rows = [
  { coursework: 1, member: 1, team: 'Manager' },
  { coursework: 2, member: 1, team: 'Manager' },
  { coursework: 3, member: 2, team: 'Manager' },
  { coursework: 1, member: 4, team: 'Backend' },
  { coursework: 1, member: 5, team: 'Frontend' },
  { coursework: 2, member: 6, team: 'Frontend' },
  { coursework: 4, member: 1, team: 'Manager' },
  { coursework: 5, member: 1, team: 'Manager' },
];

async function insert(model) {
  await model.destroy({ where: {} });
  await model.bulkCreate(rows);
  console.log(`\u001b[32m✓   "${model.tableName}" has been populated\u001b[0m`);
}

module.exports = { insert };
