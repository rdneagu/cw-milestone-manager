<template>
  <transition name="overlayfx" appear>
    <div v-if="$store.getters.getWindowsNum" class="overlay" @click.self="close">
      <Window v-for="(window, id) in $store.getters.getWindows" :key="window.window.name" :id="id" v-bind="window"></Window>
    </div>
  </transition>
</template>

<script>
import Window from '@/modules/Window.module.vue';

export default {
  components: {
    Window,
  },
  methods: {
    close() {
      this.$store.commit('closeWindow');
    },
  },
};
</script>

<style lang="scss">
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(#000, .6);
  transition: opacity .2s ease;
  z-index: 100;
  overflow-y: auto;
}
.overlayfx-enter, .overlayfx-leave-active { opacity: 0; }
</style>
