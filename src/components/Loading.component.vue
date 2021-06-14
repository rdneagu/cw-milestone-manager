<template>
  <div v-if="status !== 'success'" class="loading-component-vue" :class="[ hasFailed ]">
    <template>
      <div v-if="status === 'pending'" class="loading-nest"></div>
      <Icon v-else-if="status === 'failed'" name="warning" class="loading-fail" />
    </template>
    <span class="loading-text">{{ message }}</span>
  </div>
</template>

<script>
import Icon from '@/components/Icon.component.vue';

export default {
  components: { Icon },
  props: ['status', 'message'],
  computed: {
    hasFailed() {
      return (this.status === 'failed') ? 'error' : null;
    },
  },
};
</script>

<style lang="scss">
.loading-component-vue {
  display: grid;
  grid-row-gap: 10px;
  justify-items: center;
  &.error {
    color: $color-error-soft;
  }
  .loading-fail {
    font-size: 50px;
  }
  .loading-nest {
    position: relative;
    display: block;
    height: 50px;
    width: 50px;
    border: 2px solid transparent;
    border-top-color: $color-cyan;
    border-radius: 50%;
    animation: nestSpin 1.5s ease infinite;
    &:before, &:after {
      content: "";
      position: absolute;
      border: 2px solid transparent;
      border-radius: 50%;
      border-top-color: $color-cyan;
    }
    &:before {
      top: 7px;
      right: 7px;
      bottom: 7px;
      left: 7px;
      animation: nestSpin 3s linear infinite;
    }
    &:after {
      top: 15px;
      right: 15px;
      bottom: 15px;
      left: 15px;
      animation: nestSpin 1.5s ease infinite;
    }
  }
  .loading-text {
    font-weight: 600;
    animation: fadeInOut 2s ease infinite;
  }
}
</style>
