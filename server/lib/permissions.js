const jwt = require('jsonwebtoken');

const { Users, Courseworks, CourseworkMembers } = require('./db/models').models;

module.exports = {
  /**
   * Returns whether the user is authenticated or not
   *
   * @param {Integer} userId        - The user id taken from the session (defaults to 0 if guest)
   * @returns {Boolean}  True if the user has access to the coursework
   *
   * @throws {Object}  _notification error
   */
  async hasPrivileges(userId = 0) {
    const user = await Users.findOne({ where: { id: userId } });
    if (!user) {
      throw { _notification: 'You must be authenticated to perform this operation' };
    }
    return true;
  },

  /**
   * Returns whether the user has permission to view the coursework or not
   *
   * @param {Integer} userId          - The user id taken from the session (defaults to 0 if guest)
   * @param {Integer} courseworkId    - The coursework id to check permissions for (defaults to 0 if undefined)
   * @returns {Boolean}  True if the user has access to the coursework
   *
   * @throws {Object}  _system or _notification error
   */
  async hasCourseworkReadOnlyPermission(userId = 0, courseworkId = 0, sharedToken = null) {
    const coursework = await Courseworks.findOne({ where: { id: courseworkId } });
    if (!coursework) {
      throw { _notification: 'The coursework could not be found' };
    }

    // Checking access token from shared link
    if (sharedToken) {
      if (!coursework.shared) {
        throw { _notification: 'This coursework does not have sharing enabled' };
      }
      // Attempting to sign the access jwt
      try {
        jwt.verify(sharedToken, `${new Date(coursework.shared).toISOString()}`);
      } catch (e) {
        sharedToken = null;
      }
    }

    // Checking if the coursework is private and the client doesn't have a valid shared token
    if (coursework.privacy && !sharedToken) {
      const isParticipant = await CourseworkMembers.findOne({ where: { coursework: courseworkId, member: userId } });
      if (!isParticipant) {
        throw { _notification: 'You have not been invited to view this coursework' };
      }
    }
    return true;
  },

  /**
   * Returns whether the user has permission to view the coursework or not
   *
   * @param {Integer} userId          - The user id taken from the session (defaults to 0 if guest)
   * @param {Integer} courseworkId    - The coursework id to check permissions for (defaults to 0 if undefined)
   * @returns {Boolean}  True if the user has access to the coursework
   *
   * @throws {Object}  _system or _notification error
   */
  async hasCourseworkWritePermission(userId = 0, courseworkId = 0) {
    await this.hasPrivileges(userId);

    const coursework = await Courseworks.findOne({ where: { id: courseworkId } });
    if (!coursework) {
      throw { _system: 'System called hasCourseworkWritePermission with an invalid coursework' };
    }
    const isOwner = (coursework.owner === userId);
    if (!isOwner) {
      throw { _notification: 'You are not the owner of this coursework' };
    }
    return true;
  },
};
