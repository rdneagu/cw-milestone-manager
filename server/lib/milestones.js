const validator = require('./validators/milestones.validator.js');

const { isEqual } = require('./general');
const { Courseworks, Milestones } = require('./db/models.js').models;

const milestones = {

  async getAllMilestones(data) {
    const { coursework = 0 } = data;

    const result = await Milestones.findAll({ where: { coursework } });
    return result.map((r) => r.dataValues);
  },

  async getMilestone(data) {
    const { coursework = 0, milestone = 0 } = data;

    const result = await Milestones.findOne({ where: { id: milestone, coursework } });
    if (!result) {
      throw { _notification: 'The milestone you\'re trying to access cannot be found' };
    }

    return result.dataValues;
  },

  async createMilestone(data) {
    const error = validator.validate(data, validator.create);
    if (error) {
      throw error;
    }

    const currentDate = new Date(Date.now()).toISOString();
    data.startedDate = new Date(data.startedDate).toISOString();
    data.expectedDate = new Date(data.expectedDate).toISOString();

    const { coursework = 0, title, description = null, startedDate, expectedDate } = data;

    const courseworkData = await Courseworks.findOne({ where: { id: coursework } });
    if (!courseworkData) {
      throw { _system: 'System called createMilestone on an invalid coursework' };
    }

    const isDeleted = courseworkData.deleted;
    if (isDeleted && currentDate > isDeleted.toISOString()) {
      throw { _system: 'System called createMilestone on a deleted coursework' };
    }

    if (courseworkData.completedDate) {
      throw { _notification: 'You cannot create a milestone in a completed coursework' };
    }

    if (startedDate < courseworkData.createdAt.toISOString()) {
      throw { startedDate: ['The start date of the milestone cannot be earlier than the date the coursework has been created'] };
    }
    if (expectedDate > courseworkData.expectedDate.toISOString()) {
      throw { expectedDate: ['The expected date of the milestone cannot be later than the expected date of the coursework'] };
    }
    if (startedDate >= expectedDate) {
      throw { startedDate: ['The start date cannot be later than the expected date'] };
    }

    const toInsert = { coursework, title, description, startedDate, expectedDate };
    const created = await Milestones.create(toInsert);
    return created.dataValues;
  },

  async editMilestone(data) {
    const error = validator.validate(data, validator.create);
    if (error) {
      throw error;
    }

    const currentDate = new Date(Date.now()).toISOString();
    data.startedDate = new Date(data.startedDate).toISOString();
    data.expectedDate = new Date(data.expectedDate).toISOString();

    const { coursework = 0, milestone = 0, title, description = null, startedDate, expectedDate } = data;

    const courseworkData = await Courseworks.findOne({ where: { id: coursework } });
    if (!courseworkData) {
      throw { _system: 'System called editMilestone on an invalid coursework' };
    }

    if (courseworkData.completedDate) {
      throw { _notification: 'You cannot edit a milestone in a completed coursework' };
    }

    const milestoneData = await Milestones.findOne({ where: { id: milestone, coursework } });
    if (!milestoneData) {
      throw { _system: 'System called editMilestone on an invalid milestone' };
    }

    const isDeleted = courseworkData.deleted;
    if (isDeleted && currentDate > isDeleted.toISOString()) {
      throw { _system: 'System called editMilestone on a deleted coursework' };
    }

    if (milestoneData.completedDate) {
      throw { _notification: 'You cannot edit a completed milestone' };
    }

    const toUpdate = { title, description, startedDate, expectedDate };
    if (isEqual(toUpdate, milestoneData.dataValues)) {
      throw { _notification: 'No changes have been made to the milestone' };
    }

    if (startedDate < courseworkData.createdAt.toISOString()) {
      throw { startedDate: ['The start date of the milestone cannot be earlier than the date the coursework has been created'] };
    }
    if (expectedDate > courseworkData.expectedDate.toISOString()) {
      throw { expectedDate: ['The expected date of the milestone cannot be later than the expected date of the coursework'] };
    }
    if (startedDate >= expectedDate) {
      throw { startedDate: ['The start date cannot be later than the expected date'] };
    }

    await Milestones.update(toUpdate, { where: { id: milestone, coursework } });

    return toUpdate;
  },

  async deleteMilestone(data) {
    const error = validator.validate(data, validator.delete);
    if (error) {
      throw error;
    }

    const { coursework = 0, milestone = 0, title } = data;

    const milestoneData = await Milestones.findOne({ where: { id: milestone, coursework } });
    if (!milestoneData) {
      throw { _system: 'System called deleteMilestone on an invalid milestone' };
    }

    const courseworkData = await Courseworks.findOne({ where: { id: coursework } });
    if (courseworkData.completedDate) {
      throw { _notification: 'You cannot delete a milestone in a completed coursework' };
    }

    const currentDate = new Date(Date.now()).toISOString();
    const isDeleted = courseworkData.deleted;
    if (isDeleted && currentDate > isDeleted.toISOString()) {
      throw { _system: 'System called deleteMilestone on a deleted coursework' };
    }

    const sameTitle = (milestoneData.title === title);
    if (!sameTitle) {
      throw { title: ['You must enter the same title of the milestone you want to delete'] };
    }

    await Milestones.destroy({ where: { id: milestone, coursework } });
    return true;
  },

  async changeProgress(data) {
    const { coursework = 0, milestone = 0, completed } = data;

    const milestoneData = await Milestones.findOne({ where: { id: milestone, coursework } });
    if (!milestoneData) {
      throw { _system: 'System called changeProgress on an invalid milestone' };
    }

    const courseworkData = await Courseworks.findOne({ where: { id: coursework } });
    if (courseworkData.completedDate) {
      throw { _notification: 'You cannot change the progress of a milestone in a completed coursework' };
    }

    const currentDate = new Date(Date.now()).toISOString();
    const isDeleted = courseworkData.deleted;
    if (isDeleted && currentDate > isDeleted.toISOString()) {
      throw { _system: 'System called changeProgress on a deleted coursework' };
    }

    const alreadyCompleted = milestoneData.completedDate;
    if (!!completed === !!alreadyCompleted) {
      throw { _notification: `The milestone is already marked as ${alreadyCompleted ? 'complete' : 'incomplete'}` };
    }

    const completedDate = (completed) ? new Date(Date.now()).toISOString() : null;

    const toUpdate = { completedDate };
    await Milestones.update(toUpdate, { where: { id: milestone, coursework } });

    return { completedDate };
  },
};

module.exports = milestones;
