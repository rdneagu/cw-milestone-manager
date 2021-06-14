// https://sequelize.org/v5/manual/models-definition.html
module.exports = (sequelize, type, table) => sequelize.define(`tbl_${table}`, {
  id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: type.STRING(32),
    allowNull: false,
  },
  password: {
    type: type.STRING(128),
    allowNull: false,
  },
  email: {
    type: type.STRING(128),
    allowNull: false,
  },
  privacy: type.BOOLEAN,
});
