<template>
  <div class="coursework-id-route">
    <transition name="fade" appear>
      <div v-if="coursework" class="coursework-wrapper">
        <div class="coursework-tabs">
          <Button v-for="(tab, key) in tabs" :key="key" class="btn-tab" v-bind="tab" type="tab" :class="[ isTabActive(key), key ]" :active="isTabActive(key)" />
        </div>
        <div class="coursework-content">
          <transition name="fade" mode="out-in" appear>
            <div v-if="isTabActive('overview')" :key="tabRKey" class="panel coursework-overview">
              <section class="subpanel coursework-information">
                <header class="subpanel-header">
                  <div class="title">{{ coursework.title }}</div>
                  <div class="module">{{ coursework.module }}</div>
                  <div class="owner"><Icon name="crown" />{{ coursework.ownerName }}</div>
                </header>
                <section class="subpanel-body">
                  <div class="group">
                    <VLine icon="person" label="MEMBERS" class="members">
                      <Icon v-for="i in coursework.participantsNumber" :key="i" name="person" />
                    </VLine>
                    <VLine icon="progress" label="MILESTONES" class="progress">
                      <div v-if="getTotalMilestones" class="milestones-completed">{{ getMilestonesCompleted.length }}</div>
                      <div v-if="getTotalMilestones" class="milestones-separator">/</div>
                      <div class="milestones-total">{{ getTotalMilestones || 'No milestones' }}</div>
                      <div v-if="getTotalMilestones" class="milestones-ratio">({{ (getTotalMilestonesRatio(getMilestonesCompleted.length) * 100).toFixed(1) }}%)</div>
                    </VLine>
                  </div>
                  <div class="group">
                    <VLine icon="access_time" label="CREATED ON">{{ getFullDate(coursework.createdAt) }}</VLine>
                    <VLine icon="access_time" label="UPDATED ON">{{ getFullDate(coursework.updatedAt) }}</VLine>
                    <VLine icon="access_time" label="DEADLINE">{{ getFullDate(coursework.expectedDate) }}</VLine>
                  </div>
                </section>
                <section v-if="isOwner" class="subpanel-footer">
                  <Button v-if="$route.name !== 'courseworkView'" v-bind="control.showCoursework" type="dialog" />
                  <Button v-if="!coursework.completedDate" v-bind="control.setComplete" type="dialog" />
                  <div class="group">
                    <Button v-if="!coursework.completedDate" v-bind="control.editCoursework" type="dialog" />
                    <Button v-if="!coursework.deleted" v-bind="control.deleteCoursework" icon="trash" type="google dialog" />
                  </div>
                </section>
              </section>
              <transition name="fade" mode="out-in" appear>
                <section v-if="$route.name === 'courseworkView'" class="subpanel coursework-view">
                  <section class="status-wrapper">
                    <div class="share" :class="[ getSharingStatus ]">
                      <div class="title">
                        <span>SHARE<Tag :type="[ getSharingStatus ]">{{ (coursework.shared) ? 'ENABLED' : 'DISABLED' }}</TAG></span>
                        <Icon name="share" />
                      </div>
                      <div class="status-info">
                        <template v-if="coursework.shared">
                          <span class="message">This coursework has sharing enabled, anyone with the sharing link can view it.</span>
                          <div class="share-token" @click="() => copySharingLink()">
                            <span>{{ (coursework.sharedToken.split('.'))[2] }}</span>
                            <Icon name="copy" />
                          </div>
                          <div v-if="isOwner" class="v-center">
                            <VLine label="GENERATED ON" :type="getSharingStatus">{{ getFullDate(coursework.shared) }}</VLine>
                          </div>
                        </template>
                        <template v-else>
                          <span class="message">This coursework has sharing disabled.</span>
                          <span class="message pad">Making this coursework private will ensure that no one can access the course besides the coursework members.</span>
                        </template>
                      </div>
                      <div v-if="isOwner" class="status-control">
                        <div v-if="coursework.shared" class="group-control">
                          <Button v-bind="control.refreshSharing" type="dialog" />
                          <Button v-bind="control.disableSharing" type="google dialog" />
                        </div>
                        <Button v-else v-bind="control.enableSharing" type="notice dialog" />
                      </div>
                    </div>
                    <div class="privacy" :class="[ getPrivacyStatus ]">
                      <div class="title">
                        <span>PRIVACY<Tag :type="getPrivacyStatus">{{ (coursework.privacy) ? 'PRIVATE' : 'PUBLIC' }}</TAG></span>
                        <Icon name="eye-blocked" />
                      </div>
                      <div class="status-info">
                        <span v-if="coursework.privacy" class="message">This coursework is currently private, only members can view the coursework.</span>
                        <span v-else class="message">This coursework is currently public, anyone can search and view the coursework regardless of membership.</span>
                      </div>
                      <div v-if="isOwner" class="status-control">
                        <Button v-if="coursework.privacy" v-bind="control.makePublic" type="dialog" />
                        <Button v-else v-bind="control.makePrivate" type="notice dialog" />
                      </div>
                    </div>
                    <div v-if="getCompletedStatus" class="complete" :class="[ getCompletedStatus.css ]">
                      <div class="title">
                        <span>COMPLETED<Tag :type="getCompletedStatus.css">{{ getCompletedStatus.status }}</TAG></span>
                        <Icon name="flag" />
                      </div>
                      <div class="status-info">
                        <span class="message">This coursework is marked as completed. No changes can be made while marked as complete.</span>
                        <div class="v-center">
                          <VLine label="COMPLETED ON" :type="getCompletedStatus.css">{{ getFullDate(coursework.completedDate) }}</VLine>
                        </div>
                      </div>
                      <div v-if="isOwner" class="status-control">
                        <Button v-bind="control.setIncomplete" icon="close" :type="`${getCompletedStatus.css} dialog`">Mark as incomplete</Button>
                      </div>
                    </div>
                    <div v-if="coursework.deleted" class="trash alert">
                      <div class="title">
                        <span>TRASH</span>
                        <Icon name="trash" />
                      </div>
                      <div class="status-info">
                        <span class="message">This coursework is currently in the trash. After the expiration time runs out, the coursework will be permanently removed.</span>
                        <div class="v-center">
                          <VLine label="DELETING IN" type="alert">{{ this.getCountdown(timers.deleted) }}</VLine>
                        </div>
                      </div>
                      <div v-if="isOwner" class="status-control">
                        <Button v-bind="control.restoreCoursework" type="alert dialog" />
                      </div>
                    </div>
                  </section>
                  <section class="access-wrapper">
                    <div class="title">{{ (isOwner) ? 'Manage Access' : 'Members' }}</div>
                    <div class="content">
                      <div class="members">
                        <template v-for="(team, tag) in getGroupedMembers">
                          <div v-for="(member) in team" :key="member.id" class="member">
                            <div class="name">
                              <Icon :name="(member.id === coursework.owner) ? 'crown' : 'person'" />
                              <span>{{ member.username }}</span>
                            </div>
                            <div class="group">
                              <VLine label="Member Since" class="joined">{{ getFullDate(member.createdAt) }}</VLine>
                              <VLine label="Team" class="team">{{ tag }}</VLine>
                            </div>
                            <div v-if="isOwner" class="member-control">
                              <Button v-bind="control.editMember" type="dialog" :click="() => editMember(member)" />
                              <Button v-if="member.id !== coursework.owner" v-bind="control.uninviteMember" type="alert dialog" :click="() => uninviteMember(member)" />
                            </div>
                          </div>
                        </template>
                      </div>
                      <div v-if="isOwner" class="access-control">
                        <div class="group-control">
                          <Button v-bind="control.inviteMember" type="dialog" />
                          <Button icon="crown" type="dialog">Pass ownership</Button>
                        </div>
                      </div>
                    </div>
                  </section>
                </section>
                <router-view v-else class="coursework-view" :coursework.sync="coursework" />
              </transition>
            </div>
            <div v-else-if="isTabActive('milestones')" :key="tabRKey" class="panel milestones-overview">
              <transition name="fade" mode="out-in" appear>
                <section class="subpanel milestones-view">
                  <div class="milestones-breakdown" :key="milestonesRKey">
                    <div class="breakdown-panel completed">
                      <div class="stats-wrapper">
                        <div class="title">Progress</div>
                        <div class="pie-group">
                          <PieProgress :total="getTotalMilestones" :num="getMilestonesCompleted.length" label="Completed" />
                        </div>
                      </div>
                      <div class="stats-wrapper">
                        <div class="title">Performance</div>
                        <div class="pie-group">
                          <PieProgress :total="getMilestonesCompleted.length" :num="getCompletedOnTimeMilestones" label="On Track" />
                          <PieProgress :total="getMilestonesCompleted.length" :num="getCompletedMissedMilestones" type="alert" label="Missed" />
                        </div>
                      </div>
                    </div>
                    <div class="breakdown-panel upcoming">
                      <div class="stats-wrapper">
                        <div class="title">Upcoming</div>
                        <div class="pie-group">
                          <PieProgress :total="getMilestonesInProgress.length" :num="getUpcomingOnTimeMilestones" label="On Track" />
                          <PieProgress :total="getMilestonesInProgress.length" :num="getUpcomingDueMilestones" type="notice" label="Due" />
                          <PieProgress :total="getMilestonesInProgress.length" :num="getUpcomingLateMilestones" type="alert" label="Late" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="milestones-list">
                    <div class="list">
                      <Tag class="title">MILESTONES</Tag>
                      <SidebarPanel name="milestone" title="IN PROGRESS" :component="Milestone" :data="getMilestonesInProgress" :expanded="true" />
                      <SidebarPanel name="milestone" title="COMPLETED" :component="Milestone" :data="getMilestonesCompleted" :expanded="false" />
                    </div>
                    <div class="milestones-control">
                      <Button v-if="isOwner && !coursework.completedDate" v-bind="control.createMilestone" type="dialog" />
                    </div>
                  </div>
                </section>
              </transition>
            </div>
          </transition>
        </div>
      </div>
      <div v-else class="loading-wrapper">
        <Loading v-bind="loading" />
      </div>
    </transition>
  </div>
