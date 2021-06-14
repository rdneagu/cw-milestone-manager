<template>
  <div class="v-line-component-vue" :class="[ getStyle ]">
    <div class="label">
      <Icon v-if="icon" :name="icon" />{{ label }}
    </div>
    <div class="h-separator"></div>
    <div class="value"><slot></slot></div>
  </div>
</template>

<script>
import Icon from '@/components/Icon.component.vue';

export default {
  components: { Icon },
  props: ['icon', 'type', 'label'],
  computed: {
    getStyle() {
      return `${this.type || 'default'}-style`;
    },
  },
};
</script>

<style lang="scss">
.v-line-component-vue {
  display: flex;
  flex-direction: column;
  margin: 10px 0;
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
    > .icon-wrapper { margin-right: 5px; }
  }
  &.alert-style {
    color: $color-error-soft;
    .h-separator { border-color: $color-error-soft; }
  }
  &.notice-style {
    color: $color-mustard;
    .h-separator { border-color: $color-mustard; }
  }
}
</style>
