<template>
  <div class="pie-progress-component-vue" :class="[ getStyle ]">
    <svg width="100%" height="100%" viewBox="0 0 42 42">
      <circle class="background" cx="21" cy="21" r="15.91549430918954"></circle>
      <circle class="rail" cx="21" cy="21" r="15.91549430918954" stroke-width="4"></circle>
      <transition @enter="segmentEnter" appear>
        <circle class="segment complete" cx="21" cy="21" r="15.91549430918954" stroke-dasharray="100 100" stroke-dashoffset="100"></circle>
      </transition>
    </svg>
    <div class="text">
      <span class="num">{{ num }} / {{ total }}</span>
      <span class="percentage">{{ getPercentage }}%</span>
      <span class="label">{{ label }}</span>
    </div>
  </div>
</template>

<script>
import Velocity from 'velocity-animate';

export default {
  props: ['label', 'total', 'num', 'type'],
  computed: {
    getStyle() {
      return `${this.type}-style`;
    },
    getPercentage() {
      if (!this.total) return 0;
      const perc = (this.num / this.total) * 100;
      return perc.toFixed(2);
    },
    getRatioOffset() {
      const r = this.getPercentage;
      return 100 - r;
    },
  },
  methods: {
    segmentEnter(el) {
      Velocity(el, { 'stroke-dashoffset': this.getRatioOffset }, { duration: 1000, easing: 'easeOut' });
    },
  },
};
</script>

<style lang="scss">
.pie-progress-component-vue {
  position: relative;
  .text {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    .percentage { font-size: 3em; }
    .label, .num {
      color: darken($color-cyan, 20%);
      font-weight: 700;
      font-size: 2em;
    }
  }
  &.notice-style {
    .text {
      color: darken($color-mustard, 10%);
      .label, .num { color: darken($color-mustard, 30%); }
    }
    .rail { stroke: darken($color-mustard, 55%); }
    .segment.complete { stroke: darken($color-mustard, 10%); }
  }
  &.alert-style {
    .text {
      color: red;
      .label, .num { color: darken(red, 10%); }
    }
    .rail { stroke: darken(red, 40%); }
    .segment.complete { stroke: red }
  }
  svg {
    .background { fill: transparent; }
    .rail, .segment {
      stroke-width: 3px;
    }
    .rail {
      fill: transparent;
      stroke: darken($color-cyan, 35%);
    }
    .segment {
      fill: transparent;
      &.complete { stroke: $color-cyan; }
      transform-origin: center;
      transform: rotate(-90deg);
    }
  }
}
</style>
