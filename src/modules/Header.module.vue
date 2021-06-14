<template>
  <header class="header-module-vue">
    <router-link to="/" class="logo-wrapper">
      <svg class="logo" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 1024 1280" xml:space="preserve">
        <g>
          <path d="M942.1,953.4H48.6l154.4-273l76.7-15.3l194.9-345.3l111.5,192.7l51.1-5.1l145.1,248.7l84.1,10.5   L942.1,953.4z M134.3,903.4h733.6l-36.8-90.8l-79.6-9.9L610.2,560.3l-51.2,5.1l-83.8-144.9L312,709.6l-76.7,15.3L134.3,903.4z"/>
          <polygon points="934.5,741.7 866.1,636.8 815.3,641.8 741.2,532.8 685.3,618.1 643.5,590.6 740.5,442.8    839.9,589.1 891.4,584 976.4,714.4  "/>
          <path d="M706,268.9H449.9V70.6H706l-53.5,99.2L706,268.9z M499.9,218.9h122.4l-26.5-49.2l26.5-49.2H499.9V218.9z"/>
          <rect x="449.9" y="95.6" width="50" height="274.6"/>
          <path d="M167,378H88.3v-50h33.6c9.9-24.7,34.2-42.2,62.4-42.2c37.1,0,67.2,30.1,67.2,67.2h-50   c0-9.5-7.7-17.2-17.2-17.2S167,343.5,167,353V378z"/>
          <rect x="275.6" y="328" width="63" height="50"/>
          <rect x="785.4" y="319.3" width="86.5" height="50"/>
          <rect x="903.4" y="319.3" width="54.3" height="50"/>
        </g>
      </svg>
      <div class="name">
        <span class="line-1">MILESTONE</span>
        <span class="line-2">MANAGER</span>
      </div>
    </router-link>
    <section class="navigation">
      <Button name="go-to-coursework" type="header" :href="{ name: 'coursework', query: { tab: 'recent' } }">Courseworks</Button>
    </section>
    <section class="alerts"></section>
    <section v-if="getUser !== undefined" class="account">
      <template v-if="!getUser">
        <Button name="show-login" type="header" :click="showAuthOverlay.bind(null, 'Login')">Sign In</Button>
        <Button name="show-register" type="dialog" :click="showAuthOverlay.bind(null, 'Register')">Sign Up</Button>
      </template>
      <Button v-else name="show-menu" icon="menu" type="inversed header" :click="toggleSidebar">{{ getUsername }}</Button>
    </section>
  </header>
</template>

<script>
import Auth from '../components/windows/Auth.window.vue';
import Button from '../components/Button.component.vue';

export default {
  components: { Button },
  computed: {
    getUsername() {
      return 'My Account';
    },
    getUser() {
      return this.$store.getters.getUser;
    },
  },
  methods: {
    toggleSidebar() {
      this.$store.commit('setSidebarVisibility', !this.$store.getters.getSidebarVisibility);
    },
    showAuthOverlay(name) {
      this.$store.commit('openWindow', { name, component: Auth, type: 'fullscreen' });
    },
  },
};
</script>

<style lang="scss">
.header-module-vue {
  grid-area: header;
  display: grid;
  grid-template-columns: auto 1fr auto 300px;
  grid-template-areas: "logo navigation alerts account";
  grid-column-gap: 20px;
  align-items: center;
  background: linear-gradient(to bottom, rgba($color-cyan, .1), transparent);
  padding: 0 20px;

  .logo-wrapper {
    grid-area: logo;
    display: flex;
    align-items: center;
    line-height: 24px;
    transition: opacity .2s ease;
    &:hover { opacity: .6; }
    .logo {
      position: relative;
      top: 8px;
      width: 50px;
      margin-right: 8px;
      fill: $color-cyan;
    }
    .name {
      display: flex;
      flex-direction: column;
      .line-1 {
        color: darken($color-cyan, 25%);
        font-weight: 700;
        font-size: 28px;
      }
      .line-2 {
        color: $color-cyan;
        font-weight: 400;
        font-size: 32px;
      }
    }
  }
  .navigation {
    grid-area: navigation;
    display: flex;
    align-items: center;
    &:before {
      content: "";
      position: relative;
      top: 2px; // Fix border vertical offset
      height: 60px;
      margin-right: 10px;
      border-left: 1px solid $color-cyan-border;
    }
  }
  .alerts {
    grid-area: alerts;
    font-size: 24px;
  }
  .account {
    grid-area: account;
    justify-self: right;
    display: flex;
    align-items: center;
    .btn-show-login {
      padding: 8px 20px;
      border: 1px solid;
      border-radius: 4px;
      background-color: rgba($color-cyan-bg, .2);
      font-size: 14px;
    }
    .btn-show-register { margin-left: 20px;}
  }
}
</style>
