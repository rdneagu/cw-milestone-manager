<template>
  <div class="tag-component-vue">
    <div class="tag" :class="[ getStyle, isClickable ]" @click.stop="OnTagClick">
      <Icon v-if="icon" :name="icon" />
      <div v-if="icon && (text || $slots.default)" class="spacer"></div>
      <span v-if="text || $slots.default" class="text"><slot>{{ this.text }}</slot></span>
      <Icon v-if="remove" name="close" class="remove" @click.native.stop="OnTagRemove"/>
    </div>
  </div>
</template>

<script>
import Icon from '@/components/Icon.component.vue';

export default {
  components: { Icon },
  props: ['text', 'icon', 'type', 'click', 'remove'],
  computed: {
    isClickable() {
      return (this.click) ? 'pointer' : null;
    },
    getStyle() {
      return `${this.type}-style`;
    },
  },
  methods: {
    OnTagClick() {
      if (typeof (this.click) !== 'function') return false;
      return this.click();
    },
    OnTagRemove() {
      if (typeof (this.remove) !== 'function') return false;
      return this.remove();
    },
  },
};
</script>

<style lang="scss">
@import '@/scss/_mixins';

.tag-component-vue {
  position: relative;
  .tag {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    margin: 0 4px;
    border-radius: 2px;
    background: linear-gradient(to bottom, darken($color-cyan, 15%), darken($color-cyan, 20%));
    background-blend-mode: screen;
    color: lighten($color-cyan, 40%);
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(black, .8), 0 0 1px 1px rgba(white, .15) inset;
    @include transition('background-color, border', .2s, ease);
    &.pointer {
      cursor: pointer;
      &:hover {
        background-color: darken($color-cyan, 30%);
        border-color: $color-cyan;
      }
    }

    .icon-wrapper { order: 1; }
    .text {
      flex: 1;
      order: 3;
    }
    .spacer {
      order: 2;
      margin: 0 4px;
    }
    .remove {
      order: 5;
      margin-left: 5px;
      cursor: pointer;
    }

    &.inversed {
      .text { order: 1; }
      .icon-wrapper { order: 3; }
    }

    &.alert-style {
      color: lighten(#dd4a36, 40%);
      background: linear-gradient(to bottom, #dd4a36, darken(#dd4a36, 10%));
    }
    &.notice-style {
      color: lighten($color-mustard, 40%);
      background: linear-gradient(to bottom, darken($color-mustard, 35%), darken($color-mustard, 40%));
    }
  }
}
</style>
