<template>
  <div class="coursework-route">
    <div class="coursework-tabs">
      <Button v-for="(tab, key) in tabs" :key="key" class="btn-tab" v-bind="tab" type="tab" :class="[ isTabActive(key), key ]" :active="isTabActive(key)" />
    </div>
    <!-- In progress -->
    <transition name="fade" mode="out-in" appear>
      <component v-if="isTabActive('create') && getUser" :is="CourseworkCreate" :key="tabRKey" class="panel coursework-create" />
      <div v-else-if="isTabActive('progress') && getUser" :key="tabRKey" class="panel coursework-progress">
        <div class="panel-title">
          <div class="title">
            <Tag>IN PROGRESS</Tag>
          </div>
          <div class="control">
            <Button v-bind="control.refreshCoursework" />
          </div>
        </div>
        <transition name="fade" mode="out-in">
          <div class="panel-content" v-if="getMyResults" :key="contentRKey">
            <template v-if="courseworkInProgress.length > 0">
              <Coursework v-for="(coursework) in courseworkInProgress" :key="coursework.id" :data="coursework" />
            </template>
            <div v-else class="not-found">
              <span class="message">You don't have any courseworks in progress</span>
              <Button v-bind="control.startCoursework" type="dialog">Start a new coursework</Button>
            </div>
          </div>
        </transition>
      </div>
      <!-- Completed -->
      <div v-else-if="isTabActive('completed') && getUser" :key="tabRKey" class="panel coursework-completed">
        <div class="panel-title">
          <div class="title">
            <Tag>COMPLETED</Tag>
          </div>
          <div class="control">
            <Button v-bind="control.refreshCoursework" />
          </div>
        </div>
        <transition name="fade" mode="out-in">
          <div class="panel-content" v-if="getMyResults" :key="contentRKey">
            <template v-if="courseworkCompleted.length > 0">
              <Coursework v-for="(coursework) in courseworkCompleted" :key="coursework.id" :data="coursework" />
            </template>
            <div v-else class="not-found">
              <span class="message">You don't have any completed courseworks</span>
            </div>
          </div>
        </transition>
      </div>
      <!-- Search -->
      <div v-else-if="isTabActive('search')" :key="tabRKey" class="panel coursework-search">
        <div class="panel-title">
          <div class="title">
            <Tag>SEARCH RESULT</Tag>
            <Tag v-if="!searchTags">NO TAGS</Tag>
            <template v-else>
              <Tag v-for="(tag, k) in searchTags" :key="k">{{ k.toUpperCase() }}: {{ tag }}</Tag>
            </template>
          </div>
          <div class="control">
            <Button v-bind="control.clearSearch" />
            <Button v-bind="control.refreshSearch" />
          </div>
        </div>
        <transition name="fade" mode="out-in">
          <div class="panel-content" v-if="getSearchResults" :key="contentRKey">
            <template v-if="getSearchResults.length > 0">
              <Coursework v-for="(coursework, id) in getSearchResults" :key="id" :data="coursework" />
            </template>
            <div v-else class="not-found">
              <span class="message">No results found</span>
            </div>
          </div>
        </transition>
      </div>
      <!-- Recent -->
      <div v-else :key="tabRKey" class="panel coursework-recent">
        <div class="panel-title">
          <div class="title">
            <Tag>MOST RECENT</Tag>
          </div>
        </div>
        <div class="panel-content">
          <template v-if="getRecentResults.length > 0">
            <Coursework v-for="(coursework, id) in getRecentResults" :key="id" :data="coursework" />
          </template>
          <div v-else class="not-found">
            <span class="message">No public courseworks found</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import _ from 'lodash';

import Coursework from '@/components/Coursework.component.vue';
import CourseworkCreate from '@/views/coursework/CourseworkCreate.vue';
import Button from '@/components/Button.component.vue';
import Tag from '@/components/Tag.component.vue';