</template>

<script>
import _ from 'lodash';

import util from '@/lib/general';

import SidebarPanel from '@/components/sidebar/SidebarPanel.sidebar.vue';
import Milestone from '@/components/Milestone.component.vue';
import PieProgress from '@/components/PieProgress.component.vue';
import Loading from '@/components/Loading.component.vue';
import Button from '@/components/Button.component.vue';
import Tag from '@/components/Tag.component.vue';
import VLine from '@/components/VLine.component.vue';
import Icon from '@/components/Icon.component.vue';

import DeleteCoursework from '@/components/windows/DeleteCoursework.window.vue';
import AddParticipant from '@/components/windows/AddParticipant.window.vue';
import EditParticipant from '@/components/windows/EditParticipant.window.vue';
import DeleteParticipant from '@/components/windows/DeleteParticipant.window.vue';

export default {
  components: { SidebarPanel, PieProgress, Loading, Button, Tag, VLine, Icon },
  data() {
    return {
      Milestone,
      tabRKey: 0,
      milestonesRKey: 0,
      timers: {
        deleted: null,
      },
      tabs: {
        overview: { icon: 'clipboard', text: 'Overview' },
        milestones: { icon: 'module', text: 'Milestones' },
      },
      control: {
        refreshSharing: { name: 'refresh-sharing', text: 'Refresh', icon: 'sync', click: () => this.changeSharing() },
        enableSharing: { name: 'enable-sharing', text: 'Enable Sharing', icon: 'share', click: () => this.changeSharing() },
        disableSharing: { name: 'disable-sharing', text: 'Disable', icon: 'close', click: () => this.changeSharing(false) },
        makePrivate: { name: 'make-private', text: 'Make private', icon: 'eye-blocked', click: () => this.changePrivacy(true) },
        makePublic: { name: 'make-public', text: 'Make public', icon: 'eye', click: () => this.changePrivacy(false) },
        createMilestone: { name: 'create-milestone', text: 'Add milestone', icon: 'add', href: { name: 'milestoneCreate', params: { coursework: this.$route.params.coursework }, query: { ...this.$route.query, tab: 'overview' } } },
        editCoursework: { name: 'edit-coursework', text: 'Edit coursework', icon: 'edit', href: { name: 'courseworkEdit', params: { coursework: this.$route.params.coursework }, query: { ...this.$route.query, tab: 'overview' } } },
        restoreCoursework: { name: 'restore-coursework', text: 'Restore', icon: 'restore', click: () => this.restoreCoursework() },
        deleteCoursework: { name: 'delete-coursework', text: 'Delete coursework', icon: 'trash', click: () => this.deleteCoursework() },
        showCoursework: { name: 'show-coursework', text: 'Show coursework', icon: 'clipboard', href: { name: 'courseworkView', params: { coursework: this.$route.params.coursework }, query: this.$route.query } },
        setComplete: { name: 'set-incomplete', text: 'Finish coursework', icon: 'flag', click: () => this.changeProgress(true) },
        setIncomplete: { name: 'set-complete', text: 'Mark as incomplete', icon: 'close', click: () => this.changeProgress(false) },
        inviteMember: { name: 'invite-member', text: 'Invite member', icon: 'person', click: () => this.inviteMember() },
        editMember: { name: 'edit-member', text: 'Edit', icon: 'edit' },
        uninviteMember: { name: 'uninvite-member', text: 'Uninvite', icon: 'trash' },
      },
      loading: { status: 'init' },
      coursework: null,
    };
  },
  async mounted() {
    this.createTabs();
    if (this.getUser !== undefined) {
      const { coursework } = this.$route.params;
      await this.loadCoursework(coursework);
    }
    this.formatDocumentTitle();
  },
  computed: {
    getUser() {
      return this.$store.getters.getUser;
    },
    isOwner() {
      return (this.getUser && this.getUser.id === this.coursework.owner);
    },
    getCompletedStatus() {
      const { completedDate, expectedDate } = this.coursework;
      if (!completedDate) return null;

      if (completedDate > expectedDate) {
        return { status: 'LATE', css: 'alert' };
      }
      if (completedDate > expectedDate - (86400 * 1000)) {
        return { status: 'DUE', css: 'notice' };
      }
      return { status: 'ON TIME' };
    },
    // Milestones
    getTotalMilestones() {
      return this.getMilestonesInProgress.length + this.getMilestonesCompleted.length;
    },
    getMilestonesInProgress() {
      return _.chain(this.coursework.milestones)
        .reject((m) => m.completedDate)
        .orderBy('expectedDate', 'asc')
        .map((m) => ({
          data: {
            coursework: this.coursework,
            milestone: m,
          },
        }))
        .value();
    },
    getMilestonesCompleted() {
      return _.chain(this.coursework.milestones)
        .filter((m) => m.completedDate)
        .orderBy('expectedDate', 'asc')
        .map((m) => ({
          data: {
            coursework: this.coursework,
            milestone: m,
          },
        }))
        .value();
    },
    getCompletedMissedMilestones() {
      const sum = _.chain(this.coursework.milestones)
        .filter((c) => c.completedDate && c.completedDate > c.expectedDate)
        .value();
      return sum.length;
    },
    getCompletedOnTimeMilestones() {
      const sum = _.chain(this.coursework.milestones)
        .filter((c) => c.completedDate && c.completedDate <= c.expectedDate)
        .value();
      return sum.length;
    },
    getUpcomingLateMilestones() {
      const now = Date.now();
      const sum = _.chain(this.coursework.milestones)
        .filter((c) => !c.completedDate && now > c.expectedDate)
        .value();
      return sum.length;
    },
    getUpcomingDueMilestones() {
      const now = Date.now();
      const sum = _.chain(this.coursework.milestones)
        .filter((c) => !c.completedDate && now > c.expectedDate - (86400 * 1000) && now <= c.expectedDate)
        .value();
      return sum.length;
    },
    getUpcomingOnTimeMilestones() {
      const now = Date.now();
      const sum = _.chain(this.coursework.milestones)
        .filter((c) => !c.completedDate && now <= c.expectedDate - (86400 * 1000))
        .value();
      return sum.length;
    },
    //
    getGroupedMembers() {
      const group = _.reduce(this.coursework.participants, (acc, val) => {
        acc[val.team] = acc[val.team] || [];
        acc[val.team].push({
          id: val.id,
          username: val.username,
          team: val.team,
          createdAt: val.createdAt,
        });
        return acc;
      }, {});
      return group;
    },
    getPrivacyStatus() {
      return (!this.coursework.privacy) ? 'notice' : null;
    },
    getSharingStatus() {
      return (!this.coursework.shared) ? 'notice' : null;
    },
    getSharingLink() {
      const path = this.$router.resolve({ name: 'courseworkView', params: { coursework: this.coursework.id } }).href;
      return `${window.location.origin}${path}?share=${this.coursework.sharedToken}`;
    },
  },
  methods: {
    formatDocumentTitle(route) {
      const { name, query = {} } = route || this.$route;
      let title = `Milestone Manager - Coursework: ${(this.coursework) ? this.coursework.title : 'Invalid coursework'}`;
      if (query.tab === 'milestones') {
        title = `${title} - View Milestones`;
      } else if (name === 'courseworkEdit') {
        title = `${title} - Edit Coursework`;
      } else if (name === 'milestoneCreate') {
        title = `${title} - Create Milestone`;
      } else if (name === 'milestoneEdit') {
        title = `${title} - Edit Milestone`;
      }
      document.title = title;
    },
    async loadCoursework(coursework) {
      this.$set(this, 'coursework', null);
      this.$set(this, 'loading', { status: 'pending', message: 'Loading coursework' });
      const shared = this.$route.query.share;
      const response = await this.$store.dispatch('get', { url: '/coursework/get', params: { coursework, shared } });
      if (response.error) {
        this.$set(this, 'loading', { status: 'failed', message: response.error._system || response.error._notification });
      } else {
        const cw = response.result[0];
        if (!cw) {
          this.$set(this, 'loading', { status: 'failed', message: 'This coursework has been deleted' });
          return;
        }
        cw.deleted = util.datetime.fromUTC(cw.deleted);
        cw.expectedDate = util.datetime.fromUTC(cw.expectedDate);
        cw.completedDate = util.datetime.fromUTC(cw.completedDate);
        cw.shared = util.datetime.fromUTC(cw.shared);
        cw.createdAt = util.datetime.fromUTC(cw.createdAt);
        cw.updatedAt = util.datetime.fromUTC(cw.updatedAt);
        cw.milestones.forEach((m) => {
          m.startedDate = util.datetime.fromUTC(m.startedDate);
          m.expectedDate = util.datetime.fromUTC(m.expectedDate);
          m.completedDate = util.datetime.fromUTC(m.completedDate);
          m.createdAt = util.datetime.fromUTC(m.createdAt);
          m.updatedAt = util.datetime.fromUTC(m.updatedAt);
        });
        this.$set(this, 'coursework', cw);
        this.formatDocumentTitle();
        this.updateCountdown();
      }
    },
    createTabs() {
      const tabs = Object.keys(this.tabs);
      _.forEach(tabs, (key) => {
        const tab = {
          click: () => this.$router.push({
            path: this.$route.path,
            params: { ...this.$route.params },
            query: { ...this.$route.query, tab: key },
          }, () => { }),
          name: `tab-${key}`,
        };
        this.$set(this.tabs, key, { ...tab, ...this.tabs[key] });
      });
    },
    isTabActive(tab) {
      const query = this.$route.query.tab || 'overview';
      return (query === tab) ? 'active' : null;
    },
    getFullDate(timestamp) {
      if (!timestamp) return null;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const date = new Date(timestamp);
      return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()} at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    updateCountdown() {
      setTimeout(this.updateCountdown, 1000);
      if (this.coursework.deleted) {
        this.$set(this.timers, 'deleted', Math.floor((this.coursework.deleted - Date.now()) / 1000));
      }
    },
    getCountdown(diff, full) {
      return util.datetime.getCountdown(diff, full);
    },
    getTotalMilestonesRatio(num) {
      if (!this.getTotalMilestones) return 0;
      return num / this.getTotalMilestones;
    },
    inviteMember() {
      this.$store.commit('openWindow', { name: 'invite-member', title: 'Invite Member', type: 'dialog', component: AddParticipant, props: { coursework: this.coursework } });
    },
    editMember(member) {
      this.$store.commit('openWindow', { name: 'edit-member', title: 'Edit Member', type: 'dialog', component: EditParticipant, props: { coursework: this.coursework, member } });
    },
    uninviteMember(member) {
      this.$store.commit('openWindow', { name: 'uninvite-member', title: 'Uninvite Member', type: 'dialog', component: DeleteParticipant, props: { coursework: this.coursework, member } });
    },
    async changeProgress(status = true) {
      const response = await this.$store.dispatch('post', { url: '/coursework/changeProgress', data: { coursework: this.coursework.id, completed: status } });
      if (response.result) {
        if (response.result.completedDate) response.result.completedDate = util.datetime.fromUTC(response.result.completedDate);
        this.$set(this, 'coursework', { ...this.coursework, ...response.result });
      }
    },
    async changeSharing(status = true) {
      const response = await this.$store.dispatch('post', { url: '/coursework/changeShared', data: { coursework: this.coursework.id, change: status } });
      if (response.result) {
        this.$set(this, 'coursework', { ...this.coursework, ...response.result });
      }
    },
    async changePrivacy(status = true) {
      const response = await this.$store.dispatch('post', { url: '/coursework/changePrivacy', data: { coursework: this.coursework.id, privacy: status } });
      if (response.result) {
        this.$set(this, 'coursework', { ...this.coursework, ...response.result });
      }
    },
    deleteCoursework() {
      this.$store.commit('openWindow', { name: 'delete-coursework', title: 'Delete Coursework', type: 'dialog', component: DeleteCoursework, props: { coursework: this.coursework } });
    },
    async restoreCoursework() {
      const response = await this.$store.dispatch('post', { url: '/coursework/delete', data: { coursework: this.coursework.id } });
      if (response.result) {
        this.$set(this.coursework, 'deleted', response.result.deleted);
      }
    },
    async copySharingLink() {
      await navigator.clipboard.writeText(this.getSharingLink);
      this.$store.commit('pushNotification', { icon: 'share', text: 'The share link has been copied to your clipboard' });
    },
  },
  watch: {
    $route(to) {
      this.formatDocumentTitle(to);
    },
    '$route.query.tab': function tabChange() {
      this.tabRKey += 1;
    },
    '$route.params.coursework': async function courseworkChange(to, from) {
      // eslint-disable-next-line eqeqeq
      if (to != from) {
        this.$set(this, 'coursework', null);
        await this.$nextTick();
        await this.loadCoursework(to);
      }
    },
    async getUser() {
      const { coursework } = this.$route.params;
      await this.loadCoursework(coursework);
    },
    'coursework.deleted': function deletedChange() {
      this.updateCountdown();
    },
    'coursework.milestones': function milestonesChanged() {
      this.milestonesRKey += 1;
    },
  },
};
</script>

