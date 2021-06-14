<template>
  <div class="search-module-vue" :class="getSearchVisibility" @click.self="toggleSearch">
    <div class="search-box">
      <div class="filter">Filter: By Title</div>
      <input id="search-input" type="text" :name="input.search.title" placeholder="type in the title of the coursework" v-model="input.search.model" />
      <Button v-bind="control.submit" :click="runSearch"></Button>
    </div>
    <Button name="toggle-search" icon="menu" type="search" :click="toggleSearch" :active="searchVisible">Search for a coursework</Button>
  </div>
</template>

<script>
import Button from '@/components/Button.component.vue';

export default {
  components: { Button },
  data() {
    return {
      input: {
        search: { name: 'title' },
      },
      control: {
        submit: { name: 'run-search', icon: 'search', type: 'plain', text: 'Search', pending: false },
      },
      searchVisible: false,
    };
  },
  computed: {
    getSearchVisibility() {
      return (this.searchVisible) ? 'is-visible' : 'is-hidden';
    },
  },
  methods: {
    toggleSearch() {
      this.$set(this, 'searchVisible', !this.searchVisible);
    },
    async runSearch() {
      if (this.control.submit.pending) return;
      this.$set(this.control.submit, 'pending', true);
      await this.$store.dispatch('getAllCourseworks', { section: 'search', search: { title: this.input.search.model } });
      this.$set(this.control.submit, 'pending', false);
      this.$router.push({ name: 'coursework', query: { tab: 'search' } }, () => {});
      this.toggleSearch();
    },
  },
};
</script>

<style lang="scss">
@import '@/scss/_mixins';

.search-module-vue {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  &.is-visible {
    background-color: rgba($color-cyan-d2, .5);
    transition: background-color .2s ease, opacity .2s ease;
    .search-box {
      height: 30px;
      transition: height .2s ease;
      > * {
        opacity: 1;
        transition: opacity .2s ease .1s;
      }
    }
  }
  &.is-hidden {
    opacity: .6;
    pointer-events: none;
    transition: background-color .2s ease .2s, opacity .2s ease;
    .search-box {
      height: 0;
      transition: height .2s ease .1s;
      > * {
        opacity: 0;
        transition: opacity .2s ease;
      }
    }
  }
  &:hover, &.is-visible { opacity: 1; }
  .search-box {
    align-self: stretch;
    display: flex;
    align-items: center;
    padding: 0 5px;
    border-top: 1px solid darken($color-cyan, 10%);
    border-bottom: 1px solid darken($color-cyan, 10%);
    background-color: darken($color-cyan, 38%);
    box-shadow: 0 1px 0 darken($color-cyan, 45%), 0 -1px 0 darken($color-cyan, 45%);
    .filter {
      flex: 0 1 15%;
      text-align: right;
      font-weight: 600;
    }
    input {
      flex: 1;
      margin: 0 10px;
      padding: 0 10px;
      border-left: 1px solid $color-cyan;
      border-right: 1px solid $color-cyan;
      background-color: darken($color-cyan, 35%);
      color: $color-cyan;
      line-height: 0;
    }
    .btn-run-search {
      padding: 0 20px;
    }
  }
  // Search toggle button edges
  > .button-vue {
    position: relative;
    border-radius: 0 0 10px 10px;
    pointer-events: auto;
    &:before, &:after {
      content: "";
      position: absolute;
      background-color: transparent;
      background-blend-mode: screen;
      top: 0;
      width: 50px;
      height: 10px;
    }
    &:before {
      left: -50px;
      border-top-right-radius: 10px;
      box-shadow: 10px 0 0 0 darken($color-cyan, 10%), -1px 0 0 darken($color-cyan, 45%) inset;
    }
    &:after {
      right: -50px;
      border-top-left-radius: 10px;
      box-shadow: -10px 0 0 0 darken($color-cyan, 10%), 1px 0 0 darken($color-cyan, 45%) inset;
    }
  }
}

</style>
