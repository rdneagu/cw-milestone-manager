// https://sequelize.org/v5/manual/models-definition.html
module.exports = (sequelize, type, table) => sequelize.define(`tbl_${table}`, {
  id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  owner: {
    type: type.INTEGER,
    allowNull: false,
  },
  title: {
    type: type.STRING(32),
    allowNull: false,
  },
  module: {
    type: type.STRING(32),
    allowNull: false,
  },
  description: type.STRING(1024),
  deleted: type.DATE(3),
  privacy: {
    type: type.BOOLEAN,
    allowNull: false,
  },
  expectedDate: {
    type: type.DATE(3),
    allowNull: false,
  },
  completedDate: type.DATE(3),
  shared: type.DATE(3),
});
