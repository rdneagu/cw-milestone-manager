const transporter = require('./config.js');

async function send(contact) {
  const { user, email, subject, message } = contact;
  try {
    if (!email || !message) {
      throw new Error(`E-mail could not be sent due to missing parameters\nemail: ${email}\nmessage: ${message}`);
    }
    const options = {
      from: 'Milestone Manager <milestonemanager.noreply@gmail.com>',
      to: `${user || ''} <${email}>`,
      subject: subject || 'Milestone Manager',
      html: message,
    };
    await transporter.sendMail(options);
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
}

module.exports = { send };
