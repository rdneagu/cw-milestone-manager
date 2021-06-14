<template>
  <router-link :to="{ name: 'courseworkView', params: { coursework: coursework.id } }" v-if="!isDeleted" class="coursework-component-vue" :class="[ getCompactStyle ]">
    <template v-if="compact">
      <div class="coursework-title">
        <div class="name">{{ coursework.title }}</div>
        <div class="module">{{ coursework.module }}</div>
      </div>
      <div class="coursework-status">
        <Icon v-if="coursework.privacy" name="eye-blocked" class="is-private" v-tooltip="{ text: 'Private' }"/>
        <Icon v-if="coursework.shared" name="share" class="is-shared" v-tooltip="{ text: 'Share' }" @click.native.prevent="getSharedLink"/>
        <Icon v-if="coursework.owner === getUser.id" name="crown" class="is-owner" />
      </div>
      <div class="coursework-time">
        <div v-if="coursework.deleted" class="delete">
          <Icon name="trash" />
          <span class="time">{{ this.getCountdown(timers.deleted) }}</span>
        </div>
        <div class="deadline" :class="[ getStatusColor ]">
          <Icon :name="getStatusIcon" class="status" />
          <span class="time">{{ getCompletedDate || this.getCountdown(timers.expectedDate, true) }}</span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="coursework-title">
        <div class="name"><Icon name="document" />{{ coursework.title }}</div>
        <div class="module"><Icon name="spacer" />{{ coursework.module }}</div>
        <div class="owner">
          <Icon name="crown" />{{ coursework.ownerName }}
        </div>
      </div>
      <div class="coursework-status">
        <div class="tags">
          <Tag v-if="coursework.shared" icon="share" type="inversed default" v-tooltip="{ text: 'Share' }" @click.native.prevent="getSharedLink">SHAREABLE</Tag>
          <Tag v-if="coursework.privacy" icon="eye-blocked" type="inversed alert">PRIVATE</Tag>
        </div>
      </div>
      <div class="tab coursework-deadline" :class="[ getStatusColor ]">
        <div class="label"><Icon :name="getStatusIcon" class="status" />{{ getDeadlineText }}</div>
        <div class="h-separator"></div>
        <div class="value">{{ getCompletedDate || this.getCountdown(timers.expectedDate, true) }}</div>
      </div>
      <div class="tab coursework-participants">
        <div class="label"><Icon name="person" />PARTICIPANTS</div>
        <div class="h-separator"></div>
        <div class="value">
          <Icon v-for="i in coursework.participantsNumber" :key="i" name="person" :class="[ highlightSelfParticipant(i) ]" v-tooltip="{ text: getParticipantsTooltip(i) }" />
        </div>
      </div>
      <div class="tab coursework-milestones">
        <div class="label"><Icon name="progress" />PROGRESS</div>
        <div class="h-separator"></div>
        <div class="value">
          <div v-if="getMilestonesTotal" class="milestones-completed">{{ getMilestonesComplete }}</div>
          <div v-if="getMilestonesTotal" class="milestones-separator">/</div>
          <div class="milestones-total">{{ getMilestonesTotal || 'No milestones' }}</div>
          <div v-if="getMilestonesTotal" class="milestones-ratio">{{ getMilestonesRatio }}</div>
        </div>
      </div>
      <div v-if="timers.deleted" class="tab coursework-deleted">
        <div class="label"><Icon name="trash" />DELETED</div>
        <div class="h-separator"></div>
        <div class="value">{{ this.getCountdown(timers.deleted) }}</div>
      </div>
    </template>
  </router-link>
</template>

<script>
import util from '@/lib/general';

import Tag from '@/components/Tag.component.vue';
import Icon from '@/components/Icon.component.vue';

