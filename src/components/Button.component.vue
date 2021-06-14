<template>
  <div v-if="isCondition" class="button-vue">
    <router-link v-if="href" :to="href" class="button" :class="[ getName, getStyle, isActive ]">
      <Icon v-if="icon" :name="icon"></Icon>
      <span v-if="text || $slots.default" class="text"><slot>{{ this.text }}</slot></span>
    </router-link>
    <div v-else class="button" :class="[ getName, getStyle, isDisabled, isActive ]" @click.capture="OnButtonClick">
      <Icon v-if="icon" :name="isPending"></Icon>
      <span v-if="text || $slots.default" class="text"><slot>{{ this.text }}</slot></span>
    </div>
  </div>
</template>

<script>
import Icon from './Icon.component.vue';

export default {
  props: ['name', 'href', 'type', 'icon', 'text', 'click', 'disabled', 'active', 'pending', 'condition'],
  components: { Icon },
  computed: {
    getName() {
      return `btn-${this.name}`;
    },
    getStyle() {
      return `${this.type}-style`;
    },
    isActive() {
      return (this.active || this.$route.path.slice(1) === this.href) ? 'active' : false;
    },
    isDisabled() {
      return this.disabled ? 'disabled' : null;
    },
    isPending() {
      return (this.pending ? 'spinner-quad' : this.icon);
    },
    isCondition() {
      if (typeof (this.condition) !== 'function') return true;
      return this.condition();
    },
  },
  methods: {
    async OnButtonClick() {
      if (typeof (this.click) !== 'function' || this.disabled) return false;
      return this.click();
    },
  },
};
</script>

<style lang="scss">
@import '@/scss/_mixins.scss';

.button-vue {
  position: relative;
  .button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-cyan;
    word-wrap: nowrap;
    cursor: pointer;
    .text {
      font-weight: 600;
      text-align: center;
    }
    .icon-wrapper {
      position: relative;
      margin: 0 8px 0 0; // Add spacing between icon and text on the right side of the icon [ICON  TEXT]
    }
    &.inversed {
      .text { order: 1 };
      .icon-wrapper {
        order: 2;
        margin: 0 0 0 8px; // Add spacing between icon and text on the left side of the icon [TEXT  ICON]
      }
    }
    &.disabled {
      cursor: default;
      opacity: .4;
    }
    @include disableSelect();
  }

  .bzard-style {
    padding: 6px 16px;
    background-color: darken($color-cyan, 30%);
    color: lighten($color-cyan, 20%);
    box-shadow: 0 1px 1px rgba(black, .3), 0 0 1px 1px rgba(white, .15) inset;
    @include transition('background-color, box-shadow', .2s, ease);
    &:not(.disabled) {
      &.is-active, &:hover {
        background-color: darken($color-cyan, 25%);
      }
    }
  }

  .dialog-style {
    padding: 8px 20px;
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
    border-radius: 3px;
    background: linear-gradient(to bottom, darken($color-cyan, 10%), darken($color-cyan, 20%));
    background-blend-mode: screen;
    color: lighten($color-cyan, 40%);
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(black, .8), 0 0 1px 1px rgba(white, .15) inset;
    @include transition('background-color, border', .2s, ease);
    &:not(.disabled) {
      &.is-active, &:hover {
        background-color: darken($color-cyan, 35%);
        border-color: $color-cyan;
      }
    }
    &.notice {
      background: linear-gradient(to bottom, darken($color-mustard, 30%), darken($color-mustard, 40%));
      color: lighten($color-mustard, 40%);
      &:hover:not(.disabled) {
        background-color: darken($color-mustard, 60%);
        border-color: $color-mustard;
      }
    }
    &.google, &.alert {
      background: linear-gradient(to bottom, #dd4a36, darken(#dd4a36, 10%));
      color: lighten(#dd4a36, 40%);
      &:hover:not(.disabled) {
        background-color: darken(#c93737, 35%);
        border-color: #c93737;
      }
    }
    &.facebook {
      background: linear-gradient(to bottom, #7289da, darken(#7289da, 10%));
      color: lighten(#7289da, 40%);
      &:hover:not(.disabled) {
        background-color: darken(#7289da, 35%);
        border-color: #7289da;
      }
    }
  }

  .search-style {
    padding: 8px 20px;
    border-radius: 0 0 6px 6px;
    background: linear-gradient(to bottom, darken($color-cyan, 10%), darken($color-cyan, 20%));
    background-blend-mode: screen;
    color: lighten($color-cyan, 40%);
    box-shadow: 0 1px 0 rgba(black, .8);
    @include transition('background-color, border', .2s, ease);
    z-index: 1;
    &:before {
      content: "";
      position: absolute;
      top: 8px;
      bottom: 0;
      left: 0;
      right: 0;
      border-radius: 0 0 6px 6px;
      box-shadow: 1px 0 0 darken($color-cyan, 45%), -1px 0 0 darken($color-cyan, 45%);
    }
    &:not(.disabled) {
      &.active, &:hover {
        background-color: darken($teal, 35%);
        border-color: $color-cyan;
      }
    }
  }

  .tab-style {
    padding: 8px 20px;
    border-radius: 6px 6px 0 0;
    background: linear-gradient(to bottom, darken($color-cyan, 10%), darken($color-cyan, 20%));
    background-blend-mode: screen;
    color: lighten($color-cyan, 40%);
    box-shadow: 0 -1px 0 rgba(black, .8);
    @include transition('background-color, border', .2s, ease);
    z-index: 1;
    &:before {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      border-radius: 6px 6px 0 0;
      box-shadow: -1px 0 0 darken($color-cyan, 45%), 1px 0 0 darken($color-cyan, 45%);
    }
    &.active {
      &:before {
        bottom: 8px;
      }
    }
    &:not(.disabled) {
      &.active, &:hover {
        background-color: darken($teal, 30%);
        border-color: $color-cyan;
      }
    }
  }

  .plain-style {
    padding: 10px;
    @include transition('color', .2s, ease);
    &:hover, &.active { color: lighten($color-cyan, 20%); }
  }

  .icon-style {
    .icon-wrapper { margin: 0; }
    @include transition('color', .2s, ease);
    &:hover, &.active { color: lighten($color-cyan, 20%); }
  }

  .header-style {
    padding: 8px 10px;
    font-size: 18px;
    @include transition('color, background-color', .2s, ease);
    &:hover, &.active { color: lighten($color-cyan, 20%); }
    &.active { background-color: rgba($color-cyan-bg, .3); }
  }

  .expand-style {
    padding: 4px 12px;
    .text { flex: 1; }
    @include transition('color, background-color', .2s, ease);
    &:hover, &.active {
      color: lighten($color-cyan, 20%);
      background-color: rgba($color-cyan, .2);
    }
  }
}
</style>
