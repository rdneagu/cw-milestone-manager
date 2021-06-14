module.exports = {
  isEqual(data, withData) {
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      if (JSON.stringify(data[keys[i]]) !== JSON.stringify(withData[keys[i]])) return false;
    }
    return true;
  },
  datetime: {
    toUTC(date) {
      return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    },
    fromUTC(date) {
      return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    },
  },
};
