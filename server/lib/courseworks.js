const jwt = require('jsonwebtoken');
const { QueryTypes } = require('sequelize');
const { sql } = require('./db/config');

const validator = require('./validators/courseworks.validator.js');
const { isEqual } = require('./general');
const users = require('./users');
const milestones = require('./milestones');

const { Milestones, Courseworks, CourseworkMembers } = require('./db/models.js').models;

function generateSharedKey(date) {
  return (date) ? jwt.sign('correct', `${new Date(date).toISOString()}`) : null;
}

const courseworks = {

  async getCourseworks({ user = 0, coursework = 0 }, data = {}) {
    const { owner, participant, title, module, description, completed, brief, search } = data;

    const select = ['cw.*', 'cwu.username as ownerName'];
    const joins = [];
    const condition = [];
    const group = [];
    const order = [];
    let table = 'tbl_courseworks AS cw';
    let limit = '';
    if (owner) {
      const userFound = (await users.find(owner)) || { id: 0 };
      condition.push(`cw.owner = ${userFound.id}`);
    }
    if (participant || (!search && user)) {
      const userFound = (await users.find(participant || user)) || { id: 0 };
      table = 'tbl_coursework_members AS cwm';
      select.push('cwmu.id as participant');
      select.push('cwmu.username as participantName');
      joins.push('tbl_users AS cwmu ON cwmu.id = cwm.member');
      joins.push('tbl_courseworks AS cw ON cw.id = cwm.coursework');
      condition.push(`cwm.member = ${userFound.id}`);
    }
    if (title) {
      condition.push('cw.title LIKE :title');
    }
    if (module) {
      condition.push('cw.module LIKE :module');
    }
    if (description) {
      condition.push('cw.description LIKE :description');
    }
    if (completed !== undefined) {
      const toSql = (completed === true) ? 'IS NOT NULL' : 'IS NULL';
      condition.push(`cw.completedDate ${toSql}`);
    }
    joins.push('tbl_users AS cwu ON cwu.id = cw.owner');
    const milestoneCount = [
      'coursework',
      'COUNT(CASE WHEN completedDate IS NOT NULL THEN 1 END) as milestoneComplete',
      'COUNT(CASE WHEN completedDate IS NULL THEN 1 END) as milestoneIncomplete',
    ];
    select.push('milestone.milestoneComplete, milestone.milestoneIncomplete');
    const memberCount = [
      'coursework',
      'COUNT(coursework) as participantsNumber',
      `COUNT(CASE WHEN member = ${user} THEN 1 END) as isParticipant`,
    ];
    select.push('cwmc.isParticipant, cwmc.participantsNumber');
    joins.push(`(SELECT ${milestoneCount.join(', ')} FROM tbl_milestones GROUP BY coursework) as milestone ON milestone.coursework = cw.id`);
    joins.push(`(SELECT ${memberCount.join(', ')} FROM tbl_coursework_members GROUP BY coursework) AS cwmc ON cwmc.coursework = cw.id`);
    group.push('cw.id');
    order.push('cw.createdAt DESC');
    if (search) {
      limit = 'LIMIT 25';
    }
    if (coursework) {
      const courseworkFound = (await this.find(coursework)) || { id: 0 };
      condition.push(`cw.id = ${courseworkFound.id}`);
    }
    if (!coursework) {
      condition.push('(cwmc.isParticipant = 1 OR (cwmc.isParticipant = 0 AND cw.privacy IS FALSE))');
    }
    condition.push(`(cw.deleted IS NULL OR cw.deleted > '${new Date().toISOString()}')`);
    const query = `
      SELECT \
        ${select.join(', ')} \
      FROM \
        ${table} \
      ${(joins.length) ? `LEFT JOIN ${joins.join(' LEFT JOIN ')}` : ''} \
      ${(condition.length) ? `WHERE ${condition.join(' AND ')}` : ''} \
      ${(group.length) ? `GROUP BY ${group.join(', ')}` : ''} \
      ${(order.length) ? `ORDER BY ${order.join(', ')}` : ''} \
      ${limit} \
      `;
    const queryResult = await sql.query(query, {
      replacements: { owner, title: `%${title}%`, module: `%${module}%`, description: `%${description}%` },
      type: QueryTypes.SELECT,
      // logging: (log) => console.log(`\n    getAllCourseworks::\n${log.replace(/[ ]+/g, ' ')} \\G`),
    });
    const courseworkReturnPromise = queryResult.map((cw) => this.formatCourseworkReturn(cw, brief));
    return Promise.all(courseworkReturnPromise);
  },

  async getCoursework(data) {
    const { coursework = 0 } = data;
    return this.getCourseworks({ coursework });
  },

  async createCoursework(user, data) {
    const error = validator.validate(data, validator.create);
    if (error) {
      throw error;
    }

    const currentDate = new Date(Date.now()).toISOString();
    data.expectedDate = new Date(data.expectedDate).toISOString();

    const { title, module, description = null, privacy = true, expectedDate } = data;

    if (expectedDate < currentDate) {
      throw { expectedDate: ['The expected date of the coursework cannot be earlier than the current date'] };
    }

    const owner = user;
    const shared = currentDate;

    const toInsert = { title, owner, module, description, privacy, expectedDate, shared };
    const created = await Courseworks.create(toInsert);

    const toInsertMember = { coursework: created.id, member: owner, team: 'Manager' };
    await CourseworkMembers.create(toInsertMember);

    return this.getCoursework({ coursework: created.id });
  },

  async editCoursework(data) {
    const error = validator.validate(data, validator.create);
    if (error) {
      throw error;
    }

    const currentDate = new Date(Date.now()).toISOString();
    data.expectedDate = new Date(data.expectedDate).toISOString();

    const { coursework = 0, title, module, description = null, expectedDate } = data;

    const courseworkData = await Courseworks.findOne({ where: { id: coursework } });
    if (!courseworkData) {
      throw { _system: 'System called editCoursework on an invalid coursework' };
    }

    const isDeleted = courseworkData.deleted;
    if (isDeleted && currentDate > isDeleted.toISOString()) {
      throw { _system: 'System called deleteCoursework on a deleted coursework' };
    }

    if (courseworkData.completedDate) {
      throw { _notification: 'You cannot edit a completed coursework' };
    }

    const toUpdate = { title, module, description, expectedDate };
    if (isEqual(toUpdate, courseworkData.dataValues)) {
      throw { _notification: 'No changes have been made to the coursework' };
    }

    if (expectedDate < currentDate) {
      throw { expectedDate: ['The expected date of the coursework cannot be earlier than the current date'] };
    }

    await Courseworks.update(toUpdate, { where: { id: coursework } });
    return toUpdate;
  },

  async deleteCoursework(data) {
    const { coursework = 0, title } = data;

    const courseworkData = await Courseworks.findOne({ where: { id: coursework } });
    if (!courseworkData) {
      throw { _system: 'System called deleteCoursework on an invalid coursework' };
    }

    const currentDate = new Date(Date.now()).toISOString();
    const isDeleted = courseworkData.deleted;
    if (isDeleted && currentDate > isDeleted.toISOString()) {
      throw { _system: 'System called deleteCoursework on a deleted coursework' };
    }

    if (!isDeleted) {
      const sameTitle = (courseworkData.title === title);
      if (!sameTitle) {
        throw { title: ['You must enter the same title of the coursework you want to delete'] };
      }
    }

    const deleted = (!isDeleted) ? new Date(Date.now() + (3600 * 1000)).toISOString() : null;
    courseworkData.deleted = deleted;
    await courseworkData.save();
    return { deleted };
  },

  async changePrivacy(data) {
    const { coursework = 0, privacy } = data;

    const courseworkData = await Courseworks.findOne({ where: { id: coursework } });
    if (!courseworkData) {
      throw { _system: 'System called changePrivacy on an invalid coursework' };
    }

    const currentDate = new Date(Date.now()).toISOString();
    const isDeleted = courseworkData.deleted;
    if (isDeleted && currentDate > isDeleted.toISOString()) {
      throw { _system: 'System called changePrivacy on a deleted coursework' };
    }

    const alreadyPrivate = courseworkData.privacy;
    if (privacy === alreadyPrivate) {
      throw { _notification: `The coursework is already ${alreadyPrivate ? 'private' : 'public'}` };
    }

    courseworkData.privacy = privacy;
    await courseworkData.save();

    return { privacy };
  },

  async changeProgress(data) {
    const { coursework = 0, completed } = data;

    const courseworkData = await Courseworks.findOne({ where: { id: coursework } });
    if (!courseworkData) {
      throw { _system: 'System called changeProgress on an invalid coursework' };
    }

    const currentDate = new Date(Date.now()).toISOString();
    const isDeleted = courseworkData.deleted;
    if (isDeleted && currentDate > isDeleted.toISOString()) {
      throw { _system: 'System called changeProgress on a deleted coursework' };
    }

    const alreadyCompleted = courseworkData.completedDate;
    if (!!completed === !!alreadyCompleted) {
      throw { _notification: `The coursework is already marked as ${alreadyCompleted ? 'complete' : 'incomplete'}` };
    }

    if (!alreadyCompleted) {
      const incompleteMilestones = await Milestones.findOne({ where: { coursework, completedDate: null } });
      if (incompleteMilestones) {
        throw { _notification: 'You cannot complete a coursework if there are still incomplete milestones' };
      }
    }

    const completedDate = (completed) ? new Date(Date.now()).toISOString() : null;

    courseworkData.completedDate = completedDate;
    await courseworkData.save();

    return { completedDate };
  },

  async changeShared(data) {
    const { coursework = 0, change } = data;

    const courseworkData = await Courseworks.findOne({ where: { id: coursework } });
    if (!courseworkData) {
      throw { _system: 'System called changeShared on an invalid coursework' };
    }

    const currentDate = new Date(Date.now()).toISOString();
    const isDeleted = courseworkData.deleted;
    if (isDeleted && currentDate > isDeleted.toISOString()) {
      throw { _system: 'System called changeShared on a deleted coursework' };
    }

    if (!change && !courseworkData.shared) {
      throw { _notification: 'The coursework sharing is already disabled' };
    }

    const shared = (change) ? new Date(Date.now()).toISOString() : null;

    courseworkData.shared = shared;
    await courseworkData.save();

    return { shared, sharedToken: generateSharedKey(shared) };
  },

  async getParticipants(coursework, participant) {
    const condition = [];
    // Default condition
    condition.push(`coursework = ${coursework}`);
    if (participant) {
      // If a specific participant is requested
      condition.push(`member = ${participant}`);
    }
    const queryResult = await sql.query(`SELECT id, username, team, cwm.createdAt FROM tbl_coursework_members AS cwm LEFT JOIN tbl_users ON member = id WHERE ${condition.join(' AND ')}`, { type: QueryTypes.SELECT });
    return queryResult;
  },

  async addParticipant(data) {
    const error = validator.validate(data, validator.addParticipant);
    if (error) {
      throw error;
    }
    const { coursework = 0, member, team = 'Member' } = data;

    const courseworkData = await Courseworks.findOne({ where: { id: coursework } });
    if (!courseworkData) {
      throw { _system: 'System called addParticipant on an invalid coursework' };
    }

    const currentDate = new Date(Date.now()).toISOString();
    const isDeleted = courseworkData.deleted;
    if (isDeleted && currentDate > isDeleted.toISOString()) {
      throw { _system: 'System called addParticipant on a deleted coursework' };
    }

    const userFound = await users.find(member, { member: ['The user you\'re trying to invite does not exist'] });

    const courseworkMember = await CourseworkMembers.findOne({ where: { coursework, member: userFound.id } });
    if (courseworkMember) {
      throw { member: ['The user you\'re trying to invite is already a member'] };
    }

    const toInsertMember = { coursework, member: userFound.id, team };
    await CourseworkMembers.create(toInsertMember);
    return { id: userFound.id, username: userFound.username, team, createdAt: currentDate };
  },

  async editParticipant(data) {
    const error = validator.validate(data, validator.editParticipant);
    if (error) {
      throw error;
    }
    const { coursework = 0, member = 0, team } = data;

    const courseworkData = await Courseworks.findOne({ where: { id: coursework } });
    if (!courseworkData) {
      throw { _system: 'System called editParticipant on an invalid coursework' };
    }

    const currentDate = new Date(Date.now()).toISOString();
    const isDeleted = courseworkData.deleted;
    if (isDeleted && currentDate > isDeleted.toISOString()) {
      throw { _system: 'System called editParticipant on a deleted coursework' };
    }

    const courseworkMember = await CourseworkMembers.findOne({ where: { coursework, member } });
    if (!courseworkMember) {
      throw { _system: 'System called editParticipant on an invalid coursework member' };
    }

    const toUpdate = { team };
    if (isEqual(toUpdate, courseworkMember.dataValues)) {
      throw { _notification: 'No changes have been made to this member' };
    }

    await CourseworkMembers.update(toUpdate, { where: { coursework, member } });

    return toUpdate;
  },

  async deleteParticipant(data) {
    const { coursework = 0, member = 0, username } = data;

    const courseworkData = await Courseworks.findOne({ where: { id: coursework } });
    if (!courseworkData) {
      throw { _system: 'System called deleteParticipant on an invalid coursework' };
    }

    const currentDate = new Date(Date.now()).toISOString();
    const isDeleted = courseworkData.deleted;
    if (isDeleted && currentDate > isDeleted.toISOString()) {
      throw { _system: 'System called deleteParticipant on a deleted coursework' };
    }

    const courseworkMember = await CourseworkMembers.findOne({ where: { coursework, member } });
    if (!courseworkMember) {
      throw { _system: 'System called deleteParticipant on an invalid coursework member' };
    }

    if (courseworkData.owner === member) {
      throw { _notification: 'You cannot remove yourself since you are the owner' };
    }

    const userFound = await users.find(member, { _system: 'System called deleteParticipant on an invalid user' });

    const sameUsername = (userFound.username === username);
    if (!sameUsername) {
      throw { username: ['You must enter the username of the user you want to delete'] };
    }

    await CourseworkMembers.destroy({ where: { coursework, member: userFound.id } });
    return true;
  },

  async find(coursework = 0, err) {
    // Find the user either by id or username depending on what is passed
    const found = await Courseworks.findOne({
      where: { id: coursework },
    });

    if (!found && err) {
      throw err;
    }

    return found;
  },

  async formatCourseworkReturn(coursework, brief) {
    let toReturn = {
      ...coursework,
      sharedToken: generateSharedKey(coursework.shared),
    };
    if (!brief) {
      const participantsResult = await this.getParticipants(coursework.id);
      const milestonesResult = await milestones.getAllMilestones({ coursework: coursework.id });
      toReturn = {
        ...toReturn,
        participants: participantsResult,
        milestones: milestonesResult,
      };
    }
    return toReturn;
  },
};

module.exports = courseworks;
