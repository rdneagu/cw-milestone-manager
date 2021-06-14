<template>
  <transition-group tag="div" class="notification-module" name="notificationfx">
    <div v-for="(notification) in getNotifications" :key="notification.id" class="notification" :class="notification.type">
      <Icon :name="notification.icon"></Icon>
      <span class="message">{{ notification.text }}</span>
    </div>
  </transition-group>
</template>

<script>
// import _ from 'lodash';

import Icon from '../components/Icon.component.vue';

export default {
  components: {
    Icon,
  },
  computed: {
    getNotifications() {
      return this.$store.getters.getNotifications;
    },
  },
};
</script>

<style lang="scss">
@import '@/scss/_mixins';

.notification-module {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  right: 0;
  bottom: 0;
  max-height: 192px;
  overflow: hidden;
  z-index: 100;
  .notification {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    height: 32px;
    padding: 5px 10px;
    margin: 10px;
    border: 1px solid $color-cyan-border;
    border-radius: 5px;
    background-color: rgba($color-cyan-bg, .8);
    color: $color-cyan;
    font-weight: 600;
    @include transition('height, opacity, transform', .4s, ease-in-out);
    &.alert {
      color: $color-error;
      border-color: $color-error;
      background-color: rgba(darken($color-error, 50%), .8);
    }
    &.warning {
      color: $color-error-soft;
      border-color: $color-error-soft;
      background-color: rgba(darken($color-error-soft, 55%), .8);
    }
    &.notice {
      color: $color-mustard;
      border-color: $color-mustard;
      background-color: rgba(darken($color-mustard, 55%), .8);
    }
    i {
      margin-right: 10px;
    }
  }
}
.notificationfx-enter, .notificationfx-leave-active {
  height: 0 !important;
  opacity: 0;
  transform: scale(0.2);
}
</style>
