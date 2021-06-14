<template>
  <div class="milestone-component-vue">
    <div class="milestone-title">
      <div class="name">{{ milestone.title }}</div>
    </div>
    <div class="milestone-status">
      <template v-if="isOwner && !coursework.completedDate">
        <Button v-for="(button, id) in control" :key="id" v-bind="button" />
      </template>
    </div>
    <div class="milestone-time">
      <div class="started" :class="[ getStartedStatus.status ]">
        <Icon :name="getStartedStatus.icon" class="status" />
        <span class="time">{{ getStartedDate || this.getCountdown(timers.startedDate) }}</span>
      </div>
      <div v-if="!timers.startedDate || milestone.completedDate" class="deadline" :class="[ getDeadlineStatus.status ]">
        <Icon :name="getDeadlineStatus.icon" class="status" />
        <span class="time">{{ getCompletedDate || this.getCountdown(timers.expectedDate, true) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import util from '@/lib/general';

import Button from '@/components/Button.component.vue';
import Icon from '@/components/Icon.component.vue';

import DeleteMilestone from '@/components/windows/DeleteMilestone.window.vue';

export default {
  components: { Button, Icon },
  props: ['data'],
  data() {
    return {
      coursework: this.data.coursework,
      milestone: this.data.milestone,
      timers: {
        startedDate: null,
        expectedDate: null,
      },
      control: {
        continueMilestone: { name: 'continue-milestone', type: 'notice dialog', text: 'Continue', icon: 'restore', click: () => this.changeProgress(false), condition: () => this.milestone.completedDate },
        finishMilestone: { name: 'finish-milestone', type: 'dialog', text: 'Finish', icon: 'flag', click: () => this.changeProgress(true), condition: () => !this.milestone.completedDate },
        editMilestone: { name: 'edit-milestone', type: 'dialog', icon: 'edit', href: { name: 'milestoneEdit', params: { coursework: this.$route.params.coursework, milestoneId: this.data.milestone.id }, query: { ...this.$route.query, tab: 'overview' } }, condition: () => !this.milestone.completedDate },
        deleteMilestone: { name: 'delete-milestone', type: 'alert dialog', icon: 'trash', click: () => this.deleteMilestone(), condition: () => !this.milestone.completedDate },
      },
    };
  },
  async created() {
    this.milestone.startedDate = util.datetime.fromUTC(this.milestone.startedDate);
    this.milestone.expectedDate = util.datetime.fromUTC(this.milestone.expectedDate);
    this.updateCountdown();
  },
  computed: {
    getUser() {
      return this.$store.getters.getUser;
    },
    isOwner() {
      return (this.getUser && this.getUser.id === this.coursework.owner);
    },
    isCourseworkCompleted() {
      return this.coursework.completedDate;
    },
    getDeadlineStatus() {
      if (this.milestone.completedDate) {
        if (this.milestone.completedDate > this.milestone.expectedDate) {
          return { icon: 'flag', status: 'late' };
        }
        return { icon: 'flag', status: 'completed' };
      }
      if (this.timers.expectedDate < 0) {
        return { icon: 'warning', status: 'late' };
      }
      if (this.timers.expectedDate < 86400) {
        return { icon: 'notice', status: 'soon' };
      }
      return { icon: 'access_time', status: 'on-time' };
    },
    getStartedStatus() {
      if (this.timers.startedDate > 86400) {
        return { icon: 'calendar', status: 'on-time' };
      }
      if (this.timers.startedDate > 0) {
        return { icon: 'calendar', status: 'soon' };
      }
      return { icon: 'calendar', status: 'on-time' };
    },
    getCompletedDate() {
      if (!this.milestone.completedDate) {
        return false;
      }
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const date = new Date(this.milestone.completedDate);
      return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
    },
    getStartedDate() {
      if (Date.now() < this.milestone.startedDate) {
        return false;
      }
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const date = new Date(this.milestone.startedDate);
      return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
    },
  },
  methods: {
    updateCountdown() {
      setTimeout(this.updateCountdown, 1000);
      this.$set(this.timers, 'expectedDate', Math.floor((this.milestone.expectedDate - Date.now()) / 1000));
      if (this.milestone.startedDate >= Date.now()) {
        this.$set(this.timers, 'startedDate', Math.floor((this.milestone.startedDate - Date.now()) / 1000));
      }
    },
    getCountdown(diff) {
      const absoluteDiff = Math.abs(diff);
      const seconds = Math.floor(absoluteDiff % 60).toString();
      const minutes = Math.floor((absoluteDiff / 60) % 60).toString();
      const hours = Math.floor((absoluteDiff / 3600) % 24).toString();
      const days = Math.floor(absoluteDiff / 86400).toString();
      return `${days.padStart(2, '0')}:${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    },
    deleteMilestone() {
      this.$store.commit('openWindow', { name: 'delete-milestone', title: 'Delete Milestone', type: 'dialog', component: DeleteMilestone, props: { coursework: this.data.coursework, milestone: this.data.milestone } });
    },
    async changeProgress(completed) {
      const response = await this.$store.dispatch('post', { url: '/milestone/changeProgress', data: { coursework: this.coursework.id, milestone: this.milestone.id, completed } });
      if (response.result) {
        if (response.result.completedDate) response.result.completedDate = util.datetime.fromUTC(response.result.completedDate);
        const id = _.findIndex(this.coursework.milestones, (m) => m.id === this.milestone.id);
        this.coursework.milestones.splice(id, 1, { ...this.coursework.milestones[id], ...response.result });
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/scss/_mixins';

.milestone-component-vue {
  position: relative;
  display: grid;
  box-sizing: border-box;
  margin: 4px 0;
  &:first-child {
    margin-top: 0;
    border-top: none;
  }
  &:last-child { margin-bottom: 0; }
  padding: 10px;
  border: 1px solid;
  border-color: transparent;
  background-color: rgba(darken($color-cyan-bg, 4%), .8);
  overflow: hidden;
  @include transition('border-color, background-color', .2s, ease);

  grid-template-columns: 1fr auto;
  grid-template-rows: 1fr auto;
  grid-template-areas: "title status"
                        "time time";
  grid-column-gap: 10px;
  min-height: 80px;
  .milestone-title { grid-area: title; }
  .milestone-status { grid-area: status; }
  .milestone-time { grid-area: time; }
  &:hover {
    background-color: rgba($color-cyan-bg, .9);
    border-color: darken($color-cyan, 20%);
  }
  .soon { color: $color-mustard !important; }
  .late { color: $color-error-soft !important; }

  .dialog-style {
    padding: 2px 6px;
  }
  .btn-edit-milestone, .btn-delete-milestone {
    margin: 0 4px;
    .icon-wrapper { margin: 0; }
  }

  .milestone-title {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    .name {
      display: flex;
      align-items: center;
      font-weight: 700;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .milestone-status {
    align-self: start;
    display: flex;
    align-items: center;
  }

  .milestone-time {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    margin-top: 10px;
    > div {
      display: flex;
      align-items: center;
      font-weight: 600;
      .icon-wrapper { margin-right: 5px; }
      &.deadline { justify-self: right; }
      &.started { justify-self: left; }
    }
  }
}
</style>
