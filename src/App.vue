<template>
  <div id="app">
    <Search />
    <Header />
    <transition name="fade" mode="out-in">
      <router-view class="page" />
    </transition>
    <Sidebar />
    <Overlay />
    <Notification />
    <Tooltip />
  </div>
</template>

<script>
import axios from 'axios';

import Search from './modules/Search.module.vue';
import Header from './modules/Header.module.vue';
import Sidebar from './modules/Sidebar.module.vue';
import Overlay from './modules/Overlay.module.vue';
import Notification from './modules/Notification.module.vue';
import Tooltip from './modules/Tooltip.module.vue';

import Auth from './components/windows/Auth.window.vue';

export default {
  components: { Search, Header, Overlay, Notification, Tooltip, Sidebar },
  async created() {
    await this.trySession();
    await this.$nextTick();
    if (!this.$store.getters.getUser && this.$route.query.recovery) {
      this.$store.commit('openWindow', { name: 'Recovery', component: Auth, type: 'fullscreen' });
    }
  },
  methods: {
    async trySession() {
      const response = await axios.get('/user/session');
      this.$store.commit('authenticate', response.data.result || null);
    },
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Open+Sans:400,600,700&display=swap");
@import url('https://fonts.googleapis.com/css?family=Titillium+Web:300,400,600,700,900&display=swap');
@import './scss/_animations';
@import './scss/_normalize';
@import './scss/_mixins';

html, body, #app {
  min-height: 100vh;
}

input, textarea {
  border: none;
  background: none;
  outline: none;
  overflow: hidden;
}

a {
  text-decoration: none !important;
  color: $color-cyan;

  transition: color .15s linear, text-shadow .15s linear, background-color .15s linear;
  cursor: pointer;

  &:hover:not(.icon):not(.button):not(.logo-wrapper):not(.coursework):not(.coursework-component-vue):not(.milestone-component-vue) {
    color: lighten($color-cyan, 20%);
    text-shadow: 0 0 1px $color-cyan !important;
  }
}

#app {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: 100px 1fr;
  grid-template-areas: "header header"
                       "view sidebar";
  background: $color-cyan-bg;
  background: radial-gradient(rgba(#000, .6), rgba(#000, .8)),
              url('./assets/images/bg-4.jpg') center center / cover no-repeat fixed;
  font-family: "Titillium Web", "Open Sans", Helvetica, Arial, sans-serif;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-shadow: 1px 1px 1px #000;
  color: $color-cyan;
  overflow: hidden;
  .page {
    grid-area: view;
    transition: opacity .2s ease;
    overflow: unset;
  }
  &:before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: rgba($color-cyan, .2);
    mix-blend-mode: soft-light;
    pointer-events: none;
  }
}

* {
  @include setPlaceholder();
  &::selection {
    background-color: darken($color-cyan, 5%);
    color: #000;
    text-shadow: none;
  }
}

.fade-enter, .fade-leave-active { opacity: 0; }
</style>
