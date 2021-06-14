<template>
  <transition name="css-animation" appear>
    <div v-show="isVisible" class="sidebar-module-vue">
      <div v-if="getUser" class="sidebar">
        <div class="profile">
          <div class="avatar">
            <div class="image"></div>
          </div>
          <div class="data">
            <span class="username">{{ getUser.username }}</span>
            <span class="email">{{ getUser.email }}</span>
          </div>
        </div>
        <Button name="switch-account" icon="repeat" type="dialog" :click="switchAccount">Switch account</Button>
        <div v-if="loading.status !== 'success'" class="sidebar-loading">
          <Loading v-bind="loading" />
        </div>
        <template v-else>
          <template v-if="courseworks.length">
            <SidebarPanel name="coursework" title="IN PROGRESS" :component="Coursework" :data="courseworkInProgress" :expanded="true" />
            <SidebarPanel name="coursework" title="COMPLETED" :component="Coursework" :data="courseworkCompleted" />
          </template>
          <template v-else>
            <div class="not-found">
              <Icon name="notice" />No courseworks found
            </div>
            <Button name="start-coursework" icon="clipboard" type="dialog" :href="{ name: 'coursework', query: { tab: 'create' } }">Start a new coursework</Button>
          </template>
        </template>
      </div>
    </div>
  </transition>
</template>

<script>
import _ from 'lodash';

import Auth from '../components/windows/Auth.window.vue';
import Loading from '../components/Loading.component.vue';
import SidebarPanel from '../components/sidebar/SidebarPanel.sidebar.vue';
import Coursework from '../components/Coursework.component.vue';
import Button from '../components/Button.component.vue';
import Icon from '../components/Icon.component.vue';

export default {
  components: { Loading, SidebarPanel, Button, Icon },
  data() {
    return {
      Coursework,
      courseworks: [],
      loading: { status: 'success' },
    };
  },
  computed: {
    getUser() {
      return this.$store.getters.getUser;
    },
    isVisible() {
      return this.$store.getters.getSidebarVisibility;
    },
    courseworkInProgress() {
      return _.chain(this.courseworks)
        .reject((c) => c.completedDate)
        .orderBy('expectedDate', 'asc')
        .map((cw) => ({
          data: cw,
          compact: true,
        }))
        .value();
    },
    courseworkCompleted() {
      return _.chain(this.courseworks)
        .filter((c) => c.completedDate)
        .orderBy('completedDate', 'desc')
        .map((cw) => ({
          data: cw,
          compact: true,
        }))
        .value();
    },
  },
  methods: {
    switchAccount() {
      this.$store.commit('setSidebarVisibility', false);
      this.$store.dispatch('deauthenticate');
      this.$store.commit('openWindow', { name: 'Login', component: Auth, type: 'fullscreen' });
    },
    async loadCourseworks() {
      this.loading = { status: 'pending', message: 'Loading courseworks' };
      setTimeout(async () => {
        const courseworks = await this.$store.dispatch('getAllCourseworks', { section: 'my', brief: true });
        this.courseworks = courseworks.data.result;
        this.loading = { status: 'success' };
      }, 2000);
    },
  },
  watch: {
    async isVisible(to) {
      if (!to || this.isLoading) return;
      await this.loadCourseworks();
    },
  },
};
</script>

<style lang="scss">
@import '~@/scss/_mixins';

.sidebar-module-vue {
  grid-area: sidebar;
  position: relative;
  display: flex;
  width: 350px;
  background-color: rgba($color-cyan-bg, .9);
  box-shadow: -4px -4px 20px rgba(#000, .5);
  @include transition('width, opacity', .4s);

  .sidebar-loading {
    align-self: flex-start;
    min-width: 350px;
    margin: 40px 0;
  }

  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 40px 0;
    font-weight: 600;
    .icon-wrapper {
      font-size: 50px;
      margin-bottom: 10px;
    }
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 350px;
    transition: opacity .4s ease .1s;

    .profile {
      align-self: stretch;
      display: grid;
      grid-auto-flow: row;
      grid-row-gap: 10px;
      align-items: center;
      justify-items: center;
      padding: 20px;
      background: linear-gradient(to bottom, darken($color-cyan, 10%), darken($color-cyan, 20%));
      border-bottom: 1px solid $color-cyan;
      color: $color-cyan-bg;

      .avatar {
        width: 96px;
        height: 96px;
        padding: 2px;
        border: 2px solid $color-cyan-bg;
        border-radius: 50%;
        background: url('../assets/images/bg-4.jpg') no-repeat center center / cover;
      }

      .data {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        color: lighten($color-cyan, 30%);
      }
    }
    .btn-switch-account {
      margin: 20px 0;
    }
  }
}

.sidebar-module-vue.css-animation-leave-to {
  @include transition('width, opacity', .4s, 'ease', .1s);
  .sidebar { transition: opacity .4s ease; }
}
.sidebar-module-vue.css-animation-enter, .sidebar-module-vue.css-animation-leave-to {
  width: 0;
  opacity: 0;
  .sidebar { opacity: 0; }
}
</style>
