const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'milestonemanager.noreply@gmail.com',
    pass: 'cwscheduleapp',
  },
});

module.exports = transporter;