<style lang="scss">
@import '~@/scss/_mixins';

.coursework-id-route {
  display: flex;
  flex-direction: column;
  margin: 15px;
  .coursework-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    transition: opacity .2s ease;
    .coursework-tabs {
      position: relative;
      display: flex;
      height: 32px;
      box-shadow: 0 1px 0 darken($color-cyan, 15%), 0 2px 0 rgba(#000, .8);
      .btn-tab {
        position: relative;
        border-radius: 10px 10px 0 0;
        pointer-events: auto;
        &.recent {
          position: absolute;
          right: 0;
        }
        &:not(:first-child).active:before {
          left: -50px;
          border-bottom-right-radius: 10px;
          box-shadow: 10px 0 0 0 darken($color-cyan, 10%), -1px 0 0 darken($color-cyan, 45%) inset;
        }
        &:not(:last-child).active:after {
          right: -50px;
          border-bottom-left-radius: 10px;
          box-shadow: -10px 0 0 0 darken($color-cyan, 10%), 1px 0 0 darken($color-cyan, 45%) inset;
        }
        &.active {
          z-index: 5;
          &:before, &:after {
            content: "";
            position: absolute;
            background-color: transparent;
            background-blend-mode: screen;
            bottom: 0;
            width: 50px;
            height: 10px;
            transition: box-shadow .2s ease;
          }
        }
      }
    }
    .coursework-content {
      flex: 1;
      display: flex;
      background-color: rgba(darken($color-cyan-d2, 4%), .6);
      .panel {
        flex: 1;
        display: flex;
        flex-flow: row wrap;
        box-sizing: border-box;
        padding: 20px 0;
        transition: opacity .2s linear;
        .subpanel {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          box-sizing: border-box;
          margin: 10px;
          padding: 10px;
          .group {
            align-self: stretch;
            display: flex;
            flex-direction: column;
          }
          .subpanel-header {
            display: flex;
            flex-direction: column;
          }
          .subpanel-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            .group { align-items: center; }
            .progress .value div {
              margin: 0 2px;
            }
          }
          .subpanel-footer {
            display: flex;
            flex-direction: column;
          }
          &.coursework-information {
            flex: 0 0 350px;
            border-right: 1px solid $color-cyan;
            .subpanel-header {
              align-items: center;
              .title, .module { font-size: 20px; }
              .title { font-weight: 700; }
              .module {
                font-weight: 600;
                color: darken($color-cyan, 20%);
              }
              .owner {
                display: flex;
                align-items: center;
                padding: 4px 8px;
                margin: 10px 0;
                border: 1px solid $color-cyan;
                border-radius: 4px;
                background-color: $color-cyan-bg;
                font-weight: 600;
                .icon-wrapper { margin-right: 5px }
              }
            }
            .subpanel-body {
              align-items: center;
              justify-content: space-around;
            }
            .subpanel-footer {
              align-self: center;
              width: 180px;
              .button-vue { margin: 4px 0; }
              .group { margin: 8px 0; }
            }
          }
          &.milestones-view {
            flex-flow: row wrap;
            transition: opacity .2s ease;
            .milestones-breakdown {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              margin-right: 10px;
              .breakdown-panel {
                display: flex;
                flex-flow: row wrap;
                .stats-wrapper {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  box-sizing: border-box;
                  margin: 10px;
                  padding: 10px;
                  border-radius: 5px;
                  background-color: rgba(#000, .4);
                  .title {
                    font-size: 20px;
                    font-weight: 600;
                    text-align: center;
                    margin-bottom: 10px;
                  }
                  .pie-group {
                    flex: 1;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, 280px);
                    justify-content: space-around;
                    align-items: center;
                  }
                }
              }
            }
            .milestones-list {
              flex: 0 0 350px;
              display: flex;
              flex-direction: column;
              box-sizing: border-box;
              padding-bottom: 10px;
              .title {
                align-self: center;
                margin: 20px 0;
              }
              .list {
                flex: 1;
                display: flex;
                flex-direction: column;
              }
              .milestones-control {
                align-self: center;
                display: flex;
                flex-direction: column;
                .button-vue {
                  width: 180px;
                  margin: 4px 0;
                }
              }
            }
          }
          &.coursework-view {
            align-self: stretch;
            min-width: 300px;
            transition: opacity .2s ease;
            .not-found {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border-radius: 5px;
              padding: 50px;
              background-color: rgba(darken($color-cyan-d2, 4%), .6);
              .message {
                font-size: 20px;
                font-weight: 600;
              }
              .button-vue {
                margin-top: 40px;
              }
            }
            .status-wrapper {
              flex: 1 0 250px;
              display: grid;
              grid-template-columns: repeat(auto-fit, 300px);
              grid-gap: 30px;
              justify-content: center;
              > * {
                &.notice {
                  color: $color-mustard;
                  box-shadow: 0 0 2px $color-mustard;
                  background-color: rgba(darken($color-mustard, 60%), .8);
                }
                &.alert {
                  color: $color-error-soft;
                  box-shadow: 0 0 2px $color-error-soft;
                  background-color: rgba(darken($color-error-soft, 60%), .8);
                }
                display: flex;
                flex-direction: column;
                height: 300px;
                padding: 10px;
                box-sizing: border-box;
                border-radius: 4px;
                box-shadow: 0 0 2px $color-cyan;
                background-color: rgba(darken($color-cyan-d2, 4%), .8);
                @include transition('color, box-shadow, background-color', .2s, ease);
                .title {
                  display: flex;
                  font-weight: 600;
                  margin-bottom: 10px;
                  > span {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    .tag {
                      margin-left: 10px;
                    }
                  }
                }
                .status-info {
                  flex: 1;
                  margin: 10px 0;
                  display: flex;
                  flex-direction: column;
                  .message {
                    font-size: 18px;
                    &.pad { margin: 8px 0; }
                  }
                  .share-token {
                    display: flex;
                    align-items: center;
                    margin: 10px 0;
                    padding: 5px 8px;
                    border: 1px solid lighten($color-cyan-d2, 10%);
                    border-radius: 2px;
                    background-color: $color-cyan-d2;
                    @include transition('background-color, border-color, text-shadow', .2s, ease);
                    cursor: pointer;
                    > span {
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      margin-right: 10px;
                    }
                    &:hover {
                      border-color: lighten($color-cyan-d2, 20%);
                      background-color: lighten($color-cyan-d2, 2%);
                      text-shadow: 0 0 1px $color-cyan;
                    }
                    @include disableSelect();
                  }
                  .v-center {
                    flex: 1;
                    align-self: center;
                    display: flex;
                    align-items: center;
                  }
                }
                .status-control {
                  align-self: center;
                  display: flex;
                  flex-direction: column;
                  .button-vue {
                    width: 180px;
                    margin: 4px 0;
                  }
                  .group-control {
                    display: flex;
                    margin: 4px 0;
                    .button-vue {
                      width: auto;
                      margin: 0 4px;
                    }
                  }
                }
              }
            }
            .access-wrapper {
              flex: 1;
              display: flex;
              flex-direction: column;
              margin-top: 20px;
              .title {
                padding-bottom: 10px;
                border-bottom: 1px solid $color-cyan;
                font-size: 30px;
                font-weight: 600;
                text-align: center;
              }
              .content {
                flex: 1;
                display: flex;
                flex-flow: row wrap;
                padding: 20px 0;
                .members {
                  flex: 1;
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                  grid-gap: 30px;
                  padding: 10px 20px;
                  overflow: auto;
                  max-height: 260px;
                  min-width: 304px;
                  .member {
                    display: flex;
                    flex-direction: column;
                    height: 250px;
                    padding: 8px;
                    border: 1px solid $color-cyan;
                    border-radius: 4px;
                    background-color: $color-cyan-d2;
                    font-weight: 600;
                    .name {
                      position: relative;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      font-size: 24px;
                      font-weight: 700;
                      span {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                      }
                      .icon-wrapper { margin-right: 8px; }
                    }
                    .group {
                      flex: 1;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                    }
                    .member-control {
                      align-self: center;
                      display: flex;
                      flex-direction: column;
                      .dialog-style {
                        padding: 4px 8px;
                        margin: 4px 0;
                      }
                    }
                  }
                }
                .access-control {
                  flex: 0 0 300px;
                  display: flex;
                  flex-direction: column;
                  border-left: 1px solid $color-cyan;
                  border-right: 1px solid $color-cyan;
                  padding: 0 20px;
                  .group-control {
                    flex: 1;
                    align-self: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    .dialog-style {
                      margin: 4px 0;
                    }
                  }
                }
                background-color: rgba(darken($color-cyan-d2, 4%), .8);
              }
            }
          }
        }
      }
    }
  }
  .loading-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    background-color: rgba(darken($color-cyan-d2, 4%), .6);
  }
}

</style>