export default {
  components: { Coursework, Button, Tag },
  data() {
    return {
      CourseworkCreate,
      tabRKey: 0,
      contentRKey: 0,
      tabs: {
        create: { href: { name: 'coursework', query: { tab: 'create' } }, name: 'tab-create', icon: 'clipboard', text: 'Create coursework', condition: (() => this.getUser) },
        progress: { href: { name: 'coursework', query: { tab: 'progress' } }, name: 'tab-in-progress', icon: 'access_time', text: 'In progress', condition: (() => this.getUser) },
        completed: { href: { name: 'coursework', query: { tab: 'completed' } }, name: 'tab-completed', icon: 'flag', text: 'Completed', condition: (() => this.getUser) },
        search: { href: { name: 'coursework', query: { tab: 'search' } }, name: 'tab-search-result', icon: 'search', text: 'Search result', condition: (() => this.searchTags) },
        recent: { href: { name: 'coursework', query: { tab: 'recent' } }, name: 'tab-recent', icon: 'menu', text: 'Most recent' },
      },
      control: {
        startCoursework: { name: 'start-coursework', type: 'dialog', icon: 'clipboard', text: 'Start a new coursework', href: { query: { tab: 'create' } } },
        refreshSearch: { name: 'refresh-search', type: 'dialog', icon: 'repeat', text: 'Refresh', click: this.refreshSearch },
        refreshCoursework: { name: 'refresh-coursework', type: 'dialog', icon: 'repeat', text: 'Refresh', click: this.refreshCoursework },
        clearSearch: { name: 'clear-search', type: 'dialog', icon: 'close', text: 'Clear', click: this.clearSearch },
      },
    };
  },
  async mounted() {
    if (this.getUser !== undefined) {
      await this.$store.dispatch('getAllCourseworks', { section: 'recent' });
      await this.$store.dispatch('getAllCourseworks', { section: 'my' });
    }
    this.formatDocumentTitle();
  },
  computed: {
    getUser() {
      return this.$store.getters.getUser;
    },
    searchTags() {
      const search = this.$store.getters.getSearchFilter;
      const filters = _.reduce(search, (acc, val, k) => {
        if (val !== undefined) acc[k] = val;
        return acc;
      }, {});
      return _.isEmpty(filters) ? null : filters;
    },
    getMyResults() {
      return this.$store.getters.getAllCourseworks('my');
    },
    getSearchResults() {
      return this.$store.getters.getAllCourseworks('search');
    },
    getRecentResults() {
      return this.$store.getters.getAllCourseworks('recent');
    },
    courseworkInProgress() {
      if (!this.getMyResults) return null;
      return _.chain(this.getMyResults)
        .reject((c) => c.completedDate)
        .orderBy('expectedDate', 'asc')
        .value();
    },
    courseworkCompleted() {
      if (!this.getMyResults) return null;
      return _.chain(this.getMyResults)
        .filter((c) => c.completedDate)
        .orderBy('completedDate', 'desc')
        .value();
    },
  },
  methods: {
    formatDocumentTitle(route) {
      const { query = {} } = route || this.$route;
      let title = 'Milestone Manager';
      if (query.tab === 'completed') {
        title = `${title} - My Complete Courseworks`;
      } else if (query.tab === 'progress') {
        title = `${title} - My Incomplete Courseworks`;
      } else if (query.tab === 'create') {
        title = `${title} - Create Coursework`;
      } else if (query.tab === 'search') {
        title = `${title} - Search: ${(this.searchTags) ? this.searchTags.title : 'No filters'} - ${this.getSearchResults.length} results`;
      } else {
        title = `${title} - Most Recent Courseworks`;
      }
      document.title = title;
    },
    isTabActive(tab) {
      const query = this.$route.query.tab || 'recent';
      return (query === tab) ? 'active' : null;
    },
    clearSearch() {
      this.$store.commit('clearAllCourseworks', 'search');
      this.$store.commit('updateSearchFilter', null);
      this.$router.push({ name: 'coursework', query: { tab: 'recent' } }, () => {});
    },
    async refreshSearch() {
      if (this.control.refreshSearch.pending) return;
      this.$set(this.control.refreshSearch, 'pending', true);
      await this.$store.dispatch('getAllCourseworks', { section: 'search', search: this.$store.getters.getSearchFilter });
      this.$set(this.control.refreshSearch, 'pending', false);
      this.contentRKey += 1;
    },
    async refreshCoursework() {
      if (this.control.refreshCoursework.pending) return;
      this.$set(this.control.refreshCoursework, 'pending', true);
      await this.$store.dispatch('getAllCourseworks', { section: 'my' });
      this.$set(this.control.refreshCoursework, 'pending', false);
      this.contentRKey += 1;
    },
  },
  watch: {
    $route(to) {
      this.formatDocumentTitle(to);
    },
    '$route.query.tab': function tabChange() {
      this.tabRKey += 1;
    },
    async getUser(to) {
      await this.$store.dispatch('getAllCourseworks', { section: 'recent' });
      if (to) {
        await this.$store.dispatch('getAllCourseworks', { section: 'my' });
        this.$router.push({ name: 'coursework', query: { tab: 'progress' } }, () => {});
      } else {
        this.$store.commit('clearAllCourseworks', 'my');
        this.$router.push({ name: 'coursework', query: { tab: 'recent' } }, () => {});
      }
    },
  },
};
</script>

<style lang="scss">
@import '~@/scss/_mixins';

.coursework-route {
  display: flex;
  flex-direction: column;
  margin: 15px;
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
  .panel {
    box-sizing: border-box;
    padding: 15px 0;
    transition: opacity .2s ease;
    .panel-content {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      height: 739px;
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
    }
    .panel-title {
      display: flex;
      align-items: center;
      position: relative;
      margin-bottom: 10px;
      .title {
        flex: 1;
        display: flex;
        align-items: center;
        font-weight: 600;
      }
      .control {
        display: flex;
        .button-vue {
          margin: 0 5px;
          .dialog-style {
            padding: 6px 12px;
          }
        }
      }
    }
    .coursework {
      background-color: rgba(darken($color-cyan-bg, 4%), .8);
      padding: 10px;
      margin: 4px 0;
    }
  }
}

</style>