export default {
  components: { Tag, Icon },
  props: ['data', 'compact'],
  data() {
    return {
      coursework: this.data,
      timers: {
        expectedDate: null,
        deleted: null,
      },
    };
  },
  async created() {
    this.coursework.deleted = util.datetime.fromUTC(this.coursework.deleted);
    this.coursework.expectedDate = util.datetime.fromUTC(this.coursework.expectedDate);
    this.coursework.completedDate = util.datetime.fromUTC(this.coursework.completedDate);
    this.coursework.shared = util.datetime.fromUTC(this.coursework.shared);
    this.updateCountdown();
  },
  computed: {
    getUser() {
      return this.$store.getters.getUser;
    },
    getStatusIcon() {
      return this.getStatus.icon;
    },
    getStatusColor() {
      return this.getStatus.status;
    },
    getStatus() {
      if (this.coursework.completedDate) {
        if (this.coursework.completedDate > this.coursework.expectedDate) {
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
    isDeleted() {
      return (this.timers.deleted && this.timers.deleted <= 0);
    },
    getDeadlineText() {
      return (this.coursework.completedDate) ? 'COMPLETED' : 'DEADLINE';
    },
    getCompactStyle() {
      return (this.compact) ? 'compact' : null;
    },
    getCompletedDate() {
      if (!this.coursework.completedDate) {
        return false;
      }
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const date = new Date(this.coursework.completedDate);
      return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
    },
    getMilestonesTotal() {
      return (this.coursework.milestoneIncomplete || 0) + this.getMilestonesComplete;
    },
    getMilestonesComplete() {
      return (this.coursework.milestoneComplete || 0);
    },
    getMilestonesRatio() {
      const r = Math.floor((this.getMilestonesComplete / this.getMilestonesTotal) * 100);
      return (this.getMilestonesTotal) ? `(${r}%)` : null;
    },
  },
  methods: {
    updateCountdown() {
      setTimeout(this.updateCountdown, 1000);
      this.$set(this.timers, 'expectedDate', Math.floor((this.coursework.expectedDate - Date.now()) / 1000));
      if (this.coursework.deleted) {
        this.$set(this.timers, 'deleted', Math.floor((this.coursework.deleted - Date.now()) / 1000));
      }
    },
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
    getParticipantsTooltip(i) {
      return (this.coursework.participants) ? this.coursework.participants[i - 1].username : null;
    },
    highlightSelfParticipant(i) {
      if (!this.coursework.participants || !this.getUser) return null;
      return (this.coursework.participants[i - 1].id === this.getUser.id) ? 'highlight' : null;
    },
    async getSharedLink(ev) {
      ev.stopImmediatePropagation();
      const path = this.$router.resolve({ name: 'courseworkView', params: { coursework: this.coursework.id } }).href;
      await navigator.clipboard.writeText(`${window.location.origin}${path}?share=${this.coursework.sharedToken}`);
      this.$store.commit('pushNotification', { icon: 'share', text: 'The share link has been copied to your clipboard' });
    },
  },
};
</script>

<style lang="scss">
@import '@/scss/_mixins';

.coursework-component-vue {
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
  &.compact {
    grid-template-columns: 1fr auto;
    grid-template-rows: 1fr auto;
    grid-template-areas: "title status"
                         "time time";
    grid-column-gap: 10px;
    height: 80px;
    .coursework-title { grid-area: title };
    .coursework-status { grid-area: status };
    .coursework-time { grid-area: time };
  }
  &:not(.compact) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr auto;
    grid-template-areas: "title title status status"
                         "deadline participants milestones deleted";
    grid-column-gap: 10px;
    height: 160px;
    border-radius: 4px;
    .coursework-title {
      grid-area: title;
      font-size: 18px;
      .icon-wrapper {
        display: flex;
        justify-content: center;
        width: 18px;
        margin-right: 10px;
        font-size: 16px;
      }
      .owner {
        display: flex;
        align-items: center;
        font-weight: 600;
        margin: 10px 0;
      }
    }
    .coursework-status {
      grid-area: status;
      justify-self: right;
      font-size: 14px;
      font-weight: 600;
      .tags {
        display: flex;
        align-items: center;
      }
    }
    .tab {
      justify-self: center;
      display: flex;
      flex-direction: column;
      width: 200px;
      &.coursework-deadline { grid-area: deadline; }
      &.coursework-participants { grid-area: participants; }
      &.coursework-milestones {
        grid-area: milestones;
        .value div { margin: 0 2px; }
      }
      &.coursework-deleted {
        grid-area: deleted;
        color: $color-error-soft;
        .h-separator { border-color: $color-error-soft; }
      }
      .h-separator {
        align-self: stretch;
        margin: 5px 0;
        border-bottom: 2px solid $color-cyan;
        box-shadow: 0 2px 0 rgba($color-cyan-d2, .8);
      }
      .label, .value {
        padding: 0 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        .icon-wrapper { margin-right: 5px; }
      }
    }
  }
  &:hover {
    background-color: rgba($color-cyan-bg, .9);
    border-color: darken($color-cyan, 20%);
  }
  .soon {
    color: $color-mustard !important;
    .h-separator { border-color: $color-mustard !important; }
  }
  .late {
    color: $color-error-soft !important;
    .h-separator { border-color: $color-error-soft !important; }
  }
}

.coursework-title {
  overflow: hidden;
  .module, .name {
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .name { font-weight: 700; }
}

.coursework-status {
  align-self: start;
  display: flex;
  align-items: center;
  > * { margin: 0 4px; }
}

.coursework-time {
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
    &.delete {
      color: $color-error-soft;
      justify-self: left;
    }
  }
}
</style>
