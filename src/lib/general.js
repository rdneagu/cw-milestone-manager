export default {
  datetime: {
    getCountdown(diff, full) {
      const absoluteDiff = Math.abs(diff);
      const seconds = Math.floor(absoluteDiff % 60).toString();
      const minutes = Math.floor((absoluteDiff / 60) % 60).toString();
      let str = `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
      if (full) {
        const hours = Math.floor((absoluteDiff / 3600) % 24).toString();
        const days = Math.floor(absoluteDiff / 86400).toString();
        str = `${days.padStart(2, '0')}:${hours.padStart(2, '0')}:${str}`;
      }
      return str;
    },
    fromUTC(date) {
      if (!date) return date;
      return new Date(date).getTime();
    },
  },
};
